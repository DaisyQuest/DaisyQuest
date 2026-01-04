export const RenderLayer = Object.freeze({
  BACKGROUND: "background",
  ARENA: "arena",
  SPRITE_BASE: "sprite_base",
  SPRITE_FRAME_OVERLAY: "sprite_frame_overlay",
  FX_OVERLAY: "fx_overlay",
  UI_CAPTIONS: "ui_captions"
});

export const RENDER_LAYER_ORDER = Object.freeze([
  RenderLayer.BACKGROUND,
  RenderLayer.ARENA,
  RenderLayer.SPRITE_BASE,
  RenderLayer.SPRITE_FRAME_OVERLAY,
  RenderLayer.FX_OVERLAY,
  RenderLayer.UI_CAPTIONS
]);

export function getLayerOrderIndex(layer) {
  return RENDER_LAYER_ORDER.indexOf(layer);
}
