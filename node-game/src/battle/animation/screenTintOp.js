function freezeMetadata(metadata) {
  return Object.freeze({ ...(metadata ?? {}) });
}

export function createScreenTintOp({ tintId, colorHex, intensity, metadata }) {
  if (!tintId || !tintId.trim()) {
    throw new Error("Tint id is required.");
  }
  if (!colorHex || !colorHex.trim()) {
    throw new Error("Tint color is required.");
  }
  if (typeof intensity !== "number" || intensity < 0 || intensity > 1) {
    throw new Error("Tint intensity must be between 0 and 1.");
  }
  return Object.freeze({
    tintId,
    colorHex,
    intensity,
    metadata: freezeMetadata(metadata)
  });
}
