import { createRenderOp } from "../../src/battle/rendering/renderOp.js";
import { RenderLayer } from "../../src/battle/rendering/renderLayer.js";

describe("render op", () => {
  test("validates required fields", () => {
    expect(() => createRenderOp({ layer: null, opType: "op", targetId: "id" })).toThrow(
      "Render layer is required"
    );
    expect(() => createRenderOp({ layer: RenderLayer.ARENA, opType: "", targetId: "id" })).toThrow(
      "Operation type is required"
    );
    expect(() => createRenderOp({ layer: RenderLayer.ARENA, opType: "op", targetId: "" })).toThrow(
      "Target id is required"
    );
  });

  test("freezes metadata", () => {
    const op = createRenderOp({
      layer: RenderLayer.ARENA,
      opType: "arena",
      targetId: "arena-1",
      metadata: { key: "value" }
    });
    expect(op.metadata.key).toBe("value");
    expect(() => {
      op.metadata.extra = "nope";
    }).toThrow();
  });
});
