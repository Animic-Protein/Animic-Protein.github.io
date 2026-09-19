# KREATOR RPG · arquitectura experimental 0.4

> EXPERIMENT. Evolució de KRATOR. No és nucli canònic del Còdex Viu. Només podrà metabolitzar-se després d'una partida real i decisió humana explícita.

La interfície evolucionada de Partida 01 conserva la fitxa viva, MASTER invocable i els dos DAUS configurables. L’ordre causal reparat és `MASTER → INCERTESA/DAUS → ruta → humanDecision → efecte/MUTATIO → provenance`.

La superfície 0.4.3 adopta un únic portal horitzontal steampunk: el portal central, MASTER, DAUS i RECORDARE comparteixen el cockpit superior, mentre les branques clicables formen un circuit operatiu únic. A 0.4.3 es fan explícites les tres funcions que quedaven amagades: IMPULS proposa, KREATOR ocupa la posició humana de decisió i LOOPERUM transforma temps audible. LOCUTUS continua dins d’INTER NOS; Retrodansa, Harmonia, Herbarium i Silenci continuen sota la Rosa; Looparium continua dins d’Archivum. Així s’evita confondre una capa interna o consultiva amb un portal independent. MASTER, RECORDARE i STRATUM/EXCAVAR s’invoquen des del mateix `INVOCATIO DOCK`; els llançadors flotants transversals no es mostren en aquesta pantalla. La Beta funcional continua sent el motor i GitHub Pages n’és l’única ruta pública.

La capa 0.4.4 estén el llenguatge steampunk a tota la màquina sense canviar-ne el contracte: plaques de ferro i llautó, reblons, canonades, indicadors, controls bisellats i llum cobalt arriben també al circuit de branques i a la travessa funcional. El moviment ornamental respecta `prefers-reduced-motion`; la llegibilitat, l’ordre causal i els controls originals es preserven.

La revisió 0.4.5 tanca la lògica de la travessa: la combinació visible per defecte coincideix amb `d7 × d9`; una decisió humana requereix una tirada prèvia; la ruta i la diferència queden fixades dins la decisió; modificar-les invalida l’autorització anterior; `QUIET` no pot iniciar cap efecte; i tancar sense efecte crea un esdeveniment `closure` autoritzat i exportable. Les invocacions RECORDARE i STRATUM tenen ruta de reserva, l’historial escapa text introduït i l’exportació JSON retarda la retirada de l’URL per funcionar amb fiabilitat a Safari/iOS.

La revisió 0.4.6 completa el camp interrogatiu de DAUS amb els sis eixos `QUÈ · ON · QUAN · COM · QUI · PER QUÈ`. `QUÈ × ON` és la parella inicial perquè qualsevol tensió pugui adquirir un material perceptible i una situació abans de proposar una ruta. La persona pot combinar visualment dos eixos; la tirada conserva la parella i els significats al rastre JSON. Un gràfic XYZ projecta `QUI ↔ QUÈ` sobre X, `QUAN ↔ ON` sobre Y i `PER QUÈ ↔ COM` sobre Z; durant la tirada el punt explora el camp i, en aturar-se, mostra la configuració executada. Aquest desplaçament d’atenció afavoreix flexibilitat associativa, però no és un diagnòstic ni una mesura neurocientífica, i no altera l’ordre causal de 0.4.5. La constel·lació Llenguatge Viu queda disponible com a retorn transversal: anomena i relaciona, però no decideix.

La revisió 0.4.7 converteix els punts successius del gràfic XYZ en una trajectòria de partida. Mostra fins a dotze tirades, ordenades i unides, a partir dels esdeveniments `dice` ja conservats localment. La línia és una projecció visual reversible del rastre: no afegeix una memòria paral·lela, no interpreta patrons i no altera cap autorització humana.

La revisió 0.4.8 recupera CONVIVIUM com a capa relacional transversal i obre la cohort KREATOR RPG 02–05. Una mateixa experiència parametritzada separa identitat local, missió, eixos inicials, historial i exportació de cada participant. Les diferències pilot són audible, espacial, relacional i temporal. CONVIVIUM aporta full de ruta, importació manual dels quatre JSON i Atlas visual; no publica contactes, no sincronitza rastres i no promou cap resultat. Retrodansa i Zajj‑viu només s’obren com a traduccions col·lectives després de quatre tancaments i una nova decisió humana.

La matèria sonora opcional **Allò que es cou** acompanya el Dock i CONVIVIUM com a atmosfera de llindar. Parteix de *Sausage in oily frying pan sizzling* de pooky1 (Freesound, CC0) i conserva la seva relació amb ORDO → RETRODANSA. S'activa només després d'un gest humà, es pot silenciar sempre, manté la preferència local i no genera esdeveniments, decisions ni provenance.

**SPECTRUM ANNALIS** converteix el centre d'INVOCATIO en receptor visual. Analitza en temps real la matèria sonora ambiental o un fitxer local d'àudio/vídeo seleccionat per la persona. El fitxer roman al dispositiu, es pot retirar immediatament i no s'importa, exporta, interpreta ni incorpora al rastre. En absència de senyal, el receptor només mostra espera; el moviment mecànic del Dock respecta `prefers-reduced-motion`.

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

## MASTER 0.4

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

## Protocol DAUS 0.4

Dos daus romanen sempre visibles a la interfície experimental.

Cada dau pot adoptar `d6`, `d7`, `d8` o `d9` de manera independent. Una tirada:
1. registra nombre de cares de cada dau;
2. genera cada resultat uniformement entre `1..cares`;
3. mostra moviment/rotació abans de revelar el resultat;
4. conserva data, context i resultats;
5. produeix una **condició de joc**, mai una veritat ni una canonització.

### Regla constitucional

**L'atzar pot decidir quina ruta s'explora; no pot decidir què és veritat ni què entra al cànon.**

Si el resultat exigeix una acció irreversible o canònica, la tirada s’atura davant la decisió humana.

La Partida 01 proposa per defecte `d7 × d9`, i manté `d6`, `d7`, `d8` i `d9` seleccionables independentment. Ni una tirada ni un retorn de MASTER poden activar el botó d’efecte: cal un esdeveniment `human-decision` previ i compatible.

Els sis eixos interrogatius tenen funcions diferents:
- `QUÈ`: material, rastre o fenomen que entra en atenció;
- `ON`: cos, espai, memòria o relació on pot ser percebut;
- `QUAN`: moment o condició temporal;
- `COM`: procediment o qualitat del gest;
- `QUI`: posició o font implicada;
- `PER QUÈ`: hipòtesi causal, mai certesa.

## Primera partida real

Abans de metabolitzar aquesta arquitectura al Còdex:
- executar una sessió amb almenys un KREATOR;
- conservar el rastre de moviments i tirades;
- observar si els daus produeixen diferència perceptible o només ornament;
- decidir humanament: metabolitzar, revisar o enviar al Compost.


## Revisió 0.4.11 · coherència del portal

La revisió 0.4.11 consolida el Dock viu sense ampliar la fisiologia: actualitza la versió visible i l'exportació JSON, substitueix la denominació visible `KREATOR 1` per `KREATOR` com a posició humana general i manté KREATOR 01–05 només com a identitats de la cohort CONVIVIUM. SPECTRUM ANNALIS i la matèria sonora passen a respectar exclusivitat perceptiva: quan entra una font local d'àudio/vídeo, l'ambient s'atura i la seva preferència queda apagada; si després s'activa voluntàriament l'ambient, el fitxer local es pausa. Cap d'aquests gestos entra a la cadena causal ni al provenance.
