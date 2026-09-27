import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  appendTrace,
  readTraceHistory,
  renderTraceHistory,
  TRACE_HISTORY_KEY,
  TRACE_HISTORY_LIMIT,
} from "./trace-history.mjs";

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

const capture = (decision) => ({ tempo: "72", count: "8", omit: "6", ghost: true, decision });

test("preserves and displays successive captures with the newest first", () => {
  const storage = memoryStorage();
  const first = appendTrace(storage, capture("Sostenir el blanc un cicle més"));
  const history = appendTrace(storage, capture("Desplaçar la llum següent"));

  assert.equal(first.length, 1);
  assert.equal(history.length, 2);
  const markup = renderTraceHistory(history);
  assert.ok(markup.indexOf("Desplaçar la llum següent") < markup.indexOf("Sostenir el blanc un cicle més"));
  assert.match(markup, /Captura 2[\s\S]*Captura 1/);
});

test("migrates the legacy single-object value and keeps it as the first capture", () => {
  const legacy = capture("Dissoldre la direcció");
  const storage = memoryStorage({ [TRACE_HISTORY_KEY]: JSON.stringify(legacy) });

  assert.deepEqual(readTraceHistory(storage), [legacy]);
  assert.deepEqual(JSON.parse(storage.getItem(TRACE_HISTORY_KEY)), [legacy]);
  assert.equal(appendTrace(storage, capture("Sostenir el blanc un cicle més")).length, 2);
});

test("reload reads the saved history and caps it at the configured limit", () => {
  const storage = memoryStorage();
  for (let index = 0; index < TRACE_HISTORY_LIMIT + 2; index += 1) {
    appendTrace(storage, capture(`decisió ${index}`));
  }

  const afterReload = readTraceHistory(storage);
  assert.equal(afterReload.length, TRACE_HISTORY_LIMIT);
  assert.equal(afterReload[0].decision, "decisió 2");
  assert.equal(afterReload.at(-1).decision, `decisió ${TRACE_HISTORY_LIMIT + 1}`);
});

test("mobile trace navigation still opens the same multi-capture region", async () => {
  const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
  const sw = await readFile(new URL("../sw.js", import.meta.url), "utf8");
  assert.match(html, /name="viewport"[\s\S]*?content="width=device-width/);
  assert.match(html, /<button data-mobile="trace"/);
  assert.match(html, /id="traceData" class="trace" aria-live="polite"/);
  assert.match(html, /@media\s*\(max-width:\s*\d+px\)/);
  assert.match(html, /openView\(t\.dataset\.mobile\)/);
  assert.match(html, /renderTraceHistory\(history\)/);
  assert.match(html, /id="forget"[\s\S]*?Dissoldre el rastre/);
  assert.match(html, /localStorage\.removeItem\("cambra\.salaBlanca"\)/);
  assert.match(sw, /'\.\/cambra-nua-2\/trace-history\.mjs'/);
});
