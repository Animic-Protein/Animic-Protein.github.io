# NAVIGATOR backend · desplegament i permisos

**Estat del codi:** backend pilot proposat a NAVIGATOR 0.9.  
**Estat del servei:** no desplegat. El projecte Supabase consultat està inactiu.  
**Zona executora:** només `Animic-Protein/Animic-Protein.github.io`.

## Què hi ha al codi

- Funció Edge `navigator-github` amb JWT de Supabase Auth i identitat GitHub vinculada.
- Mandats persistents de 15 minuts com a màxim, fins a 12 operacions i revocació explícita.
- Registre persistent amb identificador de petició únic, empremta SHA-256, decisió humana i resultat.
- Consum atòmic del pressupost del mandat; una petició repetida és rebutjada.
- Token d’instal·lació GitHub App de curta durada, creat al servidor i limitat a la instal·lació.
- Canvis de fitxers només en branques `navigator/*`; creació de PRs sempre en esborrany.
- `pull-request.merge` exigeix aprovació humana fresca, PR obert, capçalera exacta i totes les comprovacions de commit verdes.
- `pages.deploy` només pot iniciar el workflow que coincideixi amb `NAVIGATOR_PAGES_WORKFLOW` i amb la llista explícita `NAVIGATOR_ALLOWED_WORKFLOWS`.
- La fusió i el desplegament no s’executen automàticament després d’una altra acció.

El backend no accepta URLs arbitràries ni altres repositoris. Les credencials no formen part del repositori ni de Safari.

## Configuració necessària

1. Reactiva el projecte Supabase des del seu tauler. Comprova el pla i qualsevol cost abans de confirmar.
2. A Supabase Auth, configura GitHub com a proveïdor d’inici de sessió i registra el callback de Pages:
   `https://animic-protein.github.io/`.
3. Crea una GitHub App i instal·la-la només a `Animic-Protein/Animic-Protein.github.io`. Concedeix només els permisos de repositori necessaris: Metadata read, Contents read/write, Issues read/write, Pull requests read/write, Actions read/write i Checks read. No li concedeixis permisos d’organització ni d’administració de repositoris.
4. A Supabase Edge Function secrets, configura:
   - `GITHUB_APP_ID`
   - `GITHUB_APP_INSTALLATION_ID`
   - `GITHUB_APP_PRIVATE_KEY`
   - `NAVIGATOR_ALLOWED_WORKFLOWS` com a JSON amb noms exactes de workflows i refs permeses, per exemple `{"validate.yml":["main"],"pages.yml":["main"]}` (substitueix pels noms reals del repositori)
   - `NAVIGATOR_PAGES_WORKFLOW` amb el nom exacte del workflow de Pages.
5. Aplica `supabase/migrations/20261120000000_navigator_backend.sql` i desplega `supabase/functions/navigator-github/index.ts` amb verificació JWT activada.
6. Integra la interfície de NAVIGATOR amb la funció: inici de sessió GitHub, emissió i revocació de mandat, vista prèvia de l’empremta i un botó d’aprovació separat per a cada operació. Mantén el flux local/offline i mostra `not-executed` fins que arribi una resposta autenticada del backend.

**No copiïs cap clau privada ni service-role key a GitHub, a la pàgina, als JSON de rastre o al xat.** La service-role key només s’utilitza al servidor i no es retorna a la interfície.

## Operacions pilot

Exploració: `repository.read`, `repository.list`, `pull-request.read`, `issue.read`, `workflow.status.read`.

Canvis revisables: `branch.create`, `file.create`, `file.update`, `issue.create`, `issue.comment.create`, `pull-request.draft.create`.

Workflows i efectes finals amb aprovació individual: `workflow.dispatch`, `workflow.rerun`, `pull-request.merge`, `issue.close`, `release.create`, `pages.deploy`.

La instal·lació de GitHub App ha de tenir el privilegi mínim i cada mandat ha de concedir només les operacions necessàries per a aquella travessa. Cap capability del catàleg és un permís permanent.
