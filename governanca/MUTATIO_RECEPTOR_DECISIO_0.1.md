# MUTATIO · Receptor de decisió 0.1

**Estat:** implementació experimental reversible  
**Data:** 12 de setembre de 2026  
**Origen:** IMPULS 1.1 · Llindar de resposta humana

## Fricció

IMPULS conservava la decisió humana abans de navegar, però Fusió Total no llegia el rastre. La decisió arribava visualment al destí sense ser reconeguda per MUTATIO.

A més, el rastre inicial d’IMPULS conservava `effect.executed:false` fins i tot quan la navegació s’iniciava. La correcció substitueix aquesta afirmació excessiva per `initiated:true|false` i conserva `initiatedAt` abans de navegar.

## Decisió

MUTATIO examina únicament l’última decisió humana resolta. Només la rep si conserva `humanDecision.action=transform`, està dirigida a Fusió Total i acredita `effect.initiated=true`. Una decisió posterior quieta o divergent no pot reactivar una transformació anterior.

Rebre una decisió no executa cap transformació. El receptor demana un únic destí humà:

- **Instrument Z** — contrastar la diferència perceptible;
- **Compost** — conservar material encara inestable;
- **Pendent** — no actuar.

No s’ofereix canonització directa perquè la decisió d’IMPULS no acredita per si sola diferència, relació, traçabilitat i reversibilitat.

## Contracte

`suggestedImpulse → humanDecision → recepció MUTATIO → destí humà → efecte`

El registre de recepció conserva:

- identificador de decisió i de proposta;
- acceptació o divergència prèvia;
- destí escollit i ancoratge real dins Fusió Total;
- `effect.initiated` i `initiatedAt` quan la navegació s’ha iniciat;
- estat `resolved|pending`;
- `canonical:false`;
- `reversible:true`.

La memòria és local i limitada a vint recepcions sota `animic.codex.mutatio-receptions/v1`. Instrument Z activa el panell real `#z`; Compost retorna al node real `#compost`; pendent no navega.

## Reversibilitat

«Retirar aquesta recepció» elimina només la lectura de MUTATIO. No esborra ni reescriu la decisió humana original d’IMPULS.

> Rebre no equival a transformar; transformar no equival a canonitzar.
