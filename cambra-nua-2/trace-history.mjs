export const TRACE_HISTORY_KEY = "cambra.salaBlanca";
export const TRACE_HISTORY_LIMIT = 20;

export function readTraceHistory(storage) {
  const raw = storage.getItem(TRACE_HISTORY_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(isCapture).slice(-TRACE_HISTORY_LIMIT);
    if (isCapture(parsed)) {
      const history = [parsed];
      try {
        storage.setItem(TRACE_HISTORY_KEY, JSON.stringify(history));
      } catch {}
      return history;
    }
  } catch {}
  return [];
}

export function appendTrace(storage, capture) {
  const history = [...readTraceHistory(storage), capture].slice(-TRACE_HISTORY_LIMIT);
  storage.setItem(TRACE_HISTORY_KEY, JSON.stringify(history));
  return history;
}

export function renderTraceHistory(history) {
  return [...history].reverse().map((capture, index) => {
    const number = history.length - index;
    const material = `${capture.count} polsos a ${capture.tempo} BPM`;
    const absence = `Pols ${capture.omit} omès`;
    const room = capture.ghost
      ? "La llum verda ha retornat després de l’ocre"
      : "Rastre no confirmat";
    return `<article class="trace-capture" aria-label="Captura ${number}">
      <h3>Captura ${number}</h3>
      <div><small>MATERIAL</small><p>${escapeHtml(material)}</p></div>
      <div><small>ABSÈNCIA</small><p>${escapeHtml(absence)}</p></div>
      <div><small>RESPOSTA DE LA SALA</small><p>${room}</p></div>
      <div><small>DECISIÓ</small><p>${escapeHtml(capture.decision || "Encara oberta")}</p></div>
    </article>`;
  }).join("");
}

function isCapture(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}
