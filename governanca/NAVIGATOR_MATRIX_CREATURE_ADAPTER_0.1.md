# NAVIGATOR MATRIX · Adaptador reversible de Còdex Creature 0.1

**Estat:** banc de proves · local · sintètic · reversible · no canònic  
**Contracte mare:** `NAVIGATOR-MATRIX-0.4`  
**Programa:** `CODEX_CREATURE`  
**Operació:** `codex.patch.reversible`

## Propòsit

Demostrar que NAVIGATOR pot actuar dins un programa del Còdex sense demanar una decisió humana a cada moviment quan el mandat inicial inclou l’operació, l’objecte és exclusivament sintètic i existeix una Retrodansa exacta i verificada.

## Abast 0.1

L’adaptador només funciona:

- contra Còdex Creature servit des de `localhost` o `127.0.0.1`;
- amb una sessió MATRIX activa i el programa `CODEX_CREATURE` dins el mandat;
- sobre `codex-creature-fragments-v1` quan **tots** els fragments són fixtures `Fixture MATRIX`;
- sobre un únic `fragmentId` declarat pel fixture;
- amb canvis de text limitats a `title` i `content`;
- sense xarxa, publicació, cànon ni dades personals.

La presència d’un sol registre que no sigui fixture bloqueja l’operació completa. L’adaptador no interpreta aquesta presència: retorna `fixture-only-store-required`.

## Seqüència

1. Llegeix el valor serialitzat exacte del magatzem local.
2. Calcula l’empremta anterior i prepara `restore-exact-localstorage-value`.
3. Demana autorització al mandat MATRIX per a una única revisió de sessió.
4. Aplica el canvi permès al fragment sintètic.
5. Verifica la lectura exacta posterior i registra `mandated-adapter-operation`.
6. Emet un rebut de rollback lligat a sessió, revisió, fixture, fragment i empremtes.
7. La Retrodansa només s’executa si l’estat actual coincideix amb l’empremta posterior.
8. Restaura el valor serialitzat original i en verifica l’empremta.

## Límits d’autoritat

- NAVIGATOR continua sent `actorKind: artificial`.
- L’operació i la Retrodansa conserven `humanDecision: null` perquè romanen dins el mandat reversible.
- El rebut no és reutilitzable després de canviar la revisió MATRIX.
- Qualsevol material creatiu real, estat mixt, xarxa, persistència externa o publicació queda fora d’aquest adaptador i requereix una frontera humana separada.
- El contracte regula autoritat i traça; no executa codi creatiu arbitrari ni concedeix permisos generals.

## Criteri d’acceptació

La prova de navegador ha d’acreditar: aplicació perceptible sobre un fixture; immutabilitat dels altres registres i d’Arranjaments; traça vinculada a l’autorització; Retrodansa byte per byte; veto davant material mixt; absència de xarxa externa; i cap `humanDecision` artificial.
