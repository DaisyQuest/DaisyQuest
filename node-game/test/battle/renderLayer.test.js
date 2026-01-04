import { getLayerOrderIndex, RenderLayer, RENDER_LAYER_ORDER } from "../../src/battle/rendering/renderLayer.js";

describe("render layer", () => {
  test("returns order index", () => {
    expect(getLayerOrderIndex(RenderLayer.BACKGROUND)).toBe(0);
    expect(getLayerOrderIndex(RenderLayer.UI_CAPTIONS)).toBe(RENDER_LAYER_ORDER.length - 1);
  });

  test("returns -1 for unknown layer", () => {
    expect(getLayerOrderIndex("unknown")).toBe(-1);
  });
});
