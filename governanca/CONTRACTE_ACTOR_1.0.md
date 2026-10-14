# CONTRACTE D’ACTOR 1.0

**Estat:** operatiu · reversible · no amplia l’autoritat del sistema  
**Àmbit inicial:** KREATOR RPG i DISSENSUS  
**Valors admesos:** `actorKind: human | artificial`

## Regla

`actorKind` declara qui ocupa la posició activa de la travessa. No descriu una identitat psicològica ni atorga rang.

Una propietat `humanDecision` només pot existir quan es compleixen alhora dues condicions:

1. `actorKind === "human"`;
2. KREATOR ha abandonat l’estat `pending` mitjançant una elecció explícita.

Si KREATOR continua `pending`, el resultat és `humanDecision: null`. Si l’actor és `artificial`, pot observar, proposar o deixar rastre sota aquesta atribució, però no pot registrar una decisió humana ni autoritzar MUTATIO.

## Cadena preservada

`font → suggestedImpulse → actorKind → humanDecision? → MUTATIO o closure → provenance`

El signe `?` és constitucional: la decisió humana pot no existir. L’absència no es reomple amb una inferència, un valor per defecte, una tirada o una decisió artificial.

## Implementació mínima

- `governanca/actor-contract.mjs` conté l’enumeració i el llindar compartit.
- KREATOR RPG exporta `actorKind`, fixa el tipus d’actor quan comença la travessa i rebutja `pending`.
- DISSENSUS conserva `actorKind`; una passada artificial no pot escriure `humanDecision`.
- Les proves exigeixen que `pending` i `artificial` produeixin `humanDecision: null`.

## Límit

Aquesta revisió no declara que una IA sigui una persona, observadora humana o autora d’una decisió humana. Tampoc transforma una proposta artificial en autorització. La decisió continua pertanyent a la persona.
