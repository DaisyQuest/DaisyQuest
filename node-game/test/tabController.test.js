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
    expect(panels[0].hidden).toBe(true);
    expect(panels[1].hidden).toBe(false);
    expect(buttons[0].getAttribute("aria-selected")).toBe("false");
    expect(buttons[1].getAttribute("aria-selected")).toBe("true");
    expect(panels[0].getAttribute("aria-hidden")).toBe("true");
    expect(panels[1].getAttribute("aria-hidden")).toBe("false");
  });

  it("attaches click handlers when wiring", () => {
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

  it("defaults to the first active button when wiring", () => {
    const dom = new JSDOM(
      `
        <button class="layout-tab-button is-active" data-tab-target="battle"></button>
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

    controller.wire();

    expect(controller.getActiveValue()).toBe("battle");
    expect(buttons[0].getAttribute("aria-selected")).toBe("true");
    expect(panels[0].hidden).toBe(false);
    expect(panels[1].hidden).toBe(true);
  });

  it("falls back to the first button when no active button is set", () => {
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

    controller.wire();

    expect(controller.getActiveValue()).toBe("battle");
    expect(buttons[0].getAttribute("aria-selected")).toBe("true");
    expect(panels[0].hidden).toBe(false);
  });

  it("ignores unknown active values", () => {
    const dom = new JSDOM(
      `
        <button class="layout-tab-button is-active" data-tab-target="battle"></button>
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

    controller.wire();
    controller.setActive("unknown");

    expect(buttons[0].classList.contains("is-active")).toBe(true);
    expect(panels[0].classList.contains("is-active")).toBe(true);
    expect(panels[0].hidden).toBe(false);
  });

  it("handles empty button and panel lists", () => {
    const controller = createTabController({
      buttons: [],
      panels: [],
      buttonKey: "tabTarget",
      panelKey: "tabPanel"
    });

    expect(controller.getActiveValue()).toBeNull();
    controller.wire();
    controller.setActive("battle");
  });

  it("handles undefined button and panel lists", () => {
    const controller = createTabController({
      buttonKey: "tabTarget",
      panelKey: "tabPanel"
    });

    expect(controller.getActiveValue()).toBeNull();
    controller.wire();
    controller.setActive("battle");
  });

  it("keeps persistent panels visible while switching tabs", () => {
    const dom = new JSDOM(
      `
        <button class="layout-tab-button" data-tab-target="battle"></button>
        <button class="layout-tab-button" data-tab-target="map"></button>
        <section data-tab-panel="battle"></section>
        <section data-tab-panel="map" data-tab-persistent="true"></section>
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

    controller.setActive("battle");

    const mapPanel = panels[1];
    expect(mapPanel.classList.contains("is-active")).toBe(true);
    expect(mapPanel.hidden).toBe(false);
    expect(mapPanel.getAttribute("aria-hidden")).toBe("false");
  });

  it("delegates selection to a custom handler when provided", () => {
    const dom = new JSDOM(
      `
        <button class="layout-tab-button is-active" data-tab-target="battle"></button>
        <button class="layout-tab-button" data-tab-target="map"></button>
        <section data-tab-panel="battle"></section>
        <section data-tab-panel="map"></section>
      `,
      { runScripts: "dangerously" }
    );
    const doc = dom.window.document;
    const buttons = doc.querySelectorAll(".layout-tab-button");
    const panels = doc.querySelectorAll("[data-tab-panel]");
    const selections = [];

    const controller = createTabController({
      buttons,
      panels,
      buttonKey: "tabTarget",
      panelKey: "tabPanel",
      onSelect: (value, meta) => selections.push({ value, meta })
    });

    controller.wire();
    buttons[1].dispatchEvent(new dom.window.Event("click", { bubbles: true }));

    expect(selections).toEqual([
      { value: "battle", meta: { source: "init" } },
      { value: "map", meta: { source: "click" } }
    ]);
    expect(buttons[0].classList.contains("is-active")).toBe(true);
    expect(panels[0].hidden).toBe(false);
  });
});
