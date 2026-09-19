# CICLE VITAL 1.0

Estat: contracte transversal.

Estats comuns: active, waiting, closed, withdrawn, reopened.

Transicions: active → waiting|closed|withdrawn; waiting → active|closed|withdrawn; closed → reopened|withdrawn; reopened → active|waiting|closed|withdrawn. withdrawn només pot tornar com reopened mitjançant una nova decisió humana explícita.

Cap estat implica canonical:true. Tancar no és esborrar; retirar no és oblidar; reobrir crea un nou esdeveniment de provenance i conserva l'estat anterior.
