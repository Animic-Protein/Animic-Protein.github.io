# IMPULS OPERATIU 1.2

## Què és

L'Impuls no és motivació psicològica, recompensa ni gamificació. És la capa que respon una sola pregunta: **què fa que alguna cosa mereixi moure's ara?**

No crea nous òrgans, no és un agent i no substitueix la decisió humana. Llegeix senyals ja existents —interns o provinents de fonts i agents externs— i proposa un únic següent gest reversible.

## Arquitectura constitucional

**senyals → suggestedImpulse → humanDecision → acció → provenance**

`SuggestedImpulse` i `humanDecision` no són la mateixa cosa. L'Impuls pertany al Còdex: és una proposta. La decisió pertany a la persona: pot acceptar-la, rebutjar-la o desviar-se'n.

La proposta no executa cap acció. La divergència no és un error que el sistema hagi de corregir.

## Agents externs i sobirania

Una persona convidada, SciSpace, Longbridge, una IA, un sensor, una gravació, una base de dades o qualsevol futur agent especialitzat pot aportar alteritat al Còdex. Cap agent extern decideix directament què passa a formar part d'ANÍMIC Protein.

L'Impuls és la membrana operativa que permet que aquests agents facin pressió sobre el Còdex sense adquirir-ne sobirania.

**agent/font exterior → source → fragment → diferència → possible MUTATIO → relació → suggestedImpulse → humanDecision → provenance → Còdex metabolitza**

## Fonts de senyal

- Homeòstasi: indica si convé observar, reescoltar o reduir dispersió.
- Pressió: distingeix activitat de tensió significativa.
- Formiga: indica una relació exterior significativa.
- Cambra Nua: aporta diferències perceptibles temporals.
- Sistema circulatori: mostra si un fragment ja ha passat per diversos òrgans o encara no ha retornat.
- Fonts i agents externs: poden aportar diferències, dades, relacions o anomalies sempre amb procedència explícita.

## Estats proposables

- `quiet` — no hi ha cap senyal prou fort; no es força acció.
- `relate` — hi ha matèria viva però poca densitat relacional; proposa relacionar abans d'afegir.
- `reobserve` — el context és insuficient o ha canviat; proposa reescoltar abans de tornar a intervenir.
- `transform` — hi ha tensió significativa o diferència perceptible amb rastre.
- `return` — hi ha un fragment amb procedència suficient per circular cap a un únic òrgan pertinent.

## Regles

1. **Occam:** un únic `suggestedImpulse` visible cada vegada.
2. Cap impuls és ordre ni acció automàtica.
3. Activitat sola no crea impuls de transformació.
4. La latència no equival a prescindibilitat.
5. **Incertesa:** si l'evidència no basta, es prefereix `quiet` o `reobserve`.
6. **Reversibilitat:** proposar no executa res; tota acció posterior ha de poder deixar rastre i, quan sigui possible, revertir-se.
7. **Decisió humana:** la persona pot coincidir amb la proposta o desviar-se'n.
8. `suggestedImpulse` i `humanDecision` es conserven separadament a provenance.
9. L'Impuls no canonitza.
10. Cap agent extern adquireix autoritat de decisió pel fet d'aportar un senyal.

## Divergència i Error Fèrtil

Quan `suggestedImpulse !== humanDecision`, el Còdex no resol automàticament la discrepància i no determina qui tenia raó.

La divergència es conserva com a **candidata a Error Fèrtil** amb estat `unresolved` i `canonical: false`. Només una observació posterior pot mostrar si aquella desviació revela alguna cosa que la proposta del sistema no havia pogut percebre, o a l'inrevés.

Això converteix la diferència entre sistema i persona en informació viva sense convertir-la en veritat.

## Fórmula curta

**Percebre → distingir tensió → proposar → deixar decidir → actuar → conservar proposta, decisió i discrepància.**

## Fórmula constitucional

**El Còdex proposa. La persona decideix. La discrepància roman oberta. L'experiència transforma. El Còdex recorda.**
