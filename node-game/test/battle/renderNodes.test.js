import {
  createArenaNode,
  createBackgroundNode,
  createFxNode,
  createSpriteNode,
  createUiNode
} from "../../src/battle/scene/renderNodes.js";

describe("render nodes", () => {
  test("validates node inputs", () => {
    expect(() => createBackgroundNode({ id: "", backgroundKey: "forest" })).toThrow(
      "Background node id is required"
    );
    expect(() => createArenaNode({ id: "arena", arenaKey: "" })).toThrow("Arena key is required");
    expect(() => createSpriteNode({ id: "sprite", spriteKey: "" })).toThrow("Sprite key is required");
    expect(() => createFxNode({ id: "fx", fxKey: "" })).toThrow("FX key is required");
    expect(() => createUiNode({ id: "ui", captionText: "" })).toThrow("UI caption text is required");
  });

  test("freezes metadata", () => {
    const node = createBackgroundNode({ id: "bg", backgroundKey: "forest", metadata: { depth: "0" } });
    expect(() => {
      node.metadata.extra = "x";
    }).toThrow();
  });
});
