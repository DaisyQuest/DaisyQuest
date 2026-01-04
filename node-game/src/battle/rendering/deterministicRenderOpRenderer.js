import { Renderer } from "./renderer.js";
import { createRenderOp } from "./renderOp.js";
import { createRenderResult } from "./renderResult.js";
import { RenderLayer } from "./renderLayer.js";

export class DeterministicRenderOpRenderer extends Renderer {
  constructor(pipeline) {
    super();
    if (!pipeline) {
      throw new Error("Render pipeline is required.");
    }
    this.pipeline = pipeline;
  }

  render(sceneGraph, frame) {
    if (!sceneGraph || !frame) {
      throw new Error("Scene graph and frame are required.");
    }
    const ops = [];
    for (const layer of this.pipeline.orderedLayers) {
      this.#appendLayerOps(layer, sceneGraph, frame, ops);
    }
    return createRenderResult({ renderOps: ops });
  }

  #appendLayerOps(layer, sceneGraph, frame, ops) {
    const nodes = sceneGraph.nodesForLayer(layer);
    for (const node of nodes) {
      ops.push(
        createRenderOp({
          layer,
          opType: node.renderType,
          targetId: node.id,
          metadata: node.metadata
        })
      );
    }
    if (layer === RenderLayer.SPRITE_BASE) {
      this.#appendSpriteRecolors(frame.spriteRecolorOps, ops);
    }
    if (layer === RenderLayer.SPRITE_FRAME_OVERLAY) {
      this.#appendOverlayOps(frame.overlayOps, ops);
    }
    if (layer === RenderLayer.FX_OVERLAY) {
      this.#appendParticleOps(frame.particleOps, ops);
      this.#appendTintOps(frame.screenTintOps, ops);
    }
  }

  #appendOverlayOps(overlayOps, ops) {
    for (const overlayOp of overlayOps) {
      ops.push(
        createRenderOp({
          layer: RenderLayer.SPRITE_FRAME_OVERLAY,
          opType: "overlay",
          targetId: overlayOp.overlayId,
          metadata: overlayOp.metadata
        })
      );
    }
  }

  #appendSpriteRecolors(spriteRecolorOps, ops) {
    for (const recolorOp of spriteRecolorOps) {
      ops.push(
        createRenderOp({
          layer: RenderLayer.SPRITE_BASE,
          opType: "palette_swap",
          targetId: recolorOp.spriteId,
          metadata: recolorOp.metadata
        })
      );
    }
  }

  #appendTintOps(screenTintOps, ops) {
    for (const tintOp of screenTintOps) {
      ops.push(
        createRenderOp({
          layer: RenderLayer.FX_OVERLAY,
          opType: "screen_tint",
          targetId: tintOp.tintId,
          metadata: tintOp.metadata
        })
      );
    }
  }

  #appendParticleOps(particleOps, ops) {
    for (const particleOp of particleOps) {
      ops.push(
        createRenderOp({
          layer: RenderLayer.FX_OVERLAY,
          opType: "particle",
          targetId: particleOp.effectId,
          metadata: particleOp.metadata
        })
      );
    }
  }
}
