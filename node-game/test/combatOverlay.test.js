import { JSDOM } from "jsdom";
import { jest } from "@jest/globals";
import { updateCombatOverlayState } from "../public/ui/combatOverlay.js";

describe("combat overlay state", () => {
  test("keeps the map panel persistent during combat", () => {
    const dom = new JSDOM("<section id=\"map\" data-tab-panel=\"map\"></section>");
    const mapPanel = dom.window.document.getElementById("map");
    const appShell = dom.window.document.body;
    const tabController = {
      setActive: jest.fn(),
      getActiveValue: jest.fn(() => "map")
    };

    const result = updateCombatOverlayState({
      mapPanel,
      tabController,
      activeState: "combat",
      flowStateToTab: { combat: "combat", map: "map" },
      overlayRoot: appShell
    });

    expect(result).toBe(true);
    expect(mapPanel.dataset.tabPersistent).toBe("true");
    expect(appShell.dataset.combatOverlay).toBe("active");
    expect(tabController.setActive).toHaveBeenCalledWith("combat");
  });

  test("removes persistence when combat ends", () => {
    const dom = new JSDOM("<section id=\"map\" data-tab-panel=\"map\" data-tab-persistent=\"true\"></section>");
    const mapPanel = dom.window.document.getElementById("map");
    const appShell = dom.window.document.body;
    const tabController = {
      setActive: jest.fn(),
      getActiveValue: jest.fn(() => "map")
    };

    const result = updateCombatOverlayState({
      mapPanel,
      tabController,
      activeState: "map",
      flowStateToTab: { combat: "combat", map: "map" },
      overlayRoot: appShell
    });

    expect(result).toBe(false);
    expect(mapPanel.dataset.tabPersistent).toBeUndefined();
    expect(appShell.dataset.combatOverlay).toBe("inactive");
    expect(tabController.setActive).toHaveBeenCalledWith("map");
  });

  test("returns false when required inputs are missing", () => {
    const tabController = { setActive: jest.fn() };
    expect(updateCombatOverlayState()).toBe(false);
    expect(updateCombatOverlayState({ tabController, activeState: "combat" })).toBe(false);
    expect(updateCombatOverlayState({ mapPanel: {}, activeState: "combat" })).toBe(false);
  });

  test("skips tab updates when no target tab is available", () => {
    const dom = new JSDOM("<section id=\"map\" data-tab-panel=\"map\"></section>");
    const mapPanel = dom.window.document.getElementById("map");
    const tabController = { setActive: jest.fn() };

    const result = updateCombatOverlayState({
      mapPanel,
      tabController,
      activeState: "unknown",
      flowStateToTab: {}
    });

    expect(result).toBe(false);
    expect(mapPanel.dataset.tabPersistent).toBeUndefined();
    expect(tabController.setActive).not.toHaveBeenCalled();
  });

  test("falls back to the tab controller active value when no mapping exists", () => {
    const dom = new JSDOM("<section id=\"map\" data-tab-panel=\"map\"></section>");
    const mapPanel = dom.window.document.getElementById("map");
    const tabController = {
      setActive: jest.fn(),
      getActiveValue: jest.fn(() => "map")
    };

    const result = updateCombatOverlayState({
      mapPanel,
      tabController,
      activeState: "combat",
      flowStateToTab: {}
    });

    expect(result).toBe(true);
    expect(tabController.setActive).toHaveBeenCalledWith("map");
  });
});
