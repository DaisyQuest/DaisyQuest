import { Renderer } from "../../src/battle/rendering/renderer.js";

describe("renderer base", () => {
  test("throws when not implemented", () => {
    const renderer = new Renderer();
    expect(() => renderer.render()).toThrow("Renderer.render must be implemented");
  });
});
