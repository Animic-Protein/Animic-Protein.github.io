# NAVIGATOR 0.8 · adaptador de lectura autenticada

**Estat:** proposta executable per a revisió · sense fusió ni desplegament automàtics  
**Zona:** `github:Animic-Protein/Animic-Protein.github.io`  
**Única operació executada:** `repository.read`

## Com funciona

La pàgina estàtica no conté credencials i no crida serveis externs. La persona exporta el rastre de NAVIGATOR i inicia manualment el workflow `NAVIGATOR 0.8 · lectura autenticada de zona` des de GitHub, amb la sessió GitHub autenticada i sobre `main`.

El workflow rep el JSON i l’identificador exacte de la petició. Abans de llegir, comprova:

- format del rastre, mandat humà actiu i no caducat;
- repositori i zona exactes;
- presència de `repository.read`;
- petició autoritzada, pendent d’adaptador i encara no executada;
- coincidència entre mandat, petició, empremta SHA-256 i esdeveniment registrat;
- ruta exacta segura dins del repositori.

Després consulta només el contingut d’aquella ruta amb el `GITHUB_TOKEN` del workflow, limitat a `contents: read`. El run ha d’anar a `main`; no es concedeixen permisos d’escriptura. La sortida del workflow mostra el contingut llegit i un registre `navigator-zone-read-result/v1` amb petició, empremta, actor GitHub, run, commit i SHA del blob. Aquesta sortida és separada del JSON original: no el modifica.

## Límit d’autenticació i reús

GitHub autentica la persona que inicia el workflow i exigeix permís per executar Actions al repositori. Tanmateix, la selecció «mandat humà» dins la pàgina continua sent local i no queda criptogràficament vinculada a aquell compte.

El workflow valida el pressupost i l’estat que declara el JSON, però no manté un registre durador de peticions consumides. Per tant, el mateix JSON es podria tornar a presentar mentre el mandat no hagi caducat. El resultat sempre és una lectura d’un repositori públic; no habilita cap escriptura. Un registre d’ús d’un sol cop requeriria un servei persistent separat.

## Recorregut manual

1. Després de publicar aquesta proposta, obre NAVIGATOR 0.7 a Safari amb connexió i emet un mandat nou que inclogui només `repository.read`.
2. Prepara una petició per al recurs exacte i exporta el JSON.
3. A GitHub, obre Actions → `NAVIGATOR 0.8 · lectura autenticada de zona` → Run workflow a `main`.
4. Enganxa el JSON exportat i l’ID exacte de la petició `repository.read`; inicia el workflow.
5. Revisa el resum del run: ha de mostrar `executed`, el mateix recurs i empremta, l’actor autenticat i el contingut llegit.
6. Revoca el mandat a NAVIGATOR. La sortida del workflow conserva l’evidència de lectura; el rastre local pot dissoldre’s després.

Si falla qualsevol comprovació, el workflow acaba abans de cridar l’API de continguts. Les operacions `pull-request.merge`, `pages.deploy`, preparació de canvis i escriptura no formen part de l’adaptador.
