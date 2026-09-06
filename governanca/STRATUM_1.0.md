# STRATUM 1.2 · Instrumentum Archaeologiae

**Estat:** instrument transversal provisional  
**Corpus:** Corpus instrumentalis  
**Data:** 2026-09-06

## Definició

STRATUM és l'instrument transversal del Còdex Viu per **excavar, recuperar, comparar i mostrar genealogies documentades o línies candidates** entre materials ja existents sense substituir-los, fusionar-los ni decidir-ne el significat.

STRATUM no és Archivum, no és una memòria, no és un glossari i no és un cercador genèric. Interroga els estrats conservats i retorna antecedents, mutacions, contradiccions, ressonàncies i provenance disponible.

## Axiomes

> **Excavar és recuperar sense substituir, relacionar sense fusionar i mostrar la genealogia sense decidir-ne el sentit.**

> **Trobar no equival a relacionar; relacionar no equival a decidir.**

Una coincidència és un antecedent candidat, no una genealogia demostrada ni una relació significativa.

## Facultat principal

`EXCAVAR`

Una excavació pot partir d'una paraula, aforisme, fragment, node, instrument, relació, font, transformació, decisió, absència, rastre, identificador de provenance o context actiu del Còdex.

## Estrats inicials

STRATUM pot excavar **Archivum**, **Sediment verbal**, **Vocabulari Viu**, **Glossae Vivens**, **Latinismes**, **GitHub**, **Airtable** i altres fonts incorporades amb provenance suficient. La implementació web actual recupera un corpus local verificat; no afirma sincronització directa amb Airtable.

## Operacions

STRATUM pot cercar aparicions i antecedents; ordenar resultats; mostrar línies `ancestor → mutation → descendant`; exposar divergències i contradiccions; recuperar ressonàncies documentades o candidates; retornar context d'origen; comparar formulacions; exposar `insufficient-provenance`, `missing-stratum` i `uncertain-lineage`; i ser invocat transversalment.

Una línia només es presenta com a **genealogia documentada** quan disposa de provenance suficient. Una relació reconstruïda a partir d'un rastre de sessió o desenvolupament sense registre extern suficient roman **uncertain-lineage**.

STRATUM no pot canonitzar, substituir versions, declarar relacions significatives per similitud, inventar provenance, convertir glosses en definicions canòniques, decidir quin estrat és correcte ni executar MUTATIO.

## Arquitectura funcional

```text
CONTEXT / PREGUNTA / RASTRE
          ↓
      STRATUM · EXCAVAR
          ↓
  fonts i estrats disponibles
          ↓
 coincidències candidates
          ↓
 genealogies documentades / uncertain-lineage
          ↓
 incertesa + provenance visible
          ↓
 retorn contextual al node d'origen
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

## Invocació transversal

L'acció mínima és `Excavar`. La invocació no obliga a abandonar l'instrument actiu: preserva el context d'origen i hi retorna el rastre de l'excavació. El rastre és `canonical:false`, `reversible:true` i `decided:false`.

## Incertesa

Si hi ha estrats incompatibles, STRATUM els presenta en paral·lel. La contradicció és informació. Si no hi ha provenance suficient, ho declara; l'absència de rastre no s'omple amb una reconstrucció fictícia.

## Occam

Un únic instrument d'excavació serveix tot el Còdex. Cap òrgan ha de construir un motor genealògic propi si STRATUM pot ser invocat.

## Reversibilitat

Excavar no modifica el material excavat. Les relacions candidates poden ser descartades sense alterar els estrats originals. La Fototeca conserva només noms d'índex locals i reversibles; no modifica els fitxers originals.

## Arqueologia impossible

La **Cambra VII · Arqueologia impossible** és antecedent artístic i cas arqueològic, no sinònim de STRATUM.

## Corpus instrumentalis

Nom complet: **STRATUM · Instrumentum Archaeologiae**  
Nom d'ús: **STRATUM**
