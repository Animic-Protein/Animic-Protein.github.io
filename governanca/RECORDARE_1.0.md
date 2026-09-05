# RECORDARE 1.0 · Instrument de captura

**Estat:** instrument transversal provisional  
**Data:** 2026-09-06

## Definició

RECORDARE és l'instrument del Còdex Viu per **capturar un esdeveniment sonor o vocal sense confondre captura amb interpretació, memòria amb veritat ni registre amb canonització**.

Pot existir com a instrument propi i, alhora, ser invocat des d'altres instruments o sistemes que necessitin enregistrar.

## Axioma

> **RECORDARE captura. Archivum conserva. La memòria relaciona. KREATOR decideix què significa.**

## Funcions

RECORDARE pot:
- iniciar, pausar, reprendre i finalitzar una gravació;
- capturar àudio de micròfon o d'una font autoritzada;
- associar context, node, instrument i moment temporal;
- crear un `source` i un primer `fragment` sense interpretar-los;
- registrar durada, format, mida, dispositiu/font quan sigui disponible i consentiment;
- generar provenance de captura;
- enviar el registre a Archivum o retornar-lo al sistema invocador;
- permetre descart reversible abans de qualsevol promoció canònica.

RECORDARE no pot:
- declarar que una gravació és significativa;
- transcriure i convertir automàticament una frase en principi canònic;
- inferir autoria o consentiment no declarats;
- transformar l'àudio sense una acció posterior explícita;
- publicar una captura per defecte.

## Model mínim

```text
recording
  id
  source.kind = media
  media.kind = audio
  capturedAt
  duration
  mimeType
  size
  context
  node
  invokedBy
  consent
  storageRef
  checksum? 
  provenance
```

`storageRef` apunta a l'emmagatzematge persistent exterior quan existeixi. El repositori conserva índex i provenance, no ha de convertir-se en magatzem indiscriminat de binaris.

## Modes

### RECORDARE · Instrument

Espai propi per enregistrar, escoltar, descriure i decidir el destí d'una captura.

### RECORDARE · Invocatio

Facultat embeguda que altres òrgans poden convocar sense abandonar el seu context.

Exemples inicials:
- Cambra Nua del Temps — registrar una absència, espera o rastre temporal;
- Looperum — capturar material abans de convertir-lo en loop;
- Looparium — incorporar una font nova al seu índex;
- Videodrome — capturar veu/so associat a una seqüència visual;
- INTER NOS — conservar una devolució vocal amb consentiment;
- Rosa de l'Escolta — registrar una escolta o resposta perceptiva;
- Compost — conservar un accident abans d'interpretar-lo com a Error Fèrtil;
- KREATOR — capturar material brut durant una sessió.

## Circuit constitucional

```text
ESDEVENIMENT
   ↓
RECORDARE · captura
   ↓
SOURCE → FRAGMENT
   ↓
PROVENANCE + CONSENTIMENT
   ↓
[escoltar / descartar / conservar]
   ↓
ARCHIVUM, si la Persona ho decideix
   ↓
relacions / transformacions posteriors
```

## Occam

Una sola infraestructura de gravació ha de servir tots els òrgans. Cap instrument ha de construir una gravadora paral·lela si RECORDARE pot ser invocat.

## Incertesa

Una captura pot romandre sense descripció o significat. `unknown` és un estat legítim.

## Reversibilitat

Aturar o descartar una captura abans de conservar-la no ha de produir un node canònic. La retirada posterior ha de conservar el rastre administratiu mínim requerit sense retenir el contingut retirat quan la política ho exigeixi.

## Consentiment

La gravació de terceres persones exigeix una declaració de consentiment adequada al context. RECORDARE ha de fer perceptible quan una captura conté veu o material potencialment aliè i no assumir drets de publicació.

## Integració futura

RECORDARE compartirà el model `source → fragment → transformation → relation → provenance`. La primera implementació funcional ha de preferir APIs natives del navegador per captura local i una capa separada d'emmagatzematge persistent. La captura no dependrà d'Airtable; Airtable només podrà indexar-ne les metadades si s'autoritza.
