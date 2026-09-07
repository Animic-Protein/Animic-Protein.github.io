# GENERATORIUM · SONUS 0.1

**Estat:** prototip executable per validació
**Instrument inicial:** Looperum β·06
**Data:** 2026-09-07

## Salt

GENERATORIUM no és un nou òrgan visible del Còdex. És una capa de motors invocables sota MUTATIO. Un generador produeix un fenomen perceptible; no decideix el seu sentit.

## Primer motor

`SONUS` observa una acció humana executable a Looperum i emet un contracte `codex:generated-phenomenon` amb:

- font atribuïda;
- operació temporal (`forward`, `loop`, `reverse`, `versarium`);
- IN / OUT;
- velocitat;
- instrument i versió del generador;
- moment de generació;
- `canonical:false`;
- `reversible:true`;
- `decided:false`.

El binari original no s'incorpora ni es modifica per aquesta emissió.

## Contracte fisiològic

```text
IMPULS suggereix
    ↓ suggestedImpulse
KREATOR / persona decideix
    ↓ humanDecision
MUTATIO autoritza una operació
    ↓
GENERATORIUM · SONUS
    ↓
fenomen perceptible + provenance
    ↓
RECORDARE / Archivum / STRATUM poden recordar-lo
```

En SONUS 0.1 l'autorització és estrictament una interacció humana amb els controls de Looperum. No hi ha autoexecució a partir d'un `suggestedImpulse`.

## Occam

No es crea un segon motor d'àudio. Looperum conserva el motor temporal existent i GENERATORIUM només normalitza la sortida com a fenomen traçable.

## Límit 0.1

SONUS 0.1 no canonitza, no interpreta, no relaciona i no decideix. Tampoc desa automàticament el fenomen a Archivum. Aquesta separació permet provar primer que el contracte de generació és real i reversible.
