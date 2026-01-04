import { RENDER_LAYER_ORDER } from "./renderLayer.js";

function validateRenderLayers(orderedLayers) {
  if (!Array.isArray(orderedLayers) || orderedLayers.length === 0) {
    throw new Error("Render pipeline must define at least one layer.");
  }
  const unique = new Set();
  for (const layer of orderedLayers) {
    if (!layer) {
      throw new Error("Render pipeline cannot contain null layers.");
    }
    if (unique.has(layer)) {
      throw new Error(`Render pipeline contains duplicate layer: ${layer}`);
    }
    unique.add(layer);
  }
  if (unique.size !== RENDER_LAYER_ORDER.length) {
    throw new Error("Render pipeline must contain all render layers.");
  }
}

export function createRenderPipeline(orderedLayers = RENDER_LAYER_ORDER) {
  validateRenderLayers(orderedLayers);
  return Object.freeze({ orderedLayers: Object.freeze([...orderedLayers]) });
}
