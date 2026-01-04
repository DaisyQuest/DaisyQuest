export function createPaletteSwapEffect({ startMs, endMs, recolorOp }) {
  validateTiming(startMs, endMs, "Palette swap");
  if (!recolorOp) {
    throw new Error("Palette swap operation is required.");
  }
  return Object.freeze({
    startMs,
    endMs,
    recolorOp
  });
}

export function isPaletteSwapActive(paletteSwapEffect, timeMs) {
  return timeMs >= paletteSwapEffect.startMs && timeMs < paletteSwapEffect.endMs;
}

function validateTiming(startMs, endMs, label) {
  if (typeof startMs !== "number" || typeof endMs !== "number") {
    throw new Error(`${label} timing must be non-negative.`);
  }
  if (startMs < 0 || endMs < 0) {
    throw new Error(`${label} timing must be non-negative.`);
  }
  if (endMs < startMs) {
    throw new Error(`${label} end time must be after start time.`);
  }
}
