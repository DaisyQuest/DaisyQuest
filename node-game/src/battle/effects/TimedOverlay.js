export function createTimedOverlay({ startMs, endMs, overlayOp }) {
  validateTiming(startMs, endMs, "Overlay");
  if (!overlayOp) {
    throw new Error("Overlay operation is required.");
  }
  return Object.freeze({
    startMs,
    endMs,
    overlayOp
  });
}

export function isTimedOverlayActive(timedOverlay, timeMs) {
  return timeMs >= timedOverlay.startMs && timeMs < timedOverlay.endMs;
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
