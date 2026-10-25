# NAVIGATOR 0.3 · Assaig manual del gate

**Estat:** runner local revisable · fixture fictici · no canònic  
**Comanda:** `npm run navigator:rehearsal`

## Objectiu

Comprovar el pas HARMONIA → MELODIA a Còdex Creature amb una decisió feta directament per la persona a la interfície. El runner obre Creature en una instància Chromium nova i efímera, prepara un fragment de prova abans del primer render i s’atura al control del traspàs.

## Recorregut

1. El runner obre una invocació humana amb actor NAVIGATOR artificial, fixture local i abast HARMONIA / MELODIA.
2. NAVIGATOR registra una única `suggestedImpulse` i crida l’adaptador `prepareCreatureFixtureHandoff`, que prepara el fixture i deixa el gate pendent.
3. La interfície presenta el fragment sintètic `fixture:navigator-manual-source`, amb destinació inicial MELODIA. La persona pot aprovar, retornar o descartar; NAVIGATOR no activa cap control.
4. Si s’aprova, `observeCompletedCreatureFixtureHandoff` comprova la còpia i la procedència. Retornar, descartar o cancel·lar tanquen la passada com a `halted` o `cancelled`, sense forçar un resultat positiu.
5. El runner conserva la sortida humana observada en un camp separat, tanca la passada amb `humanDecision: null`, imprimeix un resum JSON al terminal i destrueix el context del navegador.

Per cancel·lar abans d’actuar, tanca la pestanya o prem `Ctrl+C`. Si s’aprova, Creature crea una còpia només dins del navegador efímer. Retornar i descartar també modifiquen únicament el fixture temporal. Cap de les opcions toca les dades locals habituals, cap fitxer de treball ni el repositori.

## Límits verificables

- El servidor només escolta a `127.0.0.1`, serveix la pàgina de Còdex Creature amb `GET` i no escriu fitxers.
- El context Chromium no reutilitza el perfil habitual i talla les peticions fora de l’origen local assignat.
- El runner no envia cap contingut a xarxa ni desa el rastre; el resum queda al terminal.
- `humanActionObserved` reflecteix el registre que Creature va observar. `navigatorPass.humanDecision` roman `null`.
- Destruir el context elimina les dades del fixture. Això prova l’aïllament de la passada; no prova una reversió d’escriptures en cap instrument persistent.
- La passada no conté material creatiu real i no autoritza cap adaptador d’escriptura persistent.
