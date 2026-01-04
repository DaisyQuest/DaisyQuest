import { createRenderResult } from "../../src/battle/rendering/renderResult.js";
import { createRenderOp } from "../../src/battle/rendering/renderOp.js";
import { RenderLayer } from "../../src/battle/rendering/renderLayer.js";

describe("render result", () => {
  test("validates render ops input", () => {
    expect(() => createRenderResult({ renderOps: null })).toThrow("Render ops must be an array");
  });

  test("freezes render ops list", () => {
    const op = createRenderOp({ layer: RenderLayer.BACKGROUND, opType: "background", targetId: "bg-1" });
    const result = createRenderResult({ renderOps: [op] });
    expect(result.renderOps).toHaveLength(1);
    expect(() => result.renderOps.push(op)).toThrow();
  });

  test("defaults to empty render ops", () => {
    const result = createRenderResult({});
    expect(result.renderOps).toEqual([]);
  });
});
