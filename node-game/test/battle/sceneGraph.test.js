import { createRenderPipeline } from "../../src/battle/rendering/renderPipeline.js";
import { createBattleSceneGraph } from "../../src/battle/scene/battleSceneGraph.js";
import { createBackgroundNode, createArenaNode, createSpriteNode, createUiNode } from "../../src/battle/scene/renderNodes.js";

const pipeline = createRenderPipeline();

describe("battle scene graph", () => {
  test("maintains ordered nodes", () => {
    const graph = createBattleSceneGraph({
      pipeline,
      nodes: [
        createBackgroundNode({ id: "bg-1", backgroundKey: "forest" }),
        createArenaNode({ id: "arena-1", arenaKey: "ring" }),
        createSpriteNode({ id: "sprite-1", spriteKey: "hero" }),
        createUiNode({ id: "ui-1", captionText: "Ready" })
      ]
    });

    expect(graph.orderedNodes).toHaveLength(4);
    expect(graph.nodesForLayer(graph.orderedNodes[0].layer)).toHaveLength(1);
  });

  test("defaults to empty nodes array", () => {
    const graph = createBattleSceneGraph({ pipeline });
    expect(graph.orderedNodes).toEqual([]);
  });

  test("rejects invalid nodes", () => {
    expect(() => createBattleSceneGraph({ pipeline: null, nodes: [] })).toThrow(
      "Render pipeline is required"
    );
    expect(() => createBattleSceneGraph({ pipeline, nodes: null })).toThrow("Render nodes are required");
    expect(() => createBattleSceneGraph({ pipeline, nodes: [null] })).toThrow("Render node cannot be null");
  });

  test("rejects out-of-order nodes", () => {
    expect(() =>
      createBattleSceneGraph({
        pipeline,
        nodes: [
          createUiNode({ id: "ui-1", captionText: "Late" }),
          createSpriteNode({ id: "sprite-1", spriteKey: "hero" })
        ]
      })
    ).toThrow("Render nodes must be ordered by layer");
  });

  test("rejects unknown layers", () => {
    const fakeNode = Object.freeze({ id: "fake", layer: "unknown", renderType: "fake" });
    expect(() => createBattleSceneGraph({ pipeline, nodes: [fakeNode] })).toThrow(
      "Render node uses unknown layer"
    );
  });
});
