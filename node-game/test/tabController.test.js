import { JSDOM } from "jsdom";
import { createTabController } from "../public/ui/tabController.js";

describe("tab controller", () => {
  it("toggles active classes for buttons and panels", () => {
    const dom = new JSDOM(
      `
        <button class="layout-tab-button" data-tab-target="battle"></button>
        <button class="layout-tab-button" data-tab-target="map"></button>
        <section data-tab-panel="battle"></section>
        <section data-tab-panel="map"></section>
      `
    );
    const doc = dom.window.document;
    const buttons = doc.querySelectorAll(".layout-tab-button");
    const panels = doc.querySelectorAll("[data-tab-panel]");

    const controller = createTabController({
      buttons,
      panels,
      buttonKey: "tabTarget",
      panelKey: "tabPanel"
    });

    controller.setActive("map");

    expect(buttons[0].classList.contains("is-active")).toBe(false);
    expect(buttons[1].classList.contains("is-active")).toBe(true);
    expect(panels[0].classList.contains("is-active")).toBe(false);
    expect(panels[1].classList.contains("is-active")).toBe(true);
  });

  it("wires click handlers to switch tabs", () => {
    const dom = new JSDOM(
      `
        <button class="layout-tab-button" data-tab-target="battle"></button>
        <button class="layout-tab-button" data-tab-target="map"></button>
        <section data-tab-panel="battle"></section>
        <section data-tab-panel="map"></section>
      `,
      { runScripts: "dangerously" }
    );
    const doc = dom.window.document;
    const buttons = doc.querySelectorAll(".layout-tab-button");
    const panels = doc.querySelectorAll("[data-tab-panel]");

    const controller = createTabController({
      buttons,
      panels,
      buttonKey: "tabTarget",
      panelKey: "tabPanel"
    });

    controller.wire();
    buttons[1].dispatchEvent(new dom.window.Event("click", { bubbles: true }));

    expect(buttons[0].classList.contains("is-active")).toBe(false);
    expect(buttons[1].classList.contains("is-active")).toBe(true);
    expect(panels[0].classList.contains("is-active")).toBe(false);
    expect(panels[1].classList.contains("is-active")).toBe(true);
  });
});
