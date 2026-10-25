# NAVIGATOR 0.1 · Contracte d’invocació en banc de proves

**Estat:** proposta operativa · local · reversible · revisable per decisió humana  
**Mode inicial:** sandbox autònom amb material sintètic  
**Actor de NAVIGATOR:** `artificial`  
**Implementació de referència:** `governanca/navigator-contract.mjs`

## Propòsit

NAVIGATOR coordina recorreguts i proves entre instruments del Còdex. Pot ser invocat per una persona o per una IA. L’invocador queda registrat per separat de l’actor: les operacions que NAVIGATOR executa sempre s’atribueixen a `actorKind: artificial`.

NAVIGATOR pot orientar una travessa, proposar una `suggestedImpulse` i executar de manera autònoma les operacions incloses en aquest contracte quan el blanc és un fixture fictici aïllat. Aquest permís no s’estén al material creatiu real.

## Cadena de la travessa

`invocador → objectiu sintètic → suggestedImpulse → operacions sandbox → provenance`

`humanDecision` és sempre `null` en una passada de NAVIGATOR. La IA pot suggerir, assajar, comparar i registrar; no pot ocupar la posició de KREATOR, decidir què es conserva com a obra ni autoritzar-se una MUTATIO real.

## Límit d’autoritat 0.1

Una operació només passa el llindar quan coincideixen la invocació activa, una operació explícitament llistada i el mateix fixture fictici que es va declarar en obrir la passada. El fixture ha d’indicar:

- `kind: fictional-fixture` i `synthetic: true`;
- `isolation: navigator-sandbox-0.1`;
- `containsUserData: false`;
- `localOnly: true`, `canonical: false` i `reversible: true`.

Les capacitats autònomes 0.1 són: observació, suggeriment, recorregut de fixture, MUTATIO de fixture, sembra de fixture, comprovació d’Homeostasis, Compost, Zajj‑viu, Retrodansa, esborrany local d’Archivum i fixtures de KREATOR RPG, LIMEN i DISSENSUS.

Queden fora del permís 0.1: operar sobre fitxers, dades o fragments creatius reals; publicar; canonitzar; escriure a Archivum real; o fer sembres persistents. Cada futura capacitat fora del sandbox requerirà un contracte específic. Una autorització humana no es pot inferir de la invocació ni conservar com a permís general.

## SuggestedImpulse i decisions

NAVIGATOR pot emetre una proposta atribuïda a l’actor artificial. En mode sandbox, pot executar les operacions fictícies incloses en el permís sense registrar una decisió humana: l’autorització prové del contracte limitat i del fixture.

Si un recorregut arriba a una decisió artística sobre material real, NAVIGATOR s’atura i retorna la proposta a la persona. Només una interacció humana explícita pot crear `humanDecision`. MUTATIO real requereix aquesta decisió vinculada a l’objecte i a l’acció concreta, segons el contracte vigent de KREATOR/MUTATIO.

## Provenance i reversibilitat

Cada invocació conserva protocol, invocador, actor, propòsit, fixture, capacitats, suggeriments i operacions executades. Les operacions mantenen `localOnly: true`, `canonical: false`, `reversible: true` i `humanDecision: null`. El tancament no promociona resultats ni els transfereix a una memòria canònica.

Si el blanc deixa de ser sintètic, la procedència és incerta o no es pot desfer una operació, NAVIGATOR rebutja el pas i retorna a `QUIES / REOBSERVE`.

## Integració gradual

1. **0.1 · Contracte executable:** invocació, suggestedImpulse, comprovació del límit de sandbox i registre de passos sobre fixtures ficticis. Les etiquetes d’operació defineixen el perímetre; encara no invoquen els instruments reals.
2. **Revisió humana:** valorar la claredat del rastre i del límit entre invocador, actor i decisió.
3. **Adaptadors per instrument:** connectar i provar cada instrument per separat, sempre amb dades de prova i una manera de desfer cada efecte.
4. **Futures capacitats reals:** considerar cada instrument i efecte en un contracte nou; cap capacitat real s’hereta automàticament del sandbox.

La implementació JavaScript és una comprovació de contracte dins el repositori; no és una barrera de seguretat davant modificacions del navegador o codi no fiable. Qualsevol connector a serveis o dades reals necessita aplicar el seu propi control d’autorització abans d’efectuar canvis.
