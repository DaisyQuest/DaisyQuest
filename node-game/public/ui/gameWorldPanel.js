const DEFAULT_PANEL_HEIGHT = "min(70vh, 720px)";

const DEFAULT_GAME_WORLD_LAYERS = Object.freeze([
  {
    id: "terrain",
    label: "WorldMap / Land / LandType",
    category: "background"
  },
  {
    id: "scenery",
    label: "Scenery",
    category: "scenery"
  },
  {
    id: "objects",
    label: "Objects",
    category: "objects"
  },
  {
    id: "entities",
    label: "Entities",
    category: "entities"
  },
  {
    id: "overlays",
    label: "Overlays",
    category: "overlays"
  }
]);

export const GAME_WORLD_LAYERS = DEFAULT_GAME_WORLD_LAYERS;
export const GAME_WORLD_PANEL_HEIGHT = DEFAULT_PANEL_HEIGHT;

export function getLayerOrderIndex(layerId, layers = GAME_WORLD_LAYERS) {
  return layers.findIndex((layer) => layer.id === layerId);
}

export function applyGameWorldPanelLayout(
  panel,
  { height = GAME_WORLD_PANEL_HEIGHT, minHeight = height } = {}
) {
  if (!panel) {
    throw new Error("Game world panel element is required.");
  }
  panel.style.height = height;
  panel.style.minHeight = minHeight;
  panel.dataset.layoutHeight = height;
  return panel;
}

export function createGameWorldLayerStack({ container, layers = GAME_WORLD_LAYERS } = {}) {
  if (!container) {
    throw new Error("Game world layer container is required.");
  }
  const doc = container.ownerDocument || document;
  const layerElements = layers.map((layer, index) => {
    const layerElement = doc.createElement("div");
    layerElement.className = "game-world-layer";
    layerElement.dataset.layer = layer.id;
    layerElement.dataset.order = String(index);
    layerElement.dataset.category = layer.category;
    layerElement.style.zIndex = String(index + 1);

    const label = doc.createElement("span");
    label.className = "game-world-layer__label";
    label.textContent = layer.label;
    layerElement.append(label);
    return layerElement;
  });

  container.dataset.renderStrategy = "ordered-layer-stack";
  container.replaceChildren(...layerElements);

  return Object.freeze({ layers: [...layers], layerElements });
}

export function renderGameWorldLayers({
  layers = GAME_WORLD_LAYERS,
  renderLayer
} = {}) {
  if (typeof renderLayer !== "function") {
    throw new Error("renderLayer callback is required to render game world layers.");
  }

  return layers.map((layer, index) => renderLayer(layer, index));
}
