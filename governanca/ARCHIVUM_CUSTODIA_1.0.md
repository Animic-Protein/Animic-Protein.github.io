# ARCHIVUM · CUSTÒDIA 1.0

**Estat:** evolució proposada per integrar a main  
**Data:** 12 de setembre de 2026  
**Òrgan:** Archivum; no neix cap òrgan nou.

## Funció

Archivum distingeix què existeix, on és, què s’ha verificat i què continua absent. Conserva metadades i provenance sense moure cap binari automàticament.

**Conservar no equival a canonitzar. Local no equival a extern. Derivat no equival a original. Projecte tancat no equival a originals complets.**

## Estats de custòdia

| Estat | Significat |
|---|---|
| repository_preserved | Fitxer present al repositori canònic amb ruta i blob Git verificables. |
| local_only | Original preservat al dispositiu; custòdia externa no verificada. |
| external_unverified | Una font declara una ubicació externa, però no hi ha ruta i integritat contrastades. |
| externally_verified | Ruta externa accessible i SHA-256 contrastat. |
| derivative_preserved | Reconstrucció o representació preservada; no és l’original. |
| missing_original | Original esperat no localitzat; el buit queda visible. |
| not_materialized | El binari descrit encara no existeix com a lliurable. |

## Contracte mínim

Cada evidència declara identificador, funció, estat de custòdia, localitzador, verificació i font de l’afirmació. Un valor desconegut és null; mai s’inventa.

Les transicions de custòdia creen versió. No sobrescriuen el registre anterior, no reobren automàticament un projecte tancat i no promouen cap cas a metabolitzat.

## Primera aplicació

1. **History Tales v1.1:** projecte tancat i auditat; experiències web preservades; originals externs sense ruta verificada; HT·02 absent; HT·07 no materialitzat.
2. **ECO 01 · CAS REAL 01:** execució real tancada; tres àudios i rastre JSON preservats localment; custòdia externa i empremtes pendents; no repetir l’experiment.

## Límits

- Cap fitxer d’àudio, vídeo, imatge o JSON primari es transfereix amb aquesta evolució.
- GitHub conserva el contracte i els registres; no afirma custodiar binaris que no conté.
- Airtable pot actuar com a índex de metadades segons ARCHIVUM · AIRTABLE 1.0, però no substitueix la verificació.
- La decisió humana governa qualsevol transferència, verificació, promoció o dissolució.

## Rutes

- Contracte executable: ../archivum/custodia/contracte-1.0.json
- History Tales v1.1: ../archivum/custodia/history-tales-v1.1.json
- ECO 01 · CAS REAL 01: ../archivum/custodia/eco-01-cas-real-01.json
- Interfície: ../portal-multimedia/#custodia
