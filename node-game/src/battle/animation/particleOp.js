function freezeMetadata(metadata) {
  return Object.freeze({ ...(metadata ?? {}) });
}

export function createParticleOp({ effectId, particleCount, metadata }) {
  if (!effectId || !effectId.trim()) {
    throw new Error("Effect id is required.");
  }
  if (!Number.isInteger(particleCount) || particleCount < 0) {
    throw new Error("Particle count cannot be negative.");
  }
  return Object.freeze({
    effectId,
    particleCount,
    metadata: freezeMetadata(metadata)
  });
}
