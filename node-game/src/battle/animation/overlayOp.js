function freezeMetadata(metadata) {
  return Object.freeze({ ...(metadata ?? {}) });
}

export function createOverlayOp({ overlayId, assetKey, priority = 0, metadata }) {
  if (!overlayId || !overlayId.trim()) {
    throw new Error("Overlay id is required.");
  }
  if (!assetKey || !assetKey.trim()) {
    throw new Error("Overlay asset key is required.");
  }
  if (!Number.isInteger(priority) || priority < 0) {
    throw new Error("Overlay priority cannot be negative.");
  }
  return Object.freeze({
    overlayId,
    assetKey,
    priority,
    metadata: freezeMetadata(metadata)
  });
}
