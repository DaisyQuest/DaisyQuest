import { RenderLayer } from "../rendering/renderLayer.js";

function freezeMetadata(metadata) {
  return Object.freeze({ ...(metadata ?? {}) });
}

function validateId(id, label) {
  if (!id || !id.trim()) {
    throw new Error(`${label} id is required.`);
  }
}

function validateKey(key, label) {
  if (!key || !key.trim()) {
    throw new Error(`${label} key is required.`);
  }
}

export function createBackgroundNode({ id, backgroundKey, metadata }) {
  validateId(id, "Background node");
  validateKey(backgroundKey, "Background");
  return Object.freeze({
    id,
    renderType: "background",
    layer: RenderLayer.BACKGROUND,
    backgroundKey,
    metadata: freezeMetadata(metadata)
  });
}

export function createArenaNode({ id, arenaKey, metadata }) {
  validateId(id, "Arena node");
  validateKey(arenaKey, "Arena");
  return Object.freeze({
    id,
    renderType: "arena",
    layer: RenderLayer.ARENA,
    arenaKey,
    metadata: freezeMetadata(metadata)
  });
}

export function createSpriteNode({ id, spriteKey, metadata }) {
  validateId(id, "Sprite node");
  validateKey(spriteKey, "Sprite");
  return Object.freeze({
    id,
    renderType: "sprite",
    layer: RenderLayer.SPRITE_BASE,
    spriteKey,
    metadata: freezeMetadata(metadata)
  });
}

export function createFxNode({ id, fxKey, metadata }) {
  validateId(id, "FX node");
  validateKey(fxKey, "FX");
  return Object.freeze({
    id,
    renderType: "fx",
    layer: RenderLayer.FX_OVERLAY,
    fxKey,
    metadata: freezeMetadata(metadata)
  });
}

export function createUiNode({ id, captionText, metadata }) {
  validateId(id, "UI node");
  if (!captionText || !captionText.trim()) {
    throw new Error("UI caption text is required.");
  }
  return Object.freeze({
    id,
    renderType: "ui_caption",
    layer: RenderLayer.UI_CAPTIONS,
    captionText,
    metadata: freezeMetadata(metadata)
  });
}
