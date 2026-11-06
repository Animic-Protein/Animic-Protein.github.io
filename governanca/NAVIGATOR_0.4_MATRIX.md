# NAVIGATOR 0.4 · MATRIX i supernavegant adaptatiu

**Estat:** contracte executable de banc de proves · virtual · reversible · no canònic  
**Actor:** `artificial`  
**Contracte:** `governanca/navigator-matrix.mjs`  
**Antecedent:** `NAVIGATOR 0.3`

## Imatge operativa

Còdex Viu és el món relacional. **MATRIX** n’és una còpia virtual, aïllada i retornable. **NAVIGATOR** és el supernavegant: pot recórrer-la, generar hipòtesis, modificar programes virtuals, provar-los, comparar resultats i reprogramar el seu itinerari segons les condicions observades i el mandat humà.

La metàfora de Neo indica capacitat de travessa, no omnipotència. NAVIGATOR continua sent `actorKind: artificial`: no es converteix en persona, autor final ni font de `humanDecision`.

## Nova distribució de l’autoritat

### 1. Mandat humà inicial

La persona obre una missió i declara:

- propòsit i programes disponibles;
- operacions reversibles permeses;
- prioritats creatives o tècniques afegides;
- pressupost de cicles, revisions i esdeveniments;
- caducitat, si escau.

El mandat no aprova per endavant una publicació, una canonització ni una acció irreversible. Delimita el terreny en què NAVIGATOR pot operar autònomament.

### 2. Autonomia dins MATRIX

Sense demanar una decisió a cada pas, NAVIGATOR pot:

`observar → orientar → reprogramar una còpia → provar → comparar → conservar o fer Retrodansa → reobservar`

Una revisió només es conserva dins MATRIX si passa les proves declarades. Si falla, el programa torna automàticament a l’última revisió vàlida i el fracàs queda registrat com a evidència. Cap revisió virtual adquireix rang canònic.

Un adaptador del Còdex real també pot operar sense una nova decisió pas a pas quan el mandat l’enumera expressament, l’objecte és dins l’abast i existeix un rollback verificat. El contracte només emet `ready-for-reversible-adapter`; cada adaptador és responsable d’aplicar l’efecte i demostrar-ne el retorn.

### 3. HumanDecision a la frontera

`humanDecision` deixa de ser un peatge per a cada moviment reversible i reapareix a l’última instància, abans de:

- persistir fora de MATRIX;
- modificar el Còdex real fora d’un adaptador reversible ja autoritzat;
- publicar o canonitzar;
- usar xarxa, credencials o serveis externs;
- afectar material creatiu real o dades personals;
- executar qualsevol acció sense retorn verificable.

La decisió queda lligada a una sola acció, objecte i empremta. No es pot reutilitzar com a permís general. Aprovar deixa el pas `ready-for-external-executor`: el contracte 0.4 no executa per si sol l’efecte real.

## Prioritats constitucionals

L’ordre no pot ser reescrit per NAVIGATOR:

1. agència i última instància humanes;
2. seguretat, drets, consentiment i dades;
3. reversibilitat;
4. traçabilitat;
5. fidelitat al mandat;
6. diferència perceptible;
7. Navalla d’Occam;
8. incertesa: `QUIES / REOBSERVE`.

La persona pot afegir prioritats de missió després d’aquestes. NAVIGATOR pot proposar-ne, però no elevar-les per damunt dels frens constitucionals.

## Límits de la reprogramació

- Només treballa amb programes marcats `virtual: true` i `canonical: false`.
- Cada revisió declara condició, observació, empremta anterior, empremta candidata, resultat de proves i retorn.
- Els pressupostos impedeixen bucles indefinits.
- Un estat antic no pot crear una branca paral·lela silenciosa.
- Una decisió pendent bloqueja nous cicles fins que la persona aprova, retorna, descarta o tria quietud.
- La persona o el sistema poden activar l’aturada total.

Aquest contracte regula la traça i l’autoritat; no és una barrera de seguretat contra codi hostil. Els futurs adaptadors del Còdex real hauran d’aplicar els mateixos límits abans de produir efectes.

## Prioritats de desenvolupament

1. **MATRIX mínima executable.** Còpies virtuals, revisions, proves i rollback sense tocar `main`.
2. **Mandat i prioritats.** Interfície perquè la persona ordeni la missió, l’abast i els pressupostos.
3. **Motor adaptatiu.** Condició → proposta → revisió → prova → avaluació → Retrodansa o nova iteració.
4. **Adaptadors reversibles.** Un instrument cada vegada; primer LIMEN o Còdex Creature, amb fixture sintètic.
5. **Gate de frontera.** Decisió humana exacta abans de persistència, xarxa, cànon o irreversibilitat.
6. **Rastre exportable.** JSON llegible amb mandat, prioritats, revisions, proves, retorns i decisió final.

## Criteri d’acceptació 0.4

El banc de proves ha de demostrar: mandat humà explícit; actor artificial; prioritats constitucionals immutables; reprogramació només virtual; rollback davant prova fallida; límits de pressupost; veto a estats obsolets; aturada total; i `humanDecision` obligatòria i vinculada a l’acció exacta abans de qualsevol frontera real.
