export function createTimedParticleEffect({ startMs, endMs, particleOp }) {
  validateTiming(startMs, endMs, "Particle");
  if (!particleOp) {
    throw new Error("Particle operation is required.");
  }
  return Object.freeze({
    startMs,
    endMs,
    particleOp
  });
}

export function isTimedParticleActive(timedParticleEffect, timeMs) {
  return timeMs >= timedParticleEffect.startMs && timeMs < timedParticleEffect.endMs;
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
