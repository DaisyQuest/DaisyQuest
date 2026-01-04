import { getLayerOrderIndex } from "../rendering/renderLayer.js";

export function createBattleSceneGraph({ pipeline, nodes = [] }) {
  if (!pipeline) {
    throw new Error("Render pipeline is required.");
  }
  if (!Array.isArray(nodes)) {
    throw new Error("Render nodes are required.");
  }
  validateNodeOrder(nodes);
  const orderedNodes = Object.freeze([...nodes]);
  return Object.freeze({
    pipeline,
    orderedNodes,
    nodesForLayer(layer) {
      return orderedNodes.filter((node) => node.layer === layer);
    }
  });
}

function validateNodeOrder(nodes) {
  let lastOrder = -1;
  for (const node of nodes) {
    if (!node) {
      throw new Error("Render node cannot be null.");
    }
    const order = getLayerOrderIndex(node.layer);
    if (order < 0) {
      throw new Error("Render node uses unknown layer.");
    }
    if (order < lastOrder) {
      throw new Error("Render nodes must be ordered by layer.");
    }
    lastOrder = order;
  }
}
