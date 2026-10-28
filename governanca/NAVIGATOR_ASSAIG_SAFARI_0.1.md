# NAVIGATOR · assaig manual per a Safari 0.1

**Estat:** recorregut web fictici · temporal per pestanya · no canònic  
**Entrada després de desplegar la PR:** `https://animic-protein.github.io/codex-creature/?navigator-rehearsal=1#harmonia`

## Ús des d’un iPhone

1. Obre l’enllaç d’assaig en una pestanya de Safari.
2. Revisa el fragment fictici `Fixture NAVIGATOR · traspàs fictici` a Harmonia.
3. Tria manualment **Aprovar traspàs**, **Retornar** o **Descartar**.
4. Llegeix el resultat observat a la banda superior. NAVIGATOR no prem el botó ni tria per la persona.
5. Prem **Acabar i esborrar el fixture** abans de sortir. La interfície elimina les dues claus temporals de l’assaig i et retorna a la portada del Còdex.

## Límits i neteja

- El fixture és fix i fictici; no hi introdueixis material real ni dades personals.
- El mode selecciona `sessionStorage` de la pestanya en lloc de `localStorage`. No llegeix ni modifica les dades habituals de Còdex Creature.
- El traspàs aprovat crea una còpia del fixture només dins la sessió temporal del navegador. La pàgina no envia dades ni fitxers al servidor.
- **Acabar i esborrar el fixture** elimina les dues claus temporals i el marcador del mode. Tancar la pestanya també tanca la sessió de navegador; el botó és la neteja explícita recomanada.
- És una prova manual de la interfície en Safari. No executa l’adaptador Playwright ni el contracte executable de NAVIGATOR, i no és una validació automatitzada del protocol.
