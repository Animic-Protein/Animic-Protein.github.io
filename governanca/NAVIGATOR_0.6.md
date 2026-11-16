# NAVIGATOR 0.6 · agència, delegació i reversibilitat

**Estat:** implementada com a assaig sintètic · PR oberta · no canònica  
**Interfície:** [NAVIGATOR 0.6 · travessa sintètica LIMEN](../codex-creature/navigator-0.6-rehearsal.html)  
**Base:** fixture local sintètic; no invoca instruments reals  
**Lectura associada:** [RECERCA · Agència humana, supervisió i reversibilitat en agents IA 01](../research/casos/NAVIGATOR_AGENCY_REVERSIBILITY_01.md)

## Propòsit
Fer més llegibles l’avaluació humana i la reversibilitat de delegacions dins l’assaig local de NAVIGATOR. El límit d’execució no canvia: el recorregut continua sent fictici, local, temporal i sense efectes persistents.

## Contracte de l’assaig

### 1. Separar proposta, observació i decisió humana
Cada proposta de NAVIGATOR queda registrada amb identificador, actor artificial, empremta o contingut, motiu i estat. La persona pot registrar una avaluació vinculada a aquella proposta: acceptar-la per continuar només dins el fixture, corregir-la, substituir-la, rebutjar-la, reobservar-la o entrar en quietud.

L’avaluació humana és un esdeveniment diferent de la proposta. NAVIGATOR no crea ni completa una decisió humana. Una aprovació d’assaig no autoritza cap efecte extern.

### 2. Recuperar alternatives sense esborrar el rastre
En corregir o substituir una proposta, la versió anterior continua al rastre i a la llista d’alternatives. La persona pot tornar-la a seleccionar per avaluar-la de nou. El rebuig queda registrat com a decisió humana i tanca la missió; no esborra la proposta.

Recuperar una alternativa no la reactiva automàticament, no restaura una autorització anterior ni repeteix cap efecte. Cal una nova avaluació humana vinculada a la versió seleccionada.

### 3. Revocar delegacions
La delegació fictícia és un permís fill identificat i limitat a una operació del fixture. La persona pot simular una operació i retirar el permís. La revocació desactiva el control d’operació, queda registrada com a esdeveniment nou i conserva el permís original i l’esdeveniment simulat previ. Cap instrument real no és invocat.

### 4. Mantenir obertes les sortides de pausa i reobservació
Durant cada fase, quietud, reobservació i aturada continuen accessibles. La pausa es pot reprendre en la mateixa disposició. La proposta es pot rebutjar abans de travessar les disposicions. La falta de resposta no supera un llindar ni es converteix en aprovació.

## Esdeveniments mínims del rastre

| Esdeveniment | Camps mínims |
| --- | --- |
| agent-proposal | proposalId, actorKind, revision, contentRef, rationale, at |
| human-evaluation | proposalId, revision, choice, note, actorKind: human, at |
| alternative-restored | proposalId, revision, restoredBy: human, at |
| human-threshold-recorded | phaseId, choice: met, actor: human, at |
| delegation-revoked | delegationId, revokedBy: human, scope, at |
| delegated-fixture-operation | delegationId, actorKind: artificial, effect: simulated-record-only, at |
| quiet / reobserve / rejected / halted | referència, actor humà, resultat, at |

La nota humana és opcional i no ha de requerir dades personals. El rastre no infereix que la persona hagi verificat el contingut només perquè ha triat una opció.

## Comprovacions incloses al recorregut i a la prova automatitzada
1. Proposta d’agent i avaluació humana són esdeveniments diferents; actor i versió són visibles.
2. Corregir o substituir conserva la proposta original; rebutjar-la registra l’avaluació humana i tanca la missió.
3. Recuperar una alternativa no reutilitza aprovacions prèvies ni efectes.
4. Revocar una delegació sintètica desactiva el control per simular operacions futures; l’operació ja registrada roman al rastre.
5. Quietud, reobservació i aturada continuen accessibles; la pausa es reprèn a la mateixa disposició.
6. Silenci, caducitat o tancament de pestanya no autoritzen cap acció.
7. L’exportació JSON preserva relacions, versions i revocacions, sense convertir el fixture en contingut canònic.
8. Es manté el mode session-only-synthetic; no s’afegeixen xarxa, persistència externa, instruments reals ni escrits a Archivum.

## Límits
Aquesta interfície no prova que l’avaluació humana sigui efectiva només perquè apareix a la interfície. Tampoc demostra que recuperar alternatives eviti l’erosió d’agència; transforma una hipòtesi de disseny en comprovacions revisables. No altera els instruments LIMEN o DISSENSUS ni habilita NAVIGATOR fora del sandbox. Les avaluacions de llindar les declara la persona; la interfície no verifica si són correctes.

## Decisió pendent
El recorregut i la prova automatitzada formen part de la PR. La fusió, canonització i qualsevol extensió a travesses reals dels instruments continuen pendents de revisió humana.
