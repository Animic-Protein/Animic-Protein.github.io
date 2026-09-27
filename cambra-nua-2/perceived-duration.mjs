export function parsePerceivedDuration(value) {
  const input = String(value ?? "").trim().replace(",", ".");
  const clock = input.match(/^(\d+):(\d{1,2}(?:\.\d+)?)$/);
  if (clock) {
    const minutes = Number(clock[1]);
    const seconds = Number(clock[2]);
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || seconds >= 60) {
      return null;
    }
    const total = minutes * 60 + seconds;
    return total > 0 ? total : null;
  }
  if (!/^\d+(?:\.\d+)?$/.test(input)) return null;
  const seconds = Number(input);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

export function formatDuration(totalSeconds) {
  const value = Number(totalSeconds);
  if (!Number.isFinite(value) || value < 0) return "—";
  const minutes = Math.floor(value / 60);
  const seconds = value - minutes * 60;
  const wholeSeconds = Math.floor(seconds);
  const tenths = Math.round((seconds - wholeSeconds) * 10);
  const adjustedWhole = tenths === 10 ? wholeSeconds + 1 : wholeSeconds;
  const adjustedMinutes = adjustedWhole === 60 ? minutes + 1 : minutes;
  const normalizedSeconds = adjustedWhole === 60 ? 0 : adjustedWhole;
  const fraction = tenths === 10 ? 0 : tenths;
  return `${adjustedMinutes}′${String(normalizedSeconds).padStart(2, "0")}${fraction ? `.${fraction}` : ""}″`;
}
