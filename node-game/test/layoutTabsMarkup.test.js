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
      if (panel.dataset.tabPanel === "battle") {
        expect(panel.hasAttribute("hidden")).toBe(false);
      } else {
        expect(panel.hasAttribute("hidden")).toBe(true);
      }
    });
  });

  test("keeps battle secondary content inside the battle panel card", () => {
    const battlePanel = document.getElementById("tab-panel-battle");
    expect(battlePanel).not.toBeNull();
    expect(battlePanel.querySelector("#log")).not.toBeNull();
    expect(battlePanel.querySelector("#milestone-list")).not.toBeNull();
  });
});
