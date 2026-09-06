# Auditoria · STRATUM 1.0

**Data:** 2026-09-06  
**Estat:** publicable amb limitacions explícites

## Resultat

STRATUM 1.0 respecta el seu contracte constitucional en la primera implementació funcional: recupera un corpus local traçable, mostra estrat, estat, certesa i provenance, i no modifica els materials originals.

## Correccions aplicades

1. **Rutes transversals** — corregit `rootPrefix()` a `formiga.js`. Des de subdirectoris com `universe/`, `cambra-nua-2/` o `inter-nos-creative/`, MASTER i STRATUM ara resolen l'arrel correctament.
2. **Col·lisió d'interfície** — `Excavar` passa al marge dret; MASTER conserva el marge esquerre.
3. **Taxonomia** — els axiomes que contenen termes llatinitzats deixen de classificar-se automàticament com a `Latinismes`; el tipus descriu la naturalesa del fragment, no només el vocabulari que conté.
4. **Rellevància** — el motor pondera coincidència de frase, text, context, origen i estrat en lloc de comptar només tokens presents.

## Validació constitucional

- **Occam:** un únic instrument d'excavació transversal; cap motor paral·lel per òrgan.
- **Incertesa:** cap resultat es declara veritat per similitud; el buit continua sent buit.
- **Reversibilitat:** una excavació no altera el corpus.
- **Decisió humana:** STRATUM retorna; no canonitza ni transforma.
- **Provenance:** cada resultat local mostra l'origen disponible.

## Limitacions conegudes

- La primera versió web consulta un corpus local verificat. Airtable és el jaciment viu de metadades, però no es consulta directament des del navegador per evitar exposar credencials.
- La cobertura històrica encara no és exhaustiva: ARQUEOLOGIA VERBAL continua ampliant el corpus.
- El repositori no exposa checks de CI associats als commits d'aquesta implementació en el moment de l'auditoria. Per tant, la validació actual és arquitectònica i de codi/referències, no un resultat afirmat de CI.

## Decisió

**Publicable.** Les limitacions són coherents amb STRATUM 1.0 i no trenquen el contracte constitucional. La integració segura amb Airtable i l'ampliació del corpus pertanyen a iteracions posteriors.
