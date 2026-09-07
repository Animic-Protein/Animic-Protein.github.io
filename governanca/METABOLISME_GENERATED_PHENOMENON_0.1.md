# METABOLISME · GENERATED PHENOMENON 0.1

**Estat:** prototip executable per validació  
**Origen inicial:** GENERATORIUM · SONUS 0.1 / Looperum β·06  
**Data:** 2026-09-07

## Principi

> Generar no equival a percebre; percebre no equival a relacionar; relacionar no equival a decidir; decidir no equival a canonitzar.

Un `generated-phenomenon` torna al Còdex com a presència no canònica. El receptor no interpreta el fenomen: proposa una única ruta perceptiva pertinent i espera una decisió humana.

## Ruta mínima

```text
font
  ↓
KREATOR / persona
  ↓ humanDecision
MUTATIO
  ↓
GENERATORIUM · SONUS
  ↓ generated-phenomenon
RECEPTOR METABÒLIC
  ↓ suggestedRoute
KREATOR / persona
  ├─ observar
  ├─ conservar → RECORDARE
  └─ deixar quiet
```

## Occam perceptiu

En 0.1 només hi ha una derivació suggerida:

- `forward` / `loop` → **Rosa de l'Escolta**: primer escoltar el fenomen;
- `reverse` / `versarium` → **Cambra Nua del Temps**: la diferència principal és temporal.

La Formiga no apareix per defecte. Un fenomen sol no demostra una relació significativa.

## Decisió i memòria

El receptor emet `codex:generated-phenomenon-received` amb `canonical:false`, `reversible:true`, `decided:false`.

Només una acció explícita de la persona emet `codex:human-decision`. Conservar invoca RECORDARE; no converteix el fenomen en cànon ni importa automàticament el binari a Archivum.

## Límit 0.1

Aquesta versió no interpreta, no crea relacions, no activa Formiga automàticament, no canonitza i no decideix. Demostra únicament el retorn executable:

**generació → percepció proposada → decisió humana → possible memòria.**
