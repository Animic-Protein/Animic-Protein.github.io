# MUTATIO · HISTORY TALES

## Protocol 0.1 · Història que no va passar, transformació que sí podem observar

**MUTATIO no falsifica el passat. L'obre.**

History Tales és una sèrie d'Anímic Protein · Còdex Viu que parteix d'un fet històric documentable i introdueix una sola mutació impossible, explícitament declarada com a ficció. La pregunta no és «va passar?», sinó «què transforma imaginar que hagués passat?».

### Contracte

`fet històric verificable → MUTATIO impossible → conseqüència imaginada → rastre → retorn a la història real`

Cada cas manté dos estrats inseparables:

1. **HISTÒRIA** — data, lloc, persones, objectes i fonts verificables.
2. **MUTATIO** — desviació especulativa visible i reversible.

### Llei de frontera epistemològica

> **Podem fer ciència. Podem fer ciència-ficció. Però mai farem pseudociència.**

Cap fotografia, enregistrament, cita o document generat per History Tales pot presentar-se com a evidència històrica autèntica. Les cites atribuïdes a personatges històrics només poden aparèixer com a cita real si existeix una font verificable; en cas contrari s'han d'etiquetar com a text fictici / dramatització AP.

### Regles Occam + Incertesa

- una sola mutació principal per relat;
- la ficció no substitueix la font;
- la persona decideix què relaciona i què conserva;
- tota MUTATIO és reversible;
- la incertesa es mostra, no s'amaga;
- el rastre conserva tant la història real com la desviació imaginada.

### Els quatre tests

- **Diferència perceptible** — la mutació ha de canviar realment la lectura del fet.
- **Traçabilitat** — història i ficció han de poder separar-se.
- **Relació** — la mutació ha d'activar almenys un òrgan del Còdex.
- **Reversibilitat** — retirar la ficció ha de permetre recuperar el relat històric documentat.

## Primera constel·lació

| ID | Títol | Punt històric | MUTATIO | Òrgan dominant | Estat |
|---|---|---|---|---|---|
| HT·01 | Reconciliation of the War of Currents | New York World's Fair · 1939 | Tesla presenta una reconciliació simbòlica AC/DC amb Edison representat post mortem; la Rosa apareix com a llegat impossible | Rosa de l'Escolta | BETA |
| HT·02 | The Machine That Refused to Answer | Cultura de síntesi de parla / món tecnològic de 1939 | una màquina destinada a parlar ha d'escoltar abans de respondre | INTER NOS | PROTOCOL |
| HT·03 | Elektro Stops | imaginari robòtic de la fira | el robot rep una ordre i no respon; la fallada no es repara immediatament | Compost · Error fèrtil I | PROTOCOL |
| HT·04 | The Other Futurama | visions urbanes de futur de 1939 | una ruta apareix sense destí prescrit | Instrument Z | PROTOCOL |
| HT·05 | Inside the Perisphere, Someone Waits | arquitectura i circulació de la fira | una persona interromp voluntàriament el ritme de circulació | Cambra Nua del Temps | PROTOCOL |
| HT·06 | The Night Tomorrow Went Dark | il·luminació i espectacle tecnològic de la fira | en la foscor només persisteix una Rosa diminuta | Rosa + Cambra | PROTOCOL |

Els detalls històrics de HT·02—HT·06 s'han de verificar abans de convertir cada protocol en una fitxa publicada com a relat.

## Model de dada mínim

```json
{
  "id": "HT-01",
  "kind": "history-tale",
  "history": {
    "claim": "...",
    "sources": [],
    "confidence": "verified|partial|open"
  },
  "mutatio": {
    "single_difference": "...",
    "status": "explicit-fiction"
  },
  "relation": {
    "codex_organ": "rosa|inter-nos|z|cambra|compost|centre"
  },
  "humanDecision": null,
  "provenance": {
    "source.kind": "research+generated",
    "visual_status": "speculative-reconstruction"
  },
  "reversible": true
}
```

## Inscripció canònica

> **Això no va passar. Ara observa què transforma imaginar que hagués passat.**
