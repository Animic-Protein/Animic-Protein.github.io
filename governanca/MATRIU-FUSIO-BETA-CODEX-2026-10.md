# Matriu de fusió total Beta → Còdex

**Data:** 14 d’octubre de 2026
**Estat:** migració preparada per revisió
**Abast:** tots els 32 fitxers de `beta/`, el registre `.well-known` de Beta i les dependències actives.

La fusió conserva contingut, procedència i rutes anteriors. Els documents d’acta i custòdia mantenen les referències històriques tal com es van registrar; les rutes públiques antigues es resolen amb `404.html` cap a la ubicació canònica. El nom `Beta` deixa de ser un directori o una àrea activa.

## Matriu dels 32 fitxers

| Contingut d’origen | Destí canònic | Funció després de la fusió |
|---|---|---|
| `beta/FUSIO-TOTAL-2.4.md` | `fusio-total/arxiu/FUSIO-TOTAL-BETA-2.4.md` | Contracte i genealogia preservats com a edició històrica |
| `beta/CAMBRA-NUA-DEL-TEMPS-FITXA.md` | `cambra-nua-2/FUTURS-RECORDATS-01-FITXA.md` | Fitxa visual especulativa de la Cambra |
| `beta/cambra-nua-futurs-recordats.html` | `cambra-nua-2/futurs-recordats.html` | Làmina visual de la Cambra |
| `beta/futurs-recordats.html` | `mutatio/history-tales/site/futurs-recordats.html` | Índex visual de la sèrie History Tales |
| `beta/history-tales.html` | `mutatio/history-tales/site/index.html` | Portal executable de la sèrie |
| `beta/history-tales-media.html` | `mutatio/history-tales/site/history-tales-media.html` | Galeria i rastres de mitjans |
| `beta/ht-01.html` | `mutatio/history-tales/site/ht-01.html` | Experiència HT·01 |
| `beta/ht-02.html` | `mutatio/history-tales/site/ht-02.html` → HT·A2 | Àlies antic amb redirecció preservada |
| `beta/ht-03.html` | `mutatio/history-tales/site/ht-03.html` | Experiència HT·03 |
| `beta/ht-04.html` | `mutatio/history-tales/site/ht-04.html` → HT·A4 | Àlies antic amb redirecció preservada |
| `beta/ht-05.html` | `mutatio/history-tales/site/ht-05.html` | Experiència HT·05 |
| `beta/ht-06.html` | `mutatio/history-tales/site/ht-06.html` | Experiència HT·06 |
| `beta/ht-07.html` | `mutatio/history-tales/site/ht-07.html` → HT·A7 | Àlies antic amb redirecció preservada |
| `beta/ht-a2.html` | `mutatio/history-tales/site/ht-a2.html` | Experiència canònica HT·A2 |
| `beta/ht-a4.html` | `mutatio/history-tales/site/ht-a4.html` | Experiència canònica HT·A4 |
| `beta/ht-a7.html` | `mutatio/history-tales/site/ht-a7.html` | Experiència canònica HT·A7 |
| `beta/arxiu-history-tales-pre-media/index.html` | `archivum/history-tales/pre-media/snapshot-2026-09/index.html` | Índex de la captura pre-Media |
| `beta/arxiu-history-tales-pre-media/ht-01.html` | `archivum/history-tales/pre-media/snapshot-2026-09/ht-01.html` | Captura històrica HT·01 |
| `beta/arxiu-history-tales-pre-media/ht-02.html` | `archivum/history-tales/pre-media/snapshot-2026-09/ht-02.html` | Captura històrica HT·02 |
| `beta/arxiu-history-tales-pre-media/ht-03.html` | `archivum/history-tales/pre-media/snapshot-2026-09/ht-03.html` | Captura històrica HT·03 |
| `beta/arxiu-history-tales-pre-media/ht-04.html` | `archivum/history-tales/pre-media/snapshot-2026-09/ht-04.html` | Captura històrica HT·04 |
| `beta/arxiu-history-tales-pre-media/ht-05.html` | `archivum/history-tales/pre-media/snapshot-2026-09/ht-05.html` | Captura històrica HT·05 |
| `beta/arxiu-history-tales-pre-media/ht-06.html` | `archivum/history-tales/pre-media/snapshot-2026-09/ht-06.html` | Captura històrica HT·06 |
| `beta/arxiu-history-tales-pre-media/ht-07.html` | `archivum/history-tales/pre-media/snapshot-2026-09/ht-07.html` | Captura històrica HT·07 |
| `beta/travesses/01-felix-error.md` | `archivum/coniunctio/casos/01-felix-error.md` | Registre històric del cas β·01 |
| `beta/travesses/02-direccio-que-desapareix.md` | `archivum/coniunctio/casos/02-direccio-que-desapareix.md` | Registre històric del cas β·02 |
| `beta/travesses/eco-01/README.md` | `experiments/eco-01/README.md` | Guia operativa del pilot ECO 01 |
| `beta/travesses/eco-01/eco-01-import.js` | `experiments/eco-01/eco-01-import.js` | Adaptador local d’importació |
| `beta/travesses/eco-01/eco-01.js` | `experiments/eco-01/eco-01.js` | Runtime local i reversible |
| `beta/travesses/eco-01/index.html` | `experiments/eco-01/index.html` | Interfície del pilot |
| `beta/travesses/eco-01/ACTA-TANCAMENT-CAS-REAL-01-2026-09-11-v1.0.md` | `archivum/coniunctio/eco-01/ACTA-TANCAMENT-CAS-REAL-01-2026-09-11-v1.0.md` | Acta de custòdia tancada |
| `beta/travesses/eco-01/CAS-REAL-01-2026-09-11-v0.1.md` | `archivum/coniunctio/eco-01/CAS-REAL-01-2026-09-11-v0.1.md` | Registre del cas preservat |

## Dependències actualitzades

- Menú principal, Llenguatge Viu, acta d’escolta, `temps-nu.js`, manifest HT vigent i service worker apunten als nous camins.
- `scripts/validate-site.mjs` valida els destins nous, les redireccions antigues i l’absència del directori `beta/`.
- Les actes tancades i les versions de custòdia no es reescriuen. Els seus localitzadors antics continuen resolent-se per compatibilitat.
- `.well-known/animic-fusion-beta.json` es conserva només com a tombstone JSON de compatibilitat; el registre complet passa a `archivum/coniunctio/fusion-beta-2.4.json` i l’endpoint actiu és `.well-known/animic-coniunctio.json`.
- Les rutes `/beta/...` es redirigeixen des de la pàgina 404 del lloc. Això permet retirar els fitxers font Beta sense trencar enllaços publicats.

## Site extern

El connector de Sites no retorna cap Site actiu amb el slug `animic-protein-fusio-beta`; tampoc no apareix a la llista dels Sites propis consultada durant aquesta migració. El Site públic existent `Anímic Protein — Fusió Total` es conserva com a superfície canònica. No hi ha cap Site extern Beta identificat que es pugui fusionar o retirar amb seguretat. El registre conservat apunta al Site Beta històric, sense declarar-lo actiu.
