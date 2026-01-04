import { createRenderPipeline } from "../../src/battle/rendering/renderPipeline.js";
import { DeterministicRenderOpRenderer } from "../../src/battle/rendering/deterministicRenderOpRenderer.js";
import { RenderLayer } from "../../src/battle/rendering/renderLayer.js";
import { createBattleSceneGraph } from "../../src/battle/scene/battleSceneGraph.js";
import { createBackgroundNode, createArenaNode, createSpriteNode, createFxNode, createUiNode } from "../../src/battle/scene/renderNodes.js";
import { createAnimationFrame } from "../../src/battle/animation/animationFrame.js";
import { createOverlayOp } from "../../src/battle/animation/overlayOp.js";
import { createSpriteRecolorOp } from "../../src/battle/animation/spriteRecolorOp.js";
import { createScreenTintOp } from "../../src/battle/animation/screenTintOp.js";
import { createParticleOp } from "../../src/battle/animation/particleOp.js";

describe("deterministic renderer", () => {
  test("produces ordered render ops", () => {
    const pipeline = createRenderPipeline();
    const graph = createBattleSceneGraph({
      pipeline,
      nodes: [
        createBackgroundNode({ id: "bg-1", backgroundKey: "forest" }),
        createArenaNode({ id: "arena-1", arenaKey: "ring" }),
        createSpriteNode({ id: "sprite-1", spriteKey: "hero" }),
        createFxNode({ id: "fx-1", fxKey: "smoke" }),
        createUiNode({ id: "ui-1", captionText: "Daisy strikes!" })
      ]
    });
    const frame = createAnimationFrame({
      durationMs: 16,
      overlayOps: [createOverlayOp({ overlayId: "overlay-1", assetKey: "slash", priority: 1 })],
      spriteRecolorOps: [createSpriteRecolorOp({ spriteId: "sprite-1", paletteKey: "hot" })],
      screenTintOps: [createScreenTintOp({ tintId: "tint-1", colorHex: "#fff", intensity: 0.2 })],
      particleOps: [createParticleOp({ effectId: "sparks", particleCount: 3 })]
    });
    const renderer = new DeterministicRenderOpRenderer(pipeline);

    const result = renderer.render(graph, frame);

    expect(result.renderOps[0].layer).toBe(RenderLayer.BACKGROUND);
    expect(result.renderOps[0].targetId).toBe("bg-1");
    expect(result.renderOps[2].layer).toBe(RenderLayer.SPRITE_BASE);
    expect(result.renderOps[3].layer).toBe(RenderLayer.SPRITE_BASE);
    expect(result.renderOps[4].layer).toBe(RenderLayer.SPRITE_FRAME_OVERLAY);
    expect(result.renderOps[5].layer).toBe(RenderLayer.FX_OVERLAY);
    expect(result.renderOps[6].layer).toBe(RenderLayer.FX_OVERLAY);
    expect(result.renderOps[7].layer).toBe(RenderLayer.FX_OVERLAY);
    expect(result.renderOps[8].layer).toBe(RenderLayer.UI_CAPTIONS);
  });

  test("rejects invalid inputs", () => {
    const renderer = new DeterministicRenderOpRenderer(createRenderPipeline());
    expect(() => renderer.render(null, { durationMs: 16 })).toThrow("Scene graph and frame are required");
    expect(() => renderer.render({ nodesForLayer: () => [] }, null)).toThrow("Scene graph and frame are required");
  });

  test("requires pipeline", () => {
    expect(() => new DeterministicRenderOpRenderer()).toThrow("Render pipeline is required");
  });
});
