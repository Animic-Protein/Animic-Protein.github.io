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
  await page.addInitScript((record) => localStorage.setItem("cambra.salaBlanca", JSON.stringify(record)), legacy);
  await page.goto(`http://127.0.0.1:${server.address().port}/cambra-nua-2/`, { waitUntil: "networkidle" });

  await page.locator('[data-mobile="trace"]').tap();
  assert.equal(await page.locator("#traceData .trace-capture").count(), 1);
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("cambra.salaBlanca"))), [legacy]);
  assert.equal(await page.locator("#traceData .trace-capture").first().getAttribute("aria-label"), "Captura 1");

  await page.locator('[data-mobile="time"]').tap();
  await page.locator('[data-decision="Sostenir el blanc un cicle més"]').tap();
  assert.equal(await page.locator("#traceData .trace-capture").count(), 2);
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
  console.log("Cambra Nua · proves Chromium mòbil: OK");
} finally {
  await browser?.close();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
