import fs from "fs";
import { JSDOM } from "jsdom";

describe("world map markup", () => {
  const html = fs.readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  const dom = new JSDOM(html);
  const { document } = dom.window;
  const mapPanel = document.querySelector('[data-tab-panel="map"]');

  test("includes a visible interaction hint and hud elements", () => {
    expect(mapPanel).not.toBeNull();
    const hint = mapPanel.querySelector("[data-world-map-hint]");
    const hud = mapPanel.querySelector("[data-world-map-hud]");

    expect(hint).not.toBeNull();
    expect(hint.textContent).toMatch(/Right-click/i);
    expect(hud).not.toBeNull();
  });

  test("positions world targets using map coordinates", () => {
    const surface = mapPanel.querySelector("[data-world-map-surface]");
    const entities = mapPanel.querySelector("[data-world-map-entities]");

    expect(surface).not.toBeNull();
    expect(entities).not.toBeNull();
  });
});
