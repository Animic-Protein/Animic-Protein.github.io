# History Tales · Steampunk 1939 v1.0 — integració i rastre

Estat de la incorporació proposada a `main@f4a73ea7` el 14 d’octubre de 2026. Els fitxers del paquet original i les experiències HT·01—HT·07 es conserven. Aquesta integració afegeix materialitzacions alternatives a Archivum i les fa navegables des de `beta/history-tales-media.html`.

## Verificació del paquet

- Paquet d’origen: `history-tales-steampunk-1939-v1.0.zip`, versió preservada a la Biblioteca el 21/09/2026.
- SHA-256 del ZIP: `3113e40345f491308ac04c9953a2451c999ca3e807bef5509ab7f282ba5ac316`
- `unzip -t` ha acabat sense errors.
- Les 11 empremtes de `CHECKSUMS.sha256` del paquet coincideixen amb els binaris extrets.
- Les dimensions de les 11 imatges coincideixen amb les declarades al manifest.
- L’original addicional d’HT·01 s’ha recuperat de la custòdia de la Biblioteca; el seu SHA-256 coincideix amb `ht-01-original` a `archivum/custodia/history-tales-v1.1-custody-v1.2.json`.

## Estat per materialització

| Peça | Original | Reconstrucció editorial | Variant steampunk |
| --- | --- | --- | --- |
| HT·01 · Reconciliation of the War of Currents | Recuperat; coincideix amb la custòdia HT·01 | SVG existent, conservada | No inclosa en v1.0 |
| HT·02 · The Machine That Refused to Answer | Pendent: custòdia indica que l’original separat no s’ha localitzat | SVG existent, conservada | No inclosa en v1.0 |
| HT·03 · Elektro Stops | Recuperat; SHA coincideix amb la custòdia HT·03 | SVG existent, conservada | Completa al manifest i amb SHA verificat |
| HT·04 · The Other Futurama | Recuperat; SHA coincideix amb la custòdia HT·04 | SVG existent, conservada | Pendent: `variant: null` al manifest |
| HT·05 · Inside the Perisphere, Someone Waits | Recuperat; SHA coincideix amb la custòdia HT·05 | SVG existent, conservada | Completa al manifest i amb SHA verificat |
| HT·06 · The Night Tomorrow Went Dark | Recuperat; SHA coincideix amb la custòdia HT·06 | SVG existent, conservada | Completa al manifest i amb SHA verificat |
| HT·07 · The Photograph That Looked Back | Vídeo extern amb SHA registrat; transferència al repositori pendent | SVG existent, no és metratge històric restaurat | No inclosa en v1.0 |
| RELACIONADA · La Rosa de l’Escolta a l’Expo del 1939 | Recuperat; SHA coincideix amb la custòdia HT·01 | — | Completa al manifest i amb SHA verificat |
| RELACIONADA · Fira del Món de Demà, 1939 | Inclòs al paquet; SHA verificat al paquet. Enllaç a una entrada de custòdia independent pendent | — | Completa al manifest i amb SHA verificat |

Les dues peces relacionades romanen fora de HT·01—HT·07 i no reben cap número HT nou. La peça de la Rosa i l’original HT·01 són el mateix binari: una sola còpia d’arxiu i dos vincles contextuals.

## Autoria, transformació i límits

- Direcció creativa declarada pel manifest: Anímic Protein / Dàrius Rojas.
- Transformació declarada: edició d’imatge assistida amb IA sota direcció creativa humana.
- Estat del paquet: `experimental_preserved`; sense canonització automàtica.
- Estat de drets al manifest: `pending_canonical_confirmation`; aquesta integració no afegeix una llicència ni altera aquesta condició.
- Es conserva al manifest la sortida interrompuda i exclosa amb el motiu declarat; no es publica com a variant.
- `manifest.json`, `CHECKSUMS.sha256` i els README del paquet es mantenen sense reescriure per preservar la font d’origen. Aquest document registra la recuperació i la vinculació amb custòdia.
