import { JSDOM } from "jsdom";
import { createTabController } from "../public/ui/tabController.js";
import { createFlowState, FLOW_SCREENS } from "../public/ui/flowState.js";
import {
  createCombatScreenAdapter,
  createLootScreenAdapter,
  createMapScreenAdapter
} from "../public/ui/screenAdapters.js";

function buildLayoutDom() {
  const dom = new JSDOM(
    `
      <button class="layout-tab-button" data-tab-target="map"></button>
      <button class="layout-tab-button" data-tab-target="combat"></button>
      <button class="layout-tab-button" data-tab-target="inventory"></button>
      <section data-tab-panel="map"></section>
      <section data-tab-panel="combat"></section>
      <section data-tab-panel="inventory"></section>
    `
  );
  const doc = dom.window.document;
  const buttons = doc.querySelectorAll(".layout-tab-button");
  const panels = doc.querySelectorAll("[data-tab-panel]");
  return { dom, buttons, panels };
}

describe("screen adapters", () => {
  it("selects the correct screen when the flow state changes", () => {
    const { buttons, panels } = buildLayoutDom();
    const tabController = createTabController({
      buttons,
      panels,
      buttonKey: "tabTarget",
      panelKey: "tabPanel"
    });
    const flowState = createFlowState({ initialScreen: FLOW_SCREENS.MAP });

    const combatAdapter = createCombatScreenAdapter({ flowState, tabController });
    const mapAdapter = createMapScreenAdapter({ flowState, tabController });
    const lootAdapter = createLootScreenAdapter({ flowState, tabController });

    flowState.setScreen(FLOW_SCREENS.MAP);

    expect(buttons[0].classList.contains("is-active")).toBe(true);
    expect(panels[0].classList.contains("is-active")).toBe(true);

    flowState.setScreen(FLOW_SCREENS.LOOT);

    expect(buttons[2].classList.contains("is-active")).toBe(true);
    expect(panels[2].classList.contains("is-active")).toBe(true);

    flowState.setScreen(FLOW_SCREENS.COMBAT);

    expect(buttons[1].classList.contains("is-active")).toBe(true);
    expect(panels[1].classList.contains("is-active")).toBe(true);

    combatAdapter.sync();
    mapAdapter.destroy();
    lootAdapter.destroy();
  });

  it("exposes no-op adapters when dependencies are missing", () => {
    const combatAdapter = createCombatScreenAdapter();
    const mapAdapter = createMapScreenAdapter({});
    const lootAdapter = createLootScreenAdapter({ flowState: null, tabController: null });
    const mapAdapterDefault = createMapScreenAdapter();
    const lootAdapterDefault = createLootScreenAdapter();

    expect(combatAdapter).toEqual(expect.objectContaining({ destroy: expect.any(Function) }));
    expect(mapAdapter).toEqual(expect.objectContaining({ sync: expect.any(Function) }));
    expect(lootAdapter).toEqual(expect.objectContaining({ sync: expect.any(Function) }));
    expect(mapAdapterDefault).toEqual(expect.objectContaining({ sync: expect.any(Function) }));
    expect(lootAdapterDefault).toEqual(expect.objectContaining({ sync: expect.any(Function) }));

    expect(() => combatAdapter.sync()).not.toThrow();
    expect(() => mapAdapter.destroy()).not.toThrow();
    expect(() => lootAdapter.sync()).not.toThrow();
    expect(() => mapAdapterDefault.sync()).not.toThrow();
    expect(() => lootAdapterDefault.destroy()).not.toThrow();
  });
});
