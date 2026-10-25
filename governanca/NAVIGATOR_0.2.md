# NAVIGATOR 0.2 · protocols d’invocació i travessa

**Estat:** contracte operatiu de sandbox · local · no canònic · revisable  
**Actor de NAVIGATOR:** `artificial`  
**Contracte executable:** `governanca/navigator-contract.mjs`

## Funció

NAVIGATOR coordina una travessa entre instruments i deixa un rastre llegible. Pot rebre una invocació humana o artificial; l’invocador i l’actor queden diferenciats. NAVIGATOR no és un autor ni un òrgan de validació artística. Pot observar, formular una `suggestedImpulse`, assajar operacions sandbox i retornar-ne els resultats.

En aquesta versió, els adaptadors només poden observar interfícies dins contextos locals aïllats de fixtures. Els passos es registren com a simulacions: no criden les operacions d’escriptura dels instruments, no editen els seus magatzems i no converteixen una prova en una obra. El contracte és executable per provar l’abast i la procedència; no és una frontera de seguretat per a codi o connectors externs.

## Protocol d’invocació · INVOCATIO

Una invocació declara, abans de començar:

1. **Qui la demana:** `invokerKind: human | artificial`.
2. **Per què:** propòsit breu i verificable.
3. **Amb què:** fixture fictici local, reversible, sense dades d’usuari ni rang canònic.
4. **On pot passar:** llista explícita d’instruments o cambres.
5. **Què pot assajar:** llista explícita d’operacions de la passada.

Exemple de primera travessa:

```js
createNavigatorInvocation({
  invokerKind: 'human',
  purpose: 'Primera travessa sintètica de Còdex Creature',
  fixture,
  instruments: ['HARMONIA', 'MELODIA', 'RITME', 'LYRICS', 'AUDIO-VIDEO', 'MISCE', 'ARRANJAMENTS'],
  operations: [
    'observe', 'suggest', 'traverse.fixture',
    'creature.harmonia.fixture', 'creature.melodia.fixture',
    'creature.ritme.fixture', 'creature.lyrics.fixture',
    'creature.audio-video.fixture', 'creature.misce.fixture',
    'arrangement.fixture'
  ]
});
```

Els noms d’instruments i operacions són una concessió limitada a aquesta invocació. NAVIGATOR rebutja una operació que no s’hi hagi declarat, que pertanyi a un instrument absent o que apunti a un fixture diferent. La invocació no concedeix permisos per a altres passades.

El validador comprova camps declarats; no pot demostrar que un fixture rebut de fora sigui fictici. Els fixtures per a aquesta passada s’han de crear amb contingut sintètic conegut i no han de contenir cap material personal o creatiu real.

## Protocol de travessa · ITER

1. **Obrir:** validar invocador, propòsit, fixture i abast; si hi ha incertesa, no començar i tornar a `QUIES / REOBSERVE`.
2. **Orientar:** anotar què s’observa i què encara és inferència. Si la capacitat `suggest` està declarada, NAVIGATOR pot proposar una sola `suggestedImpulse` per passada.
3. **Recórrer:** registrar una operació cada vegada, dins l’instrument i el fixture declarats. La versió 0.2 registra simulació; no altera cap contingut del Còdex.
4. **Aturar-se davant decisions:** `humanDecision` roman `null`. Si el pas implica triar, aprovar, descartar, signar o transformar material creatiu real, NAVIGATOR atura la passada i retorna l’elecció a la persona autora.
5. **Tancar:** marcar `completed`, `halted` o `cancelled`, resumir què s’ha observat i deixar pendents explícits. Una passada tancada no admet més operacions.
6. **Retornar:** presentar fets observats, friccions reproduïbles, incerteses i suggeriments en camps separats. No traslladar automàticament cap resultat a Archivum ni al cànon.

## Límits i frens

- `actorKind` és sempre `artificial`; la invocació no canvia l’autoria.
- `humanDecision` és sempre `null` als registres de NAVIGATOR. Una decisió humana real ha de quedar registrada pel flux autoritzat del seu instrument i vinculada a l’objecte i l’acció concrets.
- MUTATIO, sembra, Compost, Zajj‑viu, Retrodansa, Homeostasis i Archivum només són etiquetes d’assaig sobre fixture. No habiliten cap efecte persistent ni real.
- Prohibits en 0.2: dades creatives reals, publicació, canonització, persistència, ús de credencials i escriptura a magatzems d’instruments.
- Si el fixture o la procedència no es poden verificar, si apareixen dades personals o si una operació no és reversible, rebutjar-la i tancar com a `halted`.
- La reversibilitat és un requisit del disseny de la prova; no s’ha de descriure com a “desfeta” si no s’ha provat una operació real de reversió.

## Protocol d’observació · PROVENANCE

Cada passada ha de permetre reconstruir: invocador, actor, propòsit, fixture, instruments i operacions declarades, `suggestedImpulse`, esdeveniments, estat de tancament i `humanDecision: null`. El retorn de NAVIGATOR separa:

| Camp | Contingut |
| --- | --- |
| Fet observat | Acció o resultat directament visible durant la prova |
| Inferència | Lectura provisional, identificada com a tal |
| Fricció | Pas que falla o confon, amb condicions per reproduir-lo |
| Suggeriment | Possible següent pas, sense executar sobre material real |
| Decisió humana pendent | Elecció d’autoria que NAVIGATOR no fa |

## Primera vida de NAVIGATOR

La primera travessa amb nom és una **observació de Còdex Creature** dins un navegador aïllat: sis departaments, fixture d’origen, Arranjament vinculat per referència i comprovació del veto de traspàs. L’adaptador no desa, aprova ni crea còpies; la decisió humana continua pendent. Després, es poden preparar adaptadors de lectura per a LIMEN i DISSENSUS. Una capacitat d’escriptura en qualsevol instrument requerirà una versió de protocol pròpia, proves d’efecte i reversió, i una decisió humana abans de tocar contingut creatiu.

La prova de contracte valida només el registre i els límits declarats. No acredita una travessa real dels instruments ni substitueix les seves validacions específiques.
