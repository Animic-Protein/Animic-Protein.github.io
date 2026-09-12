# IMPULS 1.1 · Llindar de resposta

**Estat:** implementació experimental reversible  
**Data:** 12 de setembre de 2026  
**Àmbit:** Universe · CONIUNCTIO β.4

## Fricció detectada

IMPULS ja podia formular `codex:suggested-impulse` com una proposta reversible, no canònica i no decidida. Però l'accés «Seguir aquest gest» navegava sense conservar de manera explícita la diferència entre la proposta del Còdex i la decisió de la persona.

## Decisió

IMPULS no adquireix poder de decisió. Evoluciona únicament el seu contracte de sortida perquè la persona pugui:

- acceptar la proposta;
- desviar-se i escollir una altra direcció;
- deixar quiet el material.

Desviar-se no executa cap acció: revela alternatives. La navegació només pot començar després d'una elecció humana concreta.

## Contracte operatiu

`senyals → suggestedImpulse → humanDecision → efecte → provenance`

Cada proposta rep un identificador de sessió i conserva:

- estat, formulació, ruta suggerida i instant d'emissió;
- `canonical:false`;
- `reversible:true`;
- `decided:false`.

Cada resposta crea un registre separat amb:

- acció humana;
- `acceptedSuggestion:true|false`;
- instant de decisió;
- efecte `navigate|remain`;
- procedència `impulse-response`.

## Memòria i límits

Els registres viuen només a `localStorage`, sota `animic.codex.impulse-decisions/v1`, amb un màxim de vint decisions recents.

Aquesta memòria:

- no canonitza;
- no escriu a Archivum;
- no transfereix binaris;
- no converteix IMPULS en KREATOR;
- no autoritza MUTATIO automàticament;
- pot eliminar-se netejant la memòria local del navegador.

## Principi preservat

> El Còdex proposa. La persona decideix. La discrepància roman oberta.

IMPULS formula; KREATOR/persona respon; només després pot existir una acció amb provenance.
