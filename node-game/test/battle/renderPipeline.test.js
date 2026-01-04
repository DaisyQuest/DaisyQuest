import { createRenderPipeline } from "../../src/battle/rendering/renderPipeline.js";
import { RENDER_LAYER_ORDER, RenderLayer } from "../../src/battle/rendering/renderLayer.js";

describe("render pipeline", () => {
  test("creates default pipeline order", () => {
    const pipeline = createRenderPipeline();
    expect(pipeline.orderedLayers).toEqual(RENDER_LAYER_ORDER);
    expect(() => pipeline.orderedLayers.push("extra")).toThrow();
  });

  test("rejects empty or null layers", () => {
    expect(() => createRenderPipeline("layers")).toThrow("Render pipeline must define at least one layer");
    expect(() => createRenderPipeline([])).toThrow("Render pipeline must define at least one layer");
    expect(() => createRenderPipeline([RenderLayer.BACKGROUND, null])).toThrow(
      "Render pipeline cannot contain null layers"
    );
  });

  test("rejects duplicates", () => {
    expect(() =>
      createRenderPipeline([
        RenderLayer.BACKGROUND,
        RenderLayer.ARENA,
        RenderLayer.SPRITE_BASE,
        RenderLayer.SPRITE_BASE,
        RenderLayer.SPRITE_FRAME_OVERLAY,
        RenderLayer.FX_OVERLAY,
        RenderLayer.UI_CAPTIONS
      ])
    ).toThrow("Render pipeline contains duplicate layer");
  });

  test("requires all render layers", () => {
    expect(() => createRenderPipeline([RenderLayer.BACKGROUND, RenderLayer.ARENA])).toThrow(
      "Render pipeline must contain all render layers"
    );
  });
});
