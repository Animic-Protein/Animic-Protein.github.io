# ARCHIVUM · AIRTABLE 1.0

**Estat:** esquema operatiu provisional  
**Data:** 2026-09-06

## Funció

Airtable actua com a índex humà editable de metadades per a Archivum. No substitueix GitHub, que continua essent la font de veritat per versionat, governança i provenance tècnica.

## Base recomanada

`ARCHIVUM · Sediment verbal 1.0`

### Taula: Sediments

Camps mínims:

- `id` — identificador estable
- `text` — aforisme, formulació o fragment verbal
- `state` — canonical / provisional / emergent / fertile-discard
- `context` — situació d'origen
- `origin` — xat, Work, Site, GitHub, document o captura humana
- `origin_ref` — URL, commit, fitxer, fil o referència recuperable
- `captured_at` — data de captura
- `certainty` — confirmed / recovered / emergent / declared
- `node` — òrgan o sistema principal
- `relations` — relacions explícites
- `parent_phrase` — frase antecedent
- `mutation_of` — sediment del qual deriva
- `contradicts` — sediment amb què entra en tensió
- `canonical_status` — estat de validació humana
- `provenance_note` — nota de procedència
- `tags` — etiquetes lliures
- `active` — si continua disponible per recuperació

### Taula: Relations

- `id`
- `source_sediment`
- `target_sediment`
- `kind` — resonates / mutates / contradicts / clarifies / governs / recalls
- `created_at`
- `created_by`
- `certainty`
- `note`

### Taula: Lineages

- `id`
- `name`
- `root_sediment`
- `current_sediment`
- `status`
- `notes`

## Regles

1. Conservar no és canonitzar.
2. Una frase no perd el seu origen encara que sigui reescrita.
3. Les mutacions creen genealogia; no sobrescriuen l'antecedent.
4. Una contradicció és informació, no un error de dades.
5. GitHub conserva la versió canònica de l'esquema.
6. Airtable pot enriquir metadades sense modificar automàticament el Còdex.
7. MASTER i LOCUTUS poden consultar sediments, però no canviar-ne l'estat canònic.
8. KREATOR/persona conserva la decisió de promoció, descart o retorn.

## Circuit

```text
Xats / Work / Site / GitHub
        ↓
   captura verbal
        ↓
     Archivum
        ↓
Airtable · metadades i relacions
        ↕
GitHub · provenance i governança
        ↓
Memòria semàntica futura
```

## Nota d'Occam

La primera versió utilitza Airtable només com a índex estructurat. No s'introdueix encara una base semàntica/vectorial obligatòria. Neon/Postgres queda com a possible segona infraestructura quan el volum i les consultes reals ho justifiquin.
