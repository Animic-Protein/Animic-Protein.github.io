# CONIUNCTIO β.4 · Fisiologia del Còdex

**Estat:** proposta implementada per validació
**Data:** 2026-09-07

## Principi

> El mapa no ha de mostrar tot el Còdex; ha de fer perceptible com el Còdex actua.

CONIUNCTIO β.4 deixa de tractar el territori com una col·lecció d'instruments i mostra una fisiologia de facultats. La navegació presencial continua aplicant Occam: la persona no tria entre totes les eines; el context insinua un únic òrgan pertinent.

## Fisiologia

```text
PERCEPCIÓ
Rosa · Cambra Nua
    ↓
MEMÒRIA
RECORDARE → Archivum → STRATUM
    ↓
RELACIÓ
INTER NOS · Formiga
    ↓
ORIENTACIÓ / FORMULACIÓ
MASTER → LOCUTUS → IMPULS
    ↓ suggestedImpulse
DECISIÓ
KREATOR / persona
    ↓ humanDecision
TRANSFORMACIÓ
MUTATIO → instruments autoritzats
    ↓
REGULACIÓ
Homeòstasi · Compost
    ↓
rastre → provenance → memòria → nova presència
```

## Contracte constitucional

IMPULS no decideix. IMPULS suggereix. La implementació usa `suggest()` i emet `codex:suggested-impulse` amb `canonical:false`, `reversible:true` i `decided:false`.

STRATUM entra a la fisiologia com a facultat arqueològica de memòria. Pot ser insinuat quan la necessitat és recuperar antecedents o provenance: «això ja havia aparegut?» o «d'on ve?». STRATUM no converteix la troballa en relació ni la relació en decisió.

MUTATIO transforma només després de `humanDecision`.

## Occam

La fisiologia completa és cartografia secundària. La ruta principal continua sent presencial: presència → gest/necessitat → òrgan pertinent → rastre → retorn.

## Reversibilitat

Una proposta d'IMPULS és suggeriment, no ordre ni cànon. Una excavació STRATUM no modifica l'original. La decisió continua sent humana.
