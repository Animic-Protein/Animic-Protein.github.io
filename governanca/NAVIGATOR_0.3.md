# NAVIGATOR 0.3 · traspàs fictici amb decisió humana

**Estat:** protocol de prova local · no canònic · revisable  
**Contracte executable:** `governanca/navigator-contract.mjs`  
**Adaptador:** `codex-creature/navigator-handoff-adapter.mjs`

## Abast

La primera adaptació d’efecte del NAVIGATOR prova un únic traspàs **HARMONIA → MELODIA** amb un fragment fictici dins un context de navegador efímer. Només es declara l’operació `creature.transfer.fixture`, que requereix els dos departaments.

NAVIGATOR pot preparar el recorregut, verificar que la fitxa d’origen és en estat `draft` i deixar visible el control de traspàs. No pot clicar Aprovar, seleccionar una decisió ni crear la còpia. La passada queda a `awaiting-human-decision`.

## Decisió i retorn

Una acció humana explícita a Còdex Creature és l’únic pas que pot completar el traspàs. L’adaptador només observa després el rastre del departament: l’origen passa a `transfer-approved`, la còpia apunta a l’original i l’esdeveniment d’instrument declara `human-approved`.

NAVIGATOR conserva `humanDecision: null`. No suplanta ni copia la decisió al seu registre. Pot registrar que ha observat el resultat i tancar la passada com a `completed`.

Si l’aprovació no hi és, el retorn és `human-approval-pending`; la passada es manté oberta i no es força cap resultat.

## Aïllament i reversibilitat

- S’accepta només una pàgina Còdex Creature servida des de loopback.
- La invocació exigeix un fixture sintètic declarat i els permisos HARMONIA i MELODIA.
- La prova del navegador bloqueja qualsevol origen extern i usa un BrowserContext sense perfil persistent.
- Les úniques dades alterades són les dues fitxes de fixture en el `localStorage` d’aquest context.
- La prova pot simular el clic de la interfície per verificar-ne el contracte; aquest clic sintètic **no és prova d’una decisió humana real**.
- El context s’elimina en acabar tant si la prova passa com si falla. No s’exporten les dades de fixture.

Aquesta reversió consisteix a destruir el context temporal. No habilita una escriptura de NAVIGATOR sobre dades reals ni constitueix una barrera de seguretat per a codi extern.

## Criteri d’acceptació

La prova verifica: permís conjunt dels dos departaments, gate pendent abans de l’acció, absència de còpia abans d’aprovar, rastre d’aprovació a l’instrument, integritat de l’original, procedència de la còpia, `humanDecision: null` a NAVIGATOR i absència de xarxa externa.
