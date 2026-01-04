import { JSDOM } from "jsdom";
import {
  applyWorldMapPanelLayout,
  WORLD_MAP_PANEL_HEIGHT
} from "../public/ui/worldMapPanel.js";

describe("world map panel layout", () => {
  it("applies default sizing to the map panel and layout container", () => {
    const dom = new JSDOM(
      "<div class=\"map-layout\" id=\"layout\"><div id=\"panel\"><div class=\"world-panel__surface\" id=\"surface\"></div></div></div>"
    );
    const layout = dom.window.document.getElementById("layout");
    const panel = dom.window.document.getElementById("panel");
    const surface = dom.window.document.getElementById("surface");

    applyWorldMapPanelLayout({ layout, panel, surface });

    expect(panel.style.height).toBe(WORLD_MAP_PANEL_HEIGHT);
    expect(panel.style.minHeight).toBe(WORLD_MAP_PANEL_HEIGHT);
    expect(panel.dataset.layoutHeight).toBe(WORLD_MAP_PANEL_HEIGHT);
    expect(layout.style.height).toBe(WORLD_MAP_PANEL_HEIGHT);
    expect(layout.style.minHeight).toBe(WORLD_MAP_PANEL_HEIGHT);
    expect(layout.dataset.layoutHeight).toBe(WORLD_MAP_PANEL_HEIGHT);
    expect(surface.style.height).toBe("100%");
    expect(surface.style.flex).toBe("1 1 0%");
  });

  it("supports custom sizing overrides", () => {
    const dom = new JSDOM("<div id=\"panel\"></div>");
    const panel = dom.window.document.getElementById("panel");

    applyWorldMapPanelLayout({ panel, height: "80vh" });

    expect(panel.style.height).toBe("80vh");
    expect(panel.style.minHeight).toBe("80vh");
    expect(panel.dataset.layoutHeight).toBe("80vh");
  });

  it("handles missing optional elements safely", () => {
    const dom = new JSDOM("<div id=\"panel\"></div>");
    const panel = dom.window.document.getElementById("panel");

    expect(() => applyWorldMapPanelLayout({ panel })).not.toThrow();
  });

  it("throws when the map panel element is missing", () => {
    expect(() => applyWorldMapPanelLayout()).toThrow(
      "World map panel element is required."
    );
  });

  it("renders a snapshot for the map panel layout", () => {
    const dom = new JSDOM(
      "<div class=\"map-layout\" id=\"layout\"><div id=\"panel\"><div class=\"world-panel__surface\" id=\"surface\"></div></div></div>"
    );
    const layout = dom.window.document.getElementById("layout");
    const panel = dom.window.document.getElementById("panel");
    const surface = dom.window.document.getElementById("surface");

    applyWorldMapPanelLayout({ layout, panel, surface });

    expect(layout.outerHTML).toMatchSnapshot();
  });
});
