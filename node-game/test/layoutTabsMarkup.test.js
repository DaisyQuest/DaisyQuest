import fs from "fs";
import { JSDOM } from "jsdom";

describe("layout tab markup", () => {
  const html = fs.readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  const dom = new JSDOM(html);
  const { document } = dom.window;
  const tabButtons = Array.from(document.querySelectorAll(".layout-tab-button"));
  const panels = Array.from(document.querySelectorAll("[data-tab-panel]"));

  test("renders one card panel per layout tab", () => {
    const targets = tabButtons.map((button) => button.dataset.tabTarget);
    const uniqueTargets = new Set(targets);
    expect(targets.length).toBe(uniqueTargets.size);

    uniqueTargets.forEach((target) => {
      const matches = panels.filter((panel) => panel.dataset.tabPanel === target);
      expect(matches).toHaveLength(1);
      expect(matches[0].id).toMatch(/tab-panel-/);
    });
  });

  test("hides inactive layout panels in markup", () => {
    panels.forEach((panel) => {
      if (panel.dataset.tabPanel === "map") {
        expect(panel.hasAttribute("hidden")).toBe(false);
        expect(panel.dataset.tabPersistent).toBeUndefined();
      } else {
        expect(panel.hasAttribute("hidden")).toBe(true);
        expect(panel.classList.contains("tab-overlay")).toBe(true);
      }
    });
  });

  test("declares layered app surfaces for background, canvas, and overlay", () => {
    const shell = document.querySelector(".app-shell");
    expect(shell).not.toBeNull();
    const layers = Array.from(shell?.children ?? []).filter((child) =>
      child.classList.contains("app-layer")
    );
    const layerClasses = layers.map((layer) =>
      Array.from(layer.classList).find((name) => name.startsWith("app-layer--"))
    );
    expect(layerClasses).toEqual([
      "app-layer--background",
      "app-layer--canvas",
      "app-layer--overlay"
    ]);
  });

  test("keeps map-side content inside the map panel card", () => {
    const mapPanel = document.getElementById("tab-panel-map");
    const overlayLayer = document.querySelector(".app-layer--overlay");
    expect(mapPanel).not.toBeNull();
    expect(mapPanel.querySelector("#log")).toBeNull();
    expect(mapPanel.querySelector("#milestone-list")).not.toBeNull();
    expect(overlayLayer?.querySelector("#log")).not.toBeNull();
    expect(mapPanel.querySelector("#battle-scene")).toBeNull();
  });

  test("keeps combat controls inside the combat panel card", () => {
    const combatPanel = document.getElementById("tab-panel-combat");
    expect(combatPanel).not.toBeNull();
    expect(combatPanel.querySelector("#battle-scene")).not.toBeNull();
    expect(combatPanel.querySelector("#hotbar-slots")).not.toBeNull();
    expect(combatPanel.querySelector("#spellbook-list")).not.toBeNull();
  });
});
