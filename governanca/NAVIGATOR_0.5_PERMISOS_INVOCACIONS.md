# NAVIGATOR 0.5 · permisos i invocacions delegades

**Estat:** proposta de contracte · revisable · no canònica  
**Antecedent:** [NAVIGATOR 0.4 · MATRIX](./NAVIGATOR_0.4_MATRIX.md)  
**Objectiu:** permetre que NAVIGATOR i els instruments del Còdex s’invoquin entre si amb permisos explícits, heretats i limitats.

## Principi

Una invocació obre una travessa; no crea autoritat nova. El mandat humà continua sent l’arrel dels permisos. NAVIGATOR pot activar una operació ja inclosa en el mandat, demanar una ampliació o delegar una part més estreta a un instrument. Cap invocació artificial pot elevar el seu propi abast.

## Qui pot invocar

Una missió pot començar per:

- **persona**: defineix el propòsit, els programes, les operacions i els límits;
- **NAVIGATOR**: obre una travessa dins un mandat humà vigent;
- **instrument del Còdex**: sol·licita una travessa o rep una delegació restringida.

Cada invocació registra invokerKind, invokerId, parentInvocationId si n’hi ha, el mandat d’arrel i l’hora. Una invocació d’instrument sense mandat heretat vàlid queda en estat permission-requested; encara no pot operar.

## Capes de permís

1. **Límits constitucionals** — agència humana, drets i consentiment, privacitat, reversibilitat, procedència, Navalla d’Occam i QUIES/REOBSERVE. No es poden delegar ni reordenar.
2. **Mandat de missió** — programes, operacions, efectes, pressupostos i caducitat que declara la persona.
3. **Abast de la invocació** — subconjunt concret que rep NAVIGATOR o un instrument per a una travessa.
4. **Autorització d’operació** — comprovació del permís contra l’estat actual, l’objecte i el tipus d’efecte.

Una operació només s’accepta si passa totes quatre capes. La manca d’un camp o una procedència no verificable produeix denegació i rastre, no un permís implícit.

## Delegació només decreixent

Una invocació filla pot rebre:

- menys programes que la invocació mare;
- menys operacions i classes d’efecte;
- un pressupost igual o menor;
- una caducitat igual o anterior;
- el mateix límit o un de més restrictiu per a dades, xarxa i persistència.

La intersecció és obligatòria: permís filla = permís mare ∩ abast sol·licitat. Si la intersecció queda buida, no s’obre la invocació. Els permisos no es poden encadenar per recuperar allò que una invocació anterior havia exclòs. La mare pot tancar o revocar les filles i aquesta revocació s’aplica abans de qualsevol operació nova.

## Classes d’efecte

| Classe | Permís dins la travessa |
| --- | --- |
| observe / suggest | NAVIGATOR o l’instrument pot observar l’abast declarat i registrar una proposta. |
| virtual-reversible | Pot modificar, provar, comparar i revertir una còpia virtual amb pressupost finit. |
| codex-reversible | Pot preparar una operació d’adaptador reversible enumerada al mandat, amb retorn verificat i registre abans/després. |
| external, canonical, irreversible | Aturada al llindar humà; requereix decisió nova, exacta i d’un sol ús. |

Un permís per observar no inclou permís per escriure. suggest no executa la proposta. Un permís per a un adaptador no cobreix xarxa, publicació, canonització ni cap altra classe d’efecte.

## Sol·licitud d’ampliació

Quan una operació queda fora de l’abast, NAVIGATOR pot registrar una petició amb:

- operació i programa sol·licitats;
- efecte previst i empremta de l’objecte;
- motiu, alternatives més estretes i reversió disponible;
- cost previst, límit i caducitat.

La petició no suspèn els frens ni permet continuar per una ruta alternativa equivalent. La persona pot approve, return, deny, quiet o halt. L’aprovació incorpora només els camps exactes de la petició, caduca segons el límit declarat i no es reutilitza en una altra acció.

## Invocacions i reentrada

Una invocació pot iniciar una altra eina del Còdex només si l’operació de sortida i el destí consten al seu abast. L’eina receptora obté una invocació filla amb referència al pare i al mandat d’arrel; no rep el rastre complet si no li cal. En tornar, NAVIGATOR registra el resultat, les proves, els efectes i les dades que l’eina no ha pogut verificar.

La reentrada no crea un bucle: cada cicle consumeix pressupost compartit de la missió, i l’identificador d’una operació no es pot tornar a executar si la seva autorització ja s’ha consumit. Davant estat obsolet, autorització revocada, caducitat, pressupost exhaurit o resultat ambigu: QUIES / REOBSERVE.

## Rastre mínim

Cada esdeveniment d’invocació conserva:

- mandateId, invocationId, parentInvocationId i identitat de l’invocador;
- abast demanat, concedit i denegat;
- programa, operació i classe d’efecte;
- pressupost consumit, caducitat i estat de revocació;
- decisió humana, vinculada a l’acció exacta quan n’hi ha;
- resultats, empremtes, reversió i procedència.

L’exportació ha de permetre reconstruir qui va invocar qui, sota quin permís i quin resultat va tornar, sense convertir la traça en permís.

## Criteris d’acceptació

NAVIGATOR 0.5 només es pot donar per implementat quan les proves demostrin que:

1. persona, NAVIGATOR i instruments poden invocar segons el seu rol;
2. una invocació artificial sense mandat només pot demanar permís;
3. cap delegació filla amplia programes, operacions, efectes, pressupost o durada;
4. la revocació, expiració i estat obsolet bloquegen qualsevol operació posterior;
5. cada permís extern o irreversible és específic, d’un sol ús i aprovat per una persona;
6. un rebuig, quietud o manca de resposta no es transforma en aprovació;
7. la cadena completa d’invocacions es pot llegir i tancar sense perdre procedència.

Aquesta proposta descriu el model d’autoritat. No habilita cap permís operatiu nou fins que el contracte executable i els adaptadors corresponents el validin.
