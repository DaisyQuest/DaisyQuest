function freezeMetadata(metadata) {
  return Object.freeze({ ...(metadata ?? {}) });
}

export function createSpriteRecolorOp({ spriteId, paletteKey, metadata }) {
  if (!spriteId || !spriteId.trim()) {
    throw new Error("Sprite id is required.");
  }
  if (!paletteKey || !paletteKey.trim()) {
    throw new Error("Palette key is required.");
  }
  return Object.freeze({
    spriteId,
    paletteKey,
    metadata: freezeMetadata(metadata)
  });
}
