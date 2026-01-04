import { JSDOM } from "jsdom";
import {
  applyGameWorldPanelLayout,
  createGameWorldLayerStack,
  GAME_WORLD_LAYERS,
  GAME_WORLD_PANEL_HEIGHT,
  getLayerOrderIndex,
  renderGameWorldLayers
} from "../public/ui/gameWorldPanel.js";

describe("game world panel", () => {
  it("applies the default panel layout height", () => {
    const dom = new JSDOM("<div id=\"panel\"></div>");
    const panel = dom.window.document.getElementById("panel");

    applyGameWorldPanelLayout(panel);

    expect(panel.style.height).toBe(GAME_WORLD_PANEL_HEIGHT);
    expect(panel.style.minHeight).toBe(GAME_WORLD_PANEL_HEIGHT);
    expect(panel.dataset.layoutHeight).toBe(GAME_WORLD_PANEL_HEIGHT);
  });

  it("supports custom layout heights", () => {
    const dom = new JSDOM("<div id=\"panel\"></div>");
    const panel = dom.window.document.getElementById("panel");

    applyGameWorldPanelLayout(panel, { height: "65vh", minHeight: "60vh" });

    expect(panel.style.height).toBe("65vh");
    expect(panel.style.minHeight).toBe("60vh");
    expect(panel.dataset.layoutHeight).toBe("65vh");
  });

  it("builds the layer stack in deterministic order", () => {
    const dom = new JSDOM("<div id=\"stack\"></div>");
    const stack = dom.window.document.getElementById("stack");

    const { layerElements } = createGameWorldLayerStack({ container: stack });

    const ids = Array.from(stack.children).map((element) => element.dataset.layer);
    const orders = Array.from(stack.children).map((element) => element.dataset.order);
    const zIndexes = Array.from(stack.children).map((element) => element.style.zIndex);

    expect(ids).toEqual(GAME_WORLD_LAYERS.map((layer) => layer.id));
    expect(orders).toEqual(GAME_WORLD_LAYERS.map((_, index) => String(index)));
    expect(zIndexes).toEqual(GAME_WORLD_LAYERS.map((_, index) => String(index + 1)));
    expect(layerElements).toHaveLength(GAME_WORLD_LAYERS.length);
    expect(stack.dataset.renderStrategy).toBe("ordered-layer-stack");
  });

  it("throws when the layer stack container is missing", () => {
    expect(() => createGameWorldLayerStack()).toThrow(
      "Game world layer container is required."
    );
  });

  it("returns the correct layer order index", () => {
    expect(getLayerOrderIndex("objects")).toBe(2);
    expect(getLayerOrderIndex("missing")).toBe(-1);
  });

  it("renders layers in order via the provided callback", () => {
    const calls = [];

    const results = renderGameWorldLayers({
      renderLayer: (layer, index) => {
        calls.push(`${index}:${layer.id}`);
        return layer.id;
      }
    });

    expect(calls).toEqual(GAME_WORLD_LAYERS.map((layer, index) => `${index}:${layer.id}`));
    expect(results).toEqual(GAME_WORLD_LAYERS.map((layer) => layer.id));
  });

  it("throws when no render callback is provided", () => {
    expect(() => renderGameWorldLayers()).toThrow(
      "renderLayer callback is required to render game world layers."
    );
  });

  it("renders a panel snapshot that fills most of the viewport", () => {
    const dom = new JSDOM("<div id=\"panel\"><div id=\"stack\"></div></div>");
    const panel = dom.window.document.getElementById("panel");
    const stack = dom.window.document.getElementById("stack");

    panel.className = "game-world-panel";
    stack.className = "game-world-layer-stack";

    applyGameWorldPanelLayout(panel);
    createGameWorldLayerStack({ container: stack });

    expect(panel.outerHTML).toMatchSnapshot();
  });
});
