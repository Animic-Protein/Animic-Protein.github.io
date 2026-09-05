# KREATOR RPG · arquitectura experimental 0.1

> EXPERIMENT. No és nucli canònic del Còdex Viu. Només podrà metabolitzar-se després d'una partida real i decisió humana explícita.

## KREATOR SHEET 0.1

Cada KREATOR és una identitat operativa persistent, no un perfil psicològic.

Camps mínims:
- `id`: identitat estable (`KREATOR-1`, `KREATOR-2`...)
- `alias`: nom narratiu revisable
- `role`: arquetip provisional, mai destí ni autoritat
- `createdAt`: entrada al joc
- `movements[]`: moviments executats amb data
- `transformations[]`: moviments que han produït transformació traçable
- `diceHistory[]`: tirades, context i resultat

La fitxa registra què ha passat. No converteix freqüència, puntuació ni rol en valor, rang o cànon.

## MASTER 0.1

MASTER és una funció de situació. Pot:
- proposar una condició;
- obrir una tensió;
- limitar temporalment opcions;
- convocar una tirada quan hi ha indeterminació activa.

MASTER no pot:
- declarar significat;
- canonitzar;
- alterar provenance;
- substituir KREATOR/persona en una decisió humana requerida.

## Protocol DAUS 0.1

Dos daus romanen sempre visibles a la interfície experimental.

Cada dau pot adoptar `d6`, `d7`, `d8` o `d9` de manera independent. Una tirada:
1. registra nombre de cares de cada dau;
2. genera cada resultat uniformement entre `1..cares`;
3. mostra moviment/rotació abans de revelar el resultat;
4. conserva data, context i resultats;
5. produeix una **condició de joc**, mai una veritat ni una canonització.

### Regla constitucional

**L'atzar pot decidir quina ruta s'explora; no pot decidir què és veritat ni què entra al cànon.**

Si el resultat exigeix una acció irreversible o canònica, la tirada s'atura davant la decisió humana.

## Primera partida real

Abans de metabolitzar aquesta arquitectura al Còdex:
- executar una sessió amb almenys un KREATOR;
- conservar el rastre de moviments i tirades;
- observar si els daus produeixen diferència perceptible o només ornament;
- decidir humanament: metabolitzar, revisar o enviar al Compost.
