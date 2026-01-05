import fs from "fs";
import { JSDOM } from "jsdom";

describe("context menu markup", () => {
  const html = fs.readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  const dom = new JSDOM(html);
  const { document } = dom.window;

  test("anchors the context menu inside the combat panel", () => {
    const combatPanel = document.getElementById("tab-panel-combat");
    const mapPanel = document.getElementById("tab-panel-map");

    expect(combatPanel).not.toBeNull();
    expect(mapPanel).not.toBeNull();

    const anchor = combatPanel.querySelector("#combat-context-menu-anchor");
    expect(anchor).not.toBeNull();
    expect(anchor.classList.contains("combat-context-menu-anchor")).toBe(true);
    expect(mapPanel.querySelector("#combat-context-menu-anchor")).toBeNull();
  });
});
