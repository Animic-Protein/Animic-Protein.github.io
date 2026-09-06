# STRATUM 1.2 · Instrumentum Archaeologiae

**Estat:** instrument transversal provisional  
**Corpus:** Corpus instrumentalis  
**Data:** 2026-09-06

## Definició

STRATUM és l'instrument transversal del Còdex Viu per **excavar, recuperar i mostrar antecedents, genealogies documentades i línies candidates** entre materials ja existents sense substituir-los, fusionar-los ni decidir-ne el significat.

La implementació web 1.2 fa recuperació textual sobre corpus local verificat i mostra genealogies explícitament documentades. No afirma tenir un motor semàntic autònom de comparació, contradicció o reconstrucció genealògica.

## Axiomes

> **Excavar és recuperar sense substituir, relacionar sense fusionar i mostrar la genealogia sense decidir-ne el sentit.**

> **Trobar no equival a relacionar; relacionar no equival a decidir.**

Una coincidència és un antecedent candidat, no una genealogia demostrada ni una relació significativa.

## Facultat principal

`EXCAVAR`

Una excavació pot partir d'una paraula, frase, fragment, node, instrument, font, rastre, context actiu o identificador disponible al corpus.

## Abast implementat en 1.2

STRATUM 1.2 pot:
- cercar coincidències textuals i antecedents candidats;
- filtrar el corpus local per estrat;
- mostrar estat, certesa i provenance disponible;
- mostrar línies `ancestor → mutation → descendant` quan ja estan documentades;
- marcar `uncertain-lineage` quan el rastre és insuficient;
- retornar un rastre d'excavació efímer al context invocador;
- declarar `missing-stratum` quan no hi ha resultats rastrejables;
- declarar `insufficient-provenance` quan hi ha rastre però no prou provenance per elevar-lo a genealogia documentada;
- ser invocat transversalment sense abandonar l'instrument actiu.

## Capacitats no implementades encara

STRATUM 1.2 **no afirma**:
- detectar contradiccions automàticament;
- comparar semànticament formulacions successives;
- reconstruir genealogies noves per inferència;
- ordenar temporalment materials sense dades temporals explícites;
- consultar Airtable directament des del navegador;
- decidir si una relació és significativa.

Aquestes capacitats només poden aparèixer en una versió posterior amb provenance i criteris verificables.

## Estats de buit i incertesa

- `missing-stratum`: cap estrat rastrejable per a la consulta actual.
- `insufficient-provenance`: existeix un rastre o coincidència, però no prou evidència per documentar una genealogia.
- `uncertain-lineage`: hi ha una línia candidata amb ancestor/mutation/descendant, però la seva equivalència o continuïtat no és prou forta.

Cap d'aquests estats es resol omplint el buit amb una reconstrucció fictícia.

## Arquitectura funcional

```text
CONTEXT / PREGUNTA / RASTRE
          ↓
      STRATUM · EXCAVAR
          ↓
 coincidències candidates
          ↓
 genealogia documentada / uncertain-lineage / missing-stratum
          ↓
 provenance + incertesa visible
          ↓
 rastre reversible al node d'origen
          ↓
 KREATOR decideix què fer-ne
```

## Relació amb altres facultats

**RECORDARE** captura el que està passant.  
**ARCHIVUM** conserva el que ha quedat.  
**STRATUM** excava el que ja existeix.  
**Memòria semàntica** relaciona recurrències i proximitats.  
**MASTER** situa.  
**LOCUTUS** formula.  
**KREATOR** decideix.  
**MUTATIO** transforma només si és autoritzada.

## Occam

Un únic instrument d'excavació serveix tot el Còdex. Cap òrgan ha de construir un motor genealògic propi si STRATUM pot ser invocat.

## Reversibilitat

Excavar no modifica el material excavat. Els rastres d'excavació són `canonical:false`, `reversible:true` i `decided:false`.

## Arqueologia impossible

La **Cambra VII · Arqueologia impossible** és antecedent artístic i cas arqueològic, no sinònim de STRATUM.

## Corpus instrumentalis

Nom complet: **STRATUM · Instrumentum Archaeologiae**  
Nom d'ús: **STRATUM**
