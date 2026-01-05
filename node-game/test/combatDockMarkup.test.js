import fs from "fs";
import { JSDOM } from "jsdom";

describe("combat dock markup", () => {
  const html = fs.readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  const dom = new JSDOM(html);
  const { document } = dom.window;

  test("anchors the combat dock under the combat panel card", () => {
    const combatPanel = document.getElementById("tab-panel-combat");
    expect(combatPanel).not.toBeNull();
    expect(combatPanel?.classList.contains("combat-panel")).toBe(true);

    const combatDock = combatPanel?.querySelector("[data-combat-dock]");
    expect(combatDock).not.toBeNull();
    expect(combatDock?.classList.contains("combat-dock")).toBe(true);
  });

  test("includes a battle stage element for layout sizing", () => {
    const combatDock = document.querySelector("[data-combat-dock]");
    const battleStage = combatDock?.querySelector("[data-battle-stage]");
    expect(battleStage).not.toBeNull();
    expect(battleStage?.classList.contains("battle-stage")).toBe(true);
    expect(battleStage?.classList.contains("battle-stage--compact")).toBe(true);
  });

  test("includes combat action grids and readouts", () => {
    const combatPanel = document.getElementById("tab-panel-combat");
    expect(combatPanel?.querySelector(".combat-hud__body")).not.toBeNull();
    expect(combatPanel?.querySelector("#weapon-attack-list")).not.toBeNull();
    expect(combatPanel?.querySelector("#skill-list")).not.toBeNull();
    expect(combatPanel?.querySelector(".combat-readouts")).not.toBeNull();
  });
});
