import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const mime = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript" };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const file = path.resolve(root, `.${pathname}`, pathname.endsWith("/") ? "index.html" : "");
    if (!file.startsWith(root + path.sep)) throw new Error("Path fora del Site");
    response.writeHead(200, { "content-type": `${mime[path.extname(file)] || "application/octet-stream"}; charset=utf-8` });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404);
    response.end("No trobat");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    screen: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const legacy = {
    tempo: "72", count: "8", omit: "6", color: "COBALT", ghost: true,
    decision: "Rastre anterior",
  };
  await page.addInitScript((record) => {
    if (!localStorage.getItem("cambra.salaBlanca")) {
      localStorage.setItem("cambra.salaBlanca", JSON.stringify(record));
    }
  }, legacy);
  await page.goto(`http://127.0.0.1:${server.address().port}/cambra-nua-2/`, { waitUntil: "networkidle" });

  await page.locator('[data-mobile="time"]').tap();
  assert.equal(await page.getByRole("link", { name: /Entrar a l’exercici del temps/ }).getAttribute("href"), "./espera.html");
  await page.locator('[data-mobile="trace"]').tap();
  assert.equal(await page.locator("#traceData .trace-capture").count(), 1);
  assert.match(await page.locator("#traceData .trace-capture").textContent(), /Rastre anterior/);
  assert.equal(await page.locator("#traceData .trace-capture").first().getAttribute("aria-label"), "Captura 1");

  await page.locator('[data-mobile="time"]').tap();
  await page.locator('[data-decision="Sostenir el blanc un cicle més"]').tap();
  assert.equal(await page.locator("#traceData .trace-capture").count(), 2);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("cambra.salaBlanca")).length), 2);
  await page.locator('[data-mobile="time"]').tap();
  await page.locator('[data-decision="Desplaçar la llum següent"]').tap();
  assert.equal(await page.locator("#traceData .trace-capture").count(), 3);

  await page.reload({ waitUntil: "networkidle" });
  await page.locator('[data-mobile="trace"]').tap();
  const captures = page.locator("#traceData .trace-capture");
  assert.equal(await captures.count(), 3, "les tres captures han de persistir després de recarregar");
  assert.equal(await captures.first().getAttribute("aria-label"), "Captura 3");
  assert.match(await captures.first().textContent(), /Desplaçar la llum següent/);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, "la vista mòbil no ha de desbordar horitzontalment");

  await page.locator("#forget").tap();
  assert.equal(await page.evaluate(() => localStorage.getItem("cambra.salaBlanca")), null);
  assert.equal(await page.locator("#traceData .trace-capture").count(), 0);

  const timePage = await context.newPage();
  await timePage.addInitScript(() => {
    let now = 1000;
    Object.defineProperty(performance, "now", { configurable: true, value: () => now });
    window.advanceTestClock = (milliseconds) => { now += milliseconds; };
  });
  await timePage.goto(`http://127.0.0.1:${server.address().port}/cambra-nua-2/espera.html`, { waitUntil: "networkidle" });
  assert.equal(await timePage.locator("#canonTitle").isVisible(), false, "la disposició canònica no ha d’induir la resposta abans de la mesura");
  await timePage.locator("#start").tap();
  assert.equal(await timePage.locator("#estimate").isVisible(), false, "no es mostra la durada mentre corre el cronòmetre");
  assert.equal(await timePage.locator("#chrono").textContent(), "—", "el temps real roman ocult durant l’espera");
  await timePage.evaluate(() => window.advanceTestClock(668000));
  await timePage.locator("#start").tap();
  await timePage.locator("#perceived").fill("09:33");
  await timePage.locator("#reveal").tap();
  assert.equal(await timePage.locator("#canonTitle").isVisible(), true, "la disposició canònica es mostra després de la comparació");
  assert.equal(await timePage.locator("#chrono").textContent(), "11′08″");
  assert.equal(await timePage.locator("#felt").textContent(), "9′33″");
  await timePage.locator("#emergence").fill("idea de prova no persistent");
  assert.equal(await timePage.locator("#historyList .capture").count(), 1);
  assert.equal(await timePage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, "l’exercici no ha de desbordar en mòbil");
  await timePage.reload({ waitUntil: "networkidle" });
  assert.equal(await timePage.locator("#historyList .capture").count(), 1, "la captura local persisteix en recarregar");
  assert.equal(await timePage.locator("#emergence").inputValue(), "", "la nota creativa no es conserva en recarregar");
  assert.equal(await timePage.evaluate(() => localStorage.getItem("animic.codex.temporal-fragments/v1").includes("idea de prova no persistent")), false, "la nota creativa no entra a l’historial");
  await timePage.goto(`http://127.0.0.1:${server.address().port}/cambra-nua-2/fragment-circulation.html?from=espera`, { waitUntil: "networkidle" });
  await timePage.locator("#reveal").tap();
  const organLinks = await timePage.locator("[data-open-organ]").evaluateAll((links) => Object.fromEntries(links.map((link) => [link.dataset.openOrgan, new URL(link.href).pathname + new URL(link.href).hash])));
  assert.deepEqual(organLinks, {
    "cambra-nua-del-temps": "/cambra-nua-2/",
    "biblioteca-de-ressonancies": "/cartographia-mutabilis/",
    compost: "/fusio-total/index.html#compost",
    "inter-nos": "/inter-nos-creative/#interlocutor",
  }, "cada òrgan ha d’obrir la seva ruta real");
  await timePage.locator('[data-route="compost"]').tap();
  assert.equal(await timePage.locator("#routes").isVisible(), true, "la llista no es plega després de relacionar");
  assert.match(await timePage.locator("#routeStatus").textContent(), /Relació guardada amb Compost/);
  assert.equal(await timePage.evaluate(() => {
    const records = Object.values(JSON.parse(localStorage.getItem("animic.codex.temporal-fragments/v1")));
    return records[0].relation.filter((item) => item.kind === "return-to-compost").length;
  }), 1, "la selecció desa una sola relació reversible");
  await timePage.locator('[data-open-organ="compost"]').tap();
  assert.equal(new URL(timePage.url()).pathname, "/fusio-total/index.html");
  assert.equal(new URL(timePage.url()).hash, "#compost");
  await timePage.goto(`http://127.0.0.1:${server.address().port}/cambra-nua-2/espera.html`, { waitUntil: "networkidle" });
  await timePage.locator("#clearHistory").tap();
  assert.equal(await timePage.locator("#historyList .capture").count(), 0, "la retirada explícita dissol les captures d’aquest exercici");
  console.log("Cambra Nua · proves Chromium mòbil: OK");
} finally {
  await browser?.close();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
