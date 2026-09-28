import {
  loadTemporalFragments,
  routeTemporalFragment,
  TEMPORAL_FRAGMENT_TARGETS,
} from "./temporal-fragment.js";

const view = document.querySelector("#view");
const labels = {
  "cambra-nua-del-temps": "Cambra Nua del Temps",
  "biblioteca-de-ressonancies": "Cartographia Mutabilis · Biblioteca de Ressonàncies",
  compost: "Compost",
  "inter-nos": "INTER NOS",
};

function latest(rows) {
  return [...rows].sort((a, b) =>
    String(b?.provenance?.createdAt || b?.source?.createdAt || "").localeCompare(
      String(a?.provenance?.createdAt || a?.source?.createdAt || ""),
    ),
  )[0];
}

function lastTarget(record) {
  const relation = [...(record.relation || [])]
    .reverse()
    .find((item) => item.kind?.startsWith("return-to-"));
  return relation?.target || "cambra-nua-del-temps";
}

function empty() {
  view.innerHTML = `<section class="panel"><div class="empty">
    <p class="ey">NO HI HA CAP FRAGMENT ACTIU</p>
    <h2>Primer ha de passar alguna cosa.</h2>
    <p>Fes una única prova a la Cambra Nua. Quan revelis la diferència, el fragment quedarà conservat i tornaràs aquí.</p>
    <a class="button primary" href="./espera.html?return=circulation">Entrar a Espera sense rellotge →</a>
  </div></section>`;
}

function render(showRoutes = false, notice = "") {
  const record = latest(loadTemporalFragments());
  if (!record) return empty();

  const active = lastTarget(record);
  const routed = new Set((record.relation || []).map((item) => item.target));
  routed.add("cambra-nua-del-temps");
  const difference = Number(record.fragment?.difference || 0);
  const destinations = Object.entries(TEMPORAL_FRAGMENT_TARGETS);

  view.innerHTML = `<section class="panel hero"><p class="ey">FRAGMENT ACTIU</p>
    <div class="origin"><div><p class="state">${difference >= 0 ? "+" : ""}${difference.toFixed(1)} s de diferència percebuda</p>
    <p class="mut">${Number(record.fragment?.chronological || 0).toFixed(1)} s cronològics · ${Number(record.fragment?.perceived || 0).toFixed(1)} s percebuts</p>
    <p class="difference">Origen: Cambra Nua · Espera sense rellotge</p></div>
    <div class="id">${record.provenance?.originId || "—"}</div></div>
    <p class="mut">Aquest fragment és únic, reversible i no canònic.</p></section>
    <section class="breath" id="breath"><p class="ey">LATÈNCIA ORGÀNICA</p>
    <p>El fragment pot quedar aquí. No cal escollir una destinació perquè existeixi.</p>
    <button id="reveal" type="button" ${showRoutes ? "hidden" : ""}>🐜 Insinuar continuacions possibles</button></section>
    <section class="panel" id="routes" ${showRoutes ? "" : "hidden"}>
    <p class="ey">DECISIÓ DE RETORN</p><p class="mut">Una connexió disponible no és una instrucció. Relacionar conserva la decisió; obrir et porta a l’òrgan.</p>
    <p id="routeStatus" class="mut" role="status" aria-live="polite">${notice}</p>
    <div class="route">${destinations.map(([target, destination]) => {
      const alreadyRelated = routed.has(target);
      const href = destination.href || "#";
      return `<article class="organ ${active === target ? "active" : ""}" data-organ="${target}">
        <span class="badge ${alreadyRelated ? "on" : ""}">${active === target ? "ACTIU" : alreadyRelated ? "RELACIONAT" : "DISPONIBLE"}</span>
        <h2>${labels[target] || destination.purpose}</h2><p class="mut">${destination.purpose}</p>
        <div class="actions"><button class="button primary" data-route="${target}" type="button">${alreadyRelated ? "Relacionat · obrir quan vulguis" : "Relacionar aquest fragment"}</button>
        <a class="button" data-open-organ="${target}" href="${href}">Obrir l’òrgan</a></div></article>`;
    }).join("")}</div></section>
    <details><summary>Veure rastre de circulació</summary><section class="panel"><div class="timeline">${(record.relation || []).map((item) =>
      `<div class="event"><strong>${item.kind}</strong><span class="mut">${item.target || "—"} · ${item.at || ""}</span></div>`,
    ).join("") || '<div class="mut">Encara no hi ha retorns registrats.</div>'}</div></section></details>`;

  const routes = view.querySelector("#routes");
  view.querySelector("#reveal")?.addEventListener("click", () => {
    routes.hidden = false;
    view.querySelector("#reveal").hidden = true;
    window.FormigaPont?.show?.("pont", "Hi ha continuacions possibles. Cap no exigeix ser travessada.", "#routes", "Veure sense decidir");
  });

  view.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.route;
      const alreadyRelated = (record.relation || []).some((item) => item.target === target);
      routeTemporalFragment(record.id, target);
      const label = labels[target] || target;
      const message = alreadyRelated
        ? `Aquest fragment ja està relacionat amb ${label}. No s’ha duplicat.`
        : `Relació guardada amb ${label}. Ara pots obrir l’òrgan o continuar aquí.`;
      render(true, message);
      window.FormigaPont?.show?.("pont", message, TEMPORAL_FRAGMENT_TARGETS[target]?.href || "#routes", "Obrir l’òrgan");
    });
  });
}

render();
