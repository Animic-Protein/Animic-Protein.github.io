# NAVIGATOR 0.7 · zones de permís

**Estat:** proposta executable de contracte · no canònica  
**Zona inicial:** `github:Animic-Protein/Animic-Protein.github.io`  
**Abast:** lectura, preparació local de canvis i sol·licitud de PR en esborrany

## Travessa de zones

NAVIGATOR conserva el fixture sintètic local com a zona d’assaig. La zona GitHub afegeix un mandat humà limitat a un únic repositori. No admet comodins, altres repositoris ni capacitats no enumerades.

| Capacitat | Permís | Llindar |
| --- | --- | --- |
| `repository.read` | Lectura del repositori i del recurs declarat | Mandat humà de zona |
| `patch.prepare` | Preparar una proposta local de canvi | Mandat humà de zona |
| `pull-request.draft.create` | Preparar una petició de PR en esborrany | Decisió humana d’un sol ús lligada a l’empremta de l’acció |
| fusió, publicació, desplegament, canonització o efecte irreversible | Fora del catàleg | Rebutjat; cap permís de zona ho pot elevar |

## Estat real de l’adaptador

Aquest contracte valida l’abast i conserva la decisió humana. **No crida l’API de GitHub ni executa operacions.** Les peticions autoritzades queden com `authorized-awaiting-adapter` i `execution: not-executed` fins que existeixi un adaptador d’execució separat i revisat. Una aprovació dins NAVIGATOR no es confon amb una acció feta.

La selecció «humana» de la interfície és un registre local, no una autenticació d’identitat. Un adaptador real ha de verificar per separat que la persona autenticada té autoritat sobre el repositori i tornar a validar l’empremta exacta abans de qualsevol escrit.

El mandat ha de provenir d’una persona, caduca segons el límit declarat, i pot ser revocat per una persona. Les operacions de PR en esborrany exigeixen una decisió exacta i no reutilitzable per una altra empremta.

## Validació sintètica

Les proves cobreixen el mandat d’un sol repositori, la denegació de comodins, l’abast d’operacions, el llindar humà per a PR, la revocació i la no-execució sense adaptador. No acrediten accés real a GitHub.
