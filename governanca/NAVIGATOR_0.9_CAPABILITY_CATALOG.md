# NAVIGATOR 0.9 · catàleg ampliat de competències

**Estat:** proposta per a revisió; no amplia permisos actius ni executa operacions.  
**Zona pilot:** `github:Animic-Protein/Animic-Protein.github.io`  
**Principi:** competència àmplia, mandat concret, efecte traçable i decisió humana al llindar.

NAVIGATOR ha de poder completar travesses de principi a fi quan disposa de les eines i dels permisos corresponents. El límit és explícit: cap capacitat d’aquest catàleg s’activa només perquè existeixi en el programa. Cada execució exigeix mandat vigent, zona exacta, operació i recurs concrets, validació al servidor i rastre verificable.

## Catàleg proposat

| Àrea | Capacitats | Llindar |
| --- | --- | --- |
| Explorar | `repository.read`, `repository.list`, `workflow.status.read`, `pull-request.read`, `issue.read` | Mandat de lectura al repositori exacte |
| Preparar | `patch.prepare`, `branch.prepare`, `issue.draft.prepare`, `pull-request.draft.prepare`, `workflow.dispatch.prepare` | NAVIGATOR pot preparar i validar; no produeix efecte remot |
| Escriure de manera reversible | `branch.create`, `file.create`, `file.update`, `issue.create`, `issue.comment.create`, `pull-request.draft.create` | Aprovació humana d’un sol ús lligada a l’empremta exacta |
| Executar fluxos | `workflow.dispatch`, `workflow.rerun` | Aprovació humana exacta; workflow, ref i inputs inclosos a l’empremta |
| Canviar estat compartit | `pull-request.ready`, `pull-request.merge`, `issue.close`, `release.create`, `pages.deploy` | Confirmació humana final per operació, després de mostrar l’efecte previst i l’estat de validació |
| Revocar i aturar | `mandate.revoke`, `execution.cancel`, `deployment.rollback.prepare` | La revocació és immediata; rollback requereix una aprovació pròpia |

Les capacitats d’escriptura i d’efecte compartit són propostes de catàleg. La zona NAVIGATOR 0.7 actual només contempla lectura, preparació local i una sol·licitud de PR en esborrany. La NAVIGATOR 0.8 actual només executa una lectura autenticada manual.

## Regles comunes d’execució

1. **Mandat mínim i explícit.** Cada mandat identifica persona autenticada, repositori exacte, capacitats concedides, límit de peticions i caducitat. No s’admeten comodins.
2. **Autorització vinculada a l’acció.** La persona aprova una operació concreta després de veure repositori, recurs, diferència o inputs, efecte esperat i empremta. Canviar qualsevol d’aquests camps invalida l’aprovació.
3. **Separació d’identitat i decisió.** El servidor autentica l’actor i comprova els permisos reals de GitHub. Un camp local que declari `actorKind: human` no és prova d’identitat.
4. **Execució idempotent.** Un registre persistent rebutja reús de peticions, mandats revocats, expirats o ja consumits. Cada resultat inclou actor, temps, workflow run, commit i identificadors de l’efecte.
5. **Permisos per acció.** L’adaptador obté el privilegi mínim necessari per a una única operació. No s’utilitza un token ampli ni es comparteixen credencials amb Safari.
6. **Validacions abans dels efectes.** Els workflows exigits (validació, tests o revisió de diferències) han de passar abans de permetre fusió o desplegament.
7. **No hi ha efecte silenciós.** NAVIGATOR retorna `prepared`, `awaiting-human`, `executing`, `executed`, `failed`, `denied` o `revoked`. No converteix una proposta en una acció sense informar-ho.
8. **Dissens i quietud.** La persona pot corregir, rebutjar, revocar o aturar en qualsevol llindar. No hi ha penalització ni avançament implícit.
9. **Offline garantit.** Sense connexió es poden preparar i exportar propostes locals. La interfície les marca com no executades i no simula una confirmació del servidor.

## Límits del pilot

- Només el repositori declarat i els workflows enumerats explícitament.
- Sense permisos d’organització, repositoris arbitraris, gestió de secrets, canvis de permisos, canvis de protecció de branques, eliminacions, transferències ni publicacions a destinataris externs.
- Sense fusió o desplegament automàtics per NAVIGATOR. Pot preparar-los i comprovar condicions; la persona autoritza l’efecte final cada vegada.
- Qualsevol ampliació a un altre repositori, servei o operació requereix una nova zona, revisió i mandat.

## Seqüència d’implementació

1. **Base de confiança:** servei actiu, autenticació GitHub comprovable, registre persistent d’un sol ús i retorn del resultat a la interfície.
2. **Lectura integrada:** eliminar el copiar/enganxar del JSON i mostrar el contingut i el rastre de resultat a NAVIGATOR.
3. **Canvis revisables:** preparar branca, diferència i PR en esborrany; no fusionar.
4. **Workflows:** llistar estat, iniciar workflows enumerats amb inputs validats i recuperar els resultats.
5. **Efectes finals:** afegir fusió i Pages deploy separadament, amb confirmació humana fresca i proves verdes.

L’existent projecte Supabase associat a Anímic Protein està inactiu en la revisió d’aquesta proposta. La integració directa de navegador necessita un backend desplegat i credencials guardades al servei; aquest document no reactiva cap servei ni configura credencials. El flux manual GitHub Actions de NAVIGATOR 0.8 continua essent el camí disponible per a `repository.read`.

## Evidència i estat

Aquesta proposta no altera el contracte NAVIGATOR 0.7, no canvia permisos del repositori i no executa lectures, escriptures, fusions ni desplegaments. Cada operació futura s’ha d’implementar i validar separadament contra aquest catàleg.
