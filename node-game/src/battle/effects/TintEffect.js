export function createTintEffect({ startMs, endMs, tintOp }) {
  validateTiming(startMs, endMs, "Tint");
  if (!tintOp) {
    throw new Error("Tint operation is required.");
  }
  return Object.freeze({
    startMs,
    endMs,
    tintOp
  });
}

export function isTintEffectActive(tintEffect, timeMs) {
  return timeMs >= tintEffect.startMs && timeMs < tintEffect.endMs;
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
