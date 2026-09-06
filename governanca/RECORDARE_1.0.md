# RECORDARE 1.0 · Instrument de captura

**Estat:** instrument transversal funcional  
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
- crear un `source` sense interpretar-lo;
- registrar durada, format, mida i consentiment declarat;
- generar provenance de captura;
- retornar el registre al sistema invocador;
- preparar un índex local de metadades per a Archivum;
- permetre descart reversible abans de qualsevol promoció canònica.

RECORDARE no pot:
- declarar que una gravació és significativa;
- transcriure i convertir automàticament una frase en principi canònic;
- inferir autoria o consentiment no declarats;
- transformar l'àudio sense una acció posterior explícita;
- publicar una captura per defecte;
- enviar el binari a Airtable.

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
  provenance
  localOnly = true
  canonical = false
```

`storageRef` només apunta a l'emmagatzematge persistent exterior quan existeix. El repositori i Airtable conserven índex/provenance, no binaris indiscriminats.

## Modes

### RECORDARE · Instrument
Espai propi per enregistrar, escoltar, descriure i decidir el destí d'una captura.

### RECORDARE · Invocatio
Facultat embeguda que altres òrgans poden convocar sense abandonar el seu context. La implementació compartida és `recordare/invocatio.js`; els òrgans que ja carreguen `formiga.js` la reben transversalment i els espais independents poden carregar-la directament.

## Circuit constitucional

```text
ESDEVENIMENT
   ↓
RECORDARE · captura local
   ↓
SOURCE + PROVENANCE + CONSENTIMENT DECLARAT
   ↓
[escoltar / descartar / conservar binari al dispositiu]
   ↓
[preparar metadades per Archivum] ← acció humana explícita
   ↓
ARCHIVUM · índex extern, sense binari
   ↓
relacions / transformacions posteriors, només si es decideixen
```

## Archivum / Airtable

La base `ARCHIVUM · Sediment verbal 1.0` disposa d'una taula específica `Recordare Captures`. Aquesta taula és **només un índex de metadades**: identificador, nom, data, durada, MIME, mida, context, node, invocador, consentiment declarat, `localOnly`, `storageRef`, estat canònic i provenance.

La captura del navegador **no depèn d'Airtable**. El client no conté credencials d'Airtable i no fa cap escriptura directa. La sincronització de metadades s'ha de fer per una acció autoritzada externa o una capa de servidor segura. `canonical` és fals per defecte.

## Occam
Una sola infraestructura de gravació serveix els òrgans. Cap instrument ha de construir una gravadora paral·lela si RECORDARE pot ser invocat.

## Incertesa
Una captura pot romandre sense descripció o significat. `unknown` és un estat legítim.

## Reversibilitat
Aturar o descartar una captura abans de conservar-la no produeix un node canònic. L'índex local es limita a metadades preparades explícitament i mai conté el blob d'àudio.

## Consentiment
La gravació de terceres persones exigeix una declaració de consentiment adequada al context. El camp registra una declaració humana; RECORDARE no pot verificar ni inferir drets de publicació.

## Contracte de seguretat

1. `getUserMedia` només s'activa després d'una acció humana.
2. El blob viu localment al navegador i pot descarregar-se al dispositiu.
3. Cap binari s'envia automàticament al repositori, Archivum o Airtable.
4. Preparar metadades és una acció separada i explícita.
5. Indexar no és conservar el binari, publicar, interpretar ni canonitzar.
6. Qualsevol sincronització externa conserva provenance i `canonical:false` llevat d'una decisió humana posterior.
