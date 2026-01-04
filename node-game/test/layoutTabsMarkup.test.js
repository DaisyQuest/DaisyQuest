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
        expect(panel.dataset.tabPersistent).toBe("true");
      } else {
        expect(panel.hasAttribute("hidden")).toBe(true);
        expect(panel.classList.contains("tab-overlay")).toBe(true);
      }
    });
  });

  test("keeps map-side content inside the map panel card", () => {
    const mapPanel = document.getElementById("tab-panel-map");
    expect(mapPanel).not.toBeNull();
    expect(mapPanel.querySelector("#log")).not.toBeNull();
    expect(mapPanel.querySelector("#milestone-list")).not.toBeNull();
    expect(mapPanel.querySelector("#battle-scene")).not.toBeNull();
  });
});
