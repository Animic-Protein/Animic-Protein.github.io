# STRATUM 1.0 · Instrumentum Archaeologiae

**Estat:** instrument transversal provisional  
**Corpus:** Corpus instrumentalis  
**Data:** 2026-09-06

## Definició

STRATUM és l'instrument transversal del Còdex Viu per **excavar, recuperar, comparar i reconstruir genealogies** entre materials ja existents sense substituir-los, fusionar-los ni decidir-ne el significat.

STRATUM no és Archivum, no és una memòria, no és un glossari i no és un cercador genèric. És l'instrument que interroga els estrats conservats del Còdex i en retorna antecedents, mutacions, contradiccions, ressonàncies i provenance.

## Axioma

> **Excavar és recuperar sense substituir, relacionar sense fusionar i mostrar la genealogia sense decidir-ne el sentit.**

## Facultat principal

`EXCAVAR`

Una excavació pot partir de:
- una paraula;
- un aforisme o fragment verbal;
- un node o instrument;
- una relació;
- una font;
- una transformació;
- una decisió;
- una absència o rastre;
- un identificador de provenance;
- un context actiu del Còdex.

## Estrats inicials

STRATUM pot excavar, com a mínim:
- **Archivum** — materials conservats i provenance;
- **Sediment verbal** — frases, aforismes, axiomes i formulacions;
- **Vocabulari Viu** — lèxic propi, definicions i mutacions terminològiques;
- **Glossae Vivens** — glosses, anotacions, expansions i contrapunts;
- **Latinismes** — família lingüística transversal, no sistema independent;
- **GitHub** — història tècnica, governança, versions i rastres de implementació;
- **Airtable** — índex viu de metadades, relacions i genealogies;
- altres fonts incorporades amb provenance suficient.

## Operacions

STRATUM pot:
- cercar aparicions i antecedents;
- ordenar resultats per estrat temporal, semàntic o de provenance;
- reconstruir línies `ancestor → mutation → descendant`;
- mostrar divergències i contradiccions sense resoldre-les silenciosament;
- detectar ressonàncies explícites o candidates i marcar-ne la incertesa;
- retornar el context d'origen d'una formulació;
- comparar formulacions successives;
- exposar buits documentals (`insufficient-provenance`, `missing-stratum`, `uncertain-lineage`);
- ser invocat des de qualsevol instrument o sistema que adopti el protocol.

STRATUM no pot:
- canonitzar;
- substituir una versió antiga per una de nova;
- declarar que una relació és significativa només per similitud;
- inventar provenance absent;
- convertir una glossa en definició canònica;
- decidir quin estrat és «el correcte»;
- executar MUTATIO per si mateix.

## Arquitectura funcional

```text
CONTEXT / PREGUNTA / RASTRE
          ↓
      STRATUM · EXCAVAR
          ↓
  fonts i estrats disponibles
          ↓
 aparicions · relacions · genealogies
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

STRATUM pot aparèixer a qualsevol node amb una acció mínima:

`Excavar`

La invocació no ha d'obligar a abandonar l'instrument actiu. Ha de preservar el context d'origen i retornar-hi els resultats.

Exemples:
- Cambra Nua del Temps → excavar absències i antecedents temporals;
- Looperum → excavar fonts prèvies d'un fragment o bucle;
- Looparium → reconstruir genealogies de loops;
- INTER NOS → recuperar formulacions o relacions prèvies abans d'una devolució;
- MASTER → consultar antecedents sense convertir-los en ordres;
- Rosa de l'Escolta → excavar ressonàncies perceptives anteriors;
- Compost → recuperar accidents semblants sense convertir-los automàticament en Error Fèrtil;
- Archivum → navegar entre sediment, glossa, terme, font i lineage.

## Incertesa

Si hi ha diversos estrats incompatibles, STRATUM els presenta en paral·lel. La contradicció és informació.

Si no hi ha provenance suficient, STRATUM ho declara. L'absència de rastre no s'omple amb una reconstrucció fictícia.

## Occam

Un únic instrument d'excavació serveix tot el Còdex. Cap òrgan ha de construir un motor de cerca genealògica propi si STRATUM pot ser invocat.

## Reversibilitat

Excavar no modifica el material excavat. Les relacions candidates generades durant una excavació han de poder ser descartades sense alterar els estrats originals.

## Arqueologia impossible

La **Cambra VII · Arqueologia impossible** es conserva com a antecedent artístic i cas arqueològic, no com a sinònim de STRATUM. STRATUM pot excavar-la com qualsevol altre estrat del Còdex.

## Corpus instrumentalis

Amb STRATUM, la funció arqueològica deixa de ser només un procés editorial i entra formalment al **Corpus instrumentalis** com a instrument reutilitzable.

Nom complet:

**STRATUM · Instrumentum Archaeologiae**

Nom d'ús:

**STRATUM**
