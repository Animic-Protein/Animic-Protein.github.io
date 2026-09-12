# ECO 01 · El lloc que respon

**Estat:** Travessa executable · CAS REAL 01 tancat com a execució · evidència 3/3 local · custòdia externa pendent  
**Origen:** metabolització d'Anímic Protein a partir de Michel Faber, *Listen: On Music, Sound and Us*, capítol «Somewhat Marred by an Echo».  
**Òrgans existents:** Rosa de l'Escolta · RECORDARE · Cambra Nua del Temps · Looperum/Looparium · MUTATIO · INTER NOS · Error Fèrtil / Compost.

## Hipòtesi

Una mateixa font pot produir fenòmens audibles diferents quan canvien l'espai, el temps de retorn o la posició de l'oient, encara que el fragment original romangui intacte.

## Protocol mínim

1. Reprodueix el mateix pols curt als tres espais.
2. Captura localment cada retorn amb RECORDARE; el binari no surt del dispositiu.
3. Escolta els tres retorns sense veure la procedència.
4. Per a cada retorn, declara `mateix`, `diferent` o `no ho sé`.
5. Revela la procedència.
6. Pren una única decisió humana: reobservar, relacionar, conservar, portar al Compost o deixar quiet.
7. Conserva, si ho decideixes, els tres àudios i el rastre JSON com a evidència primària.

## Contracte de dada

```text
source
  id = eco-01-pulse
  constant = true
  generated = true
captures[3]
  sourceId
  spaceLabel
  capturedAt
  mimeType
  size
  localOnly = true
audible
  kind = relational-property
  components = source + space + time + listener
  observations = same | different | unknown
transformation
  material = false
  relational = true | unknown
humanDecision
provenance
  attributedSource = Michel Faber / Listen
  metabolizedBy = Anímic Protein
  canonical = false
  reversible = true
```

## Quatre tests

- **Diferència perceptible:** almenys una observació humana pot declarar `diferent`; `unknown` continua sent legítim.
- **Traçabilitat:** cada retorn conserva `sourceId`, espai, instant, format i mida.
- **Relació:** la formiga només apareix després d'una diferència declarada i una decisió humana.
- **Reversibilitat:** els àudios viuen en memòria local, es poden descarregar o dissoldre, i no es publiquen automàticament.

## Límit constitucional

La interfície per si sola no converteix cap sessió futura en cas real. **CAS REAL 01 ja va ser executat i tancat el 2026-09-11** amb tres captures locals; no s’ha de repetir per completar la custòdia. La verificació externa posterior versionarà el rastre amb rutes, MIME, mides i SHA-256, sense alterar l’execució.

- [Acta de tancament del CAS REAL 01](./ACTA-TANCAMENT-CAS-REAL-01-2026-09-11-v1.0.md)
- [Registre d’Archivum · Custòdia](../../../archivum/custodia/eco-01-cas-real-01.json)
