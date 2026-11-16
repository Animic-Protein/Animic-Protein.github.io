# NAVIGATOR 0.6 · agència, delegació i reversibilitat

**Estat:** proposta d’assaig per revisar · no canònica · no implementada com a capacitat persistent  
**Base:** NAVIGATOR 0.5, sandbox local amb fixtures sintètics  
**Lectura associada:** [RECERCA · Agència humana, supervisió i reversibilitat en agents IA 01](../research/casos/NAVIGATOR_AGENCY_REVERSIBILITY_01.md)

## Propòsit
Fer més llegibles l’avaluació humana i la reversibilitat de delegacions dins l’assaig local de NAVIGATOR. El límit d’execució no canvia: el recorregut continua sent fictici, local, temporal i sense efectes persistents.

## Contracte proposat

### 1. Separar proposta, observació i decisió humana
Cada proposta de NAVIGATOR queda registrada amb identificador, actor artificial, empremta o contingut, motiu i estat. La persona pot registrar una avaluació vinculada a aquella proposta: acceptar-la per continuar només dins el fixture, corregir-la, substituir-la, rebutjar-la, reobservar-la o entrar en quietud.

L’avaluació humana és un esdeveniment diferent de la proposta. NAVIGATOR no crea ni completa una decisió humana. Una aprovació d’assaig no autoritza cap efecte extern.

### 2. Recuperar alternatives sense esborrar el rastre
En corregir, substituir o rebutjar una proposta, la versió anterior continua al rastre com a alternativa amb estat explícit. La persona pot tornar-la a seleccionar per avaluar-la de nou.

Recuperar una alternativa no la reactiva automàticament, no restaura una autorització anterior ni repeteix cap efecte. Cal una nova avaluació humana vinculada a la versió seleccionada.

### 3. Revocar delegacions
Una delegació és un permís fill identificat i limitat a un subconjunt del mandat. La persona pot retirar-la abans del tancament. La revocació bloqueja operacions futures de la invocació filla, queda registrada com a esdeveniment nou i conserva el permís original i les activitats prèvies. No desfà per si sola cap efecte ja produït.

En l’assaig actual no hi ha operacions reals; la revocació es prova només sobre estat sintètic.

### 4. Mantenir obertes les sortides de DISSENSUS
Durant cada fase, quietud, reobservació, rebuig i aturada continuen accessibles. La falta de resposta, el temps esgotat o el tancament de la vista no es converteixen en aprovació. La resposta absent conserva l’estat pendent o tancat sense efecte.

## Esdeveniments mínims del rastre

| Esdeveniment | Camps mínims |
| --- | --- |
| agent-proposal | proposalId, actorKind, revision, contentRef, rationale, at |
| human-evaluation | proposalId, revision, choice, note, actorKind: human, at |
| alternative-restored | proposalId, revision, restoredBy: human, at |
| delegation-revoked | delegationId, revokedBy: human, scope, at |
| quiet / reobserve / rejected / halted | referència, actor humà, resultat, at |

La nota humana és opcional i no ha de requerir dades personals. El rastre no infereix que la persona hagi verificat el contingut només perquè ha triat una opció.

## Comprovacions d’acceptació abans de considerar-ho implementat
1. Proposta d’agent i avaluació humana són esdeveniments diferents; actor i versió són visibles.
2. Corregir, substituir o rebutjar conserva la proposta original i la seva procedència.
3. Recuperar una alternativa no reutilitza aprovacions prèvies ni efectes.
4. Revocar una delegació bloqueja operacions futures de la filla; les anteriors romanen al rastre.
5. Quietud, reobservació, rebuig i aturada continuen accessibles durant la missió i amb una petició pendent.
6. Silenci, caducitat o tancament de pestanya no autoritzen cap acció.
7. Exportació i importació preserven relacions, versions i revocacions, sense convertir el fixture en contingut canònic.
8. Es manté el mode session-only-synthetic; no s’afegeixen xarxa, persistència externa, instruments reals ni escrits a Archivum.

## Límits
Aquesta proposta no prova que l’avaluació humana sigui efectiva només perquè apareix a la interfície. Tampoc demostra que recuperar alternatives eviti l’erosió d’agència; transforma una hipòtesi de disseny en comprovacions revisables. No altera el contracte 0.5 ni habilita NAVIGATOR fora del sandbox.

## Decisió pendent
La interfície i les comprovacions d’acceptació encara s’han d’implementar. Fins llavors, aquest document és una especificació de revisió, no una capacitat disponible.
