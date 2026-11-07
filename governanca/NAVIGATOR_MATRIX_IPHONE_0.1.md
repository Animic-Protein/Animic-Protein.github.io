# NAVIGATOR MATRIX · Llindar mòbil per a iPhone 0.1

**Ruta:** `codex-creature/?navigator-matrix=1#matrix`  
**Estat:** assaig browser · local a la pestanya · sintètic · reversible · no canònic  
**Contracte de referència:** `NAVIGATOR-MATRIX-0.4`

## Funció

Permetre que una persona emeti des de Safari un mandat MATRIX amb:

- missió explícita;
- fins a cinc prioritats afegides;
- pressupost de cicles, revisions i esdeveniments;
- caducitat de 15, 30 o 60 minuts;
- abast fix `CODEX_CREATURE`;
- operació fixa `codex.patch.reversible`.

El llindar invoca després NAVIGATOR com a `actorKind: artificial` sobre un fixture separat i permet comprovar una aplicació reversible i una Retrodansa exacta.

## Separació de dades

- El rastre usa exclusivament `sessionStorage` amb la clau `codex-navigator-matrix-iphone-v1`.
- No llegeix ni escriu `codex-creature-fragments-v1` ni `codex-creature-arrangements-v1`.
- Les tres variacions disponibles són sintètiques i predefinides; el formulari no accepta contingut creatiu lliure per al fixture.
- Tancar la pestanya o prémer «Dissoldre el rastre» retira mandat, sessió i fixture.
- L’exportació JSON és una acció humana i no publica ni sincronitza res.

## Autoritat

El clic humà emet el mandat inicial. NAVIGATOR pot aplicar la variació escollida i executar la Retrodansa sense generar una nova decisió perquè ambdues accions són locals, sintètiques i reversibles.

`humanDecision` roman `null`. Això no significa absència d’agència humana: significa que no s’ha travessat cap frontera de persistència, material real, xarxa, publicació, cànon o irreversibilitat.

Qualsevol ampliació cap a aquestes fronteres queda fora del llindar 0.1 i exigeix una decisió humana exacta i separada.

## Criteris d’acceptació

La prova mòbil ha de demostrar:

1. mandat humà vàlid i prioritats constitucionals al davant;
2. invocació artificial amb `humanDecision: null`;
3. variació perceptible només sobre el fixture de sessió;
4. Retrodansa amb empremta exacta;
5. exportació JSON manual;
6. dissolució completa del rastre;
7. immutabilitat dels fragments i arranjaments habituals;
8. absència de xarxa externa i funcionament offline.
