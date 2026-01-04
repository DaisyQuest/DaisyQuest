function freezeMetadata(metadata) {
  return Object.freeze({ ...(metadata ?? {}) });
}

export function createRenderOp({ layer, opType, targetId, metadata }) {
  if (!layer) {
    throw new Error("Render layer is required.");
  }
  if (!opType || !opType.trim()) {
    throw new Error("Operation type is required.");
  }
  if (!targetId || !targetId.trim()) {
    throw new Error("Target id is required.");
  }
  return Object.freeze({
    layer,
    opType,
    targetId,
    metadata: freezeMetadata(metadata)
  });
}
