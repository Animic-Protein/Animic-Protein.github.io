# RESILIÈNCIA 1.0

Estat: contracte operatiu, reversible.

## 3-2-1
Cada material que requereixi preservació declara: 3 còpies, 2 suports o proveïdors diferents, 1 còpia fora del repositori principal. GitHub no és custòdia única. Archivum conserva l'índex i els localitzadors; els binaris continuen fora del repo quan així ho exigeix el contracte de custòdia.

## Sobre portable
L'exportació mínima conté manifest, provenance, drets, versions, checksums SHA-256 i localitzadors; no incorpora secrets ni binaris sense decisió humana.

## Xifrat
Els sobres que continguin dades no públiques s'han de xifrar fora del client públic. Cap clau o contrasenya entra al repositori.

## Restauració
Una còpia no compta com a resilient fins que s'ha restaurat en un entorn net i s'han verificat els checksums. Estat: backup_planned → backup_verified → restore_verified. La promoció mai és automàtica.
