import { JSDOM } from "jsdom";
import { createTabNavigationAdapter } from "../public/ui/tabNavigationAdapter.js";

describe("tab navigation adapter", () => {
  it("calls onSelect when a tab button is clicked", () => {
    const dom = new JSDOM(
      `
        <button class="layout-tab-button" data-tab-target="battle"></button>
        <button class="layout-tab-button" data-tab-target="map"></button>
      `,
      { runScripts: "dangerously" }
    );
    const doc = dom.window.document;
    const buttons = doc.querySelectorAll(".layout-tab-button");
    const calls = [];
    const onSelect = (value) => {
      calls.push(value);
    };

    const adapter = createTabNavigationAdapter({
      buttons,
      buttonKey: "tabTarget",
      onSelect
    });

    buttons[1].dispatchEvent(new dom.window.Event("click", { bubbles: true }));

    expect(calls).toEqual(["map"]);

    adapter.destroy();
  });

  it("ignores clicks when the dataset value is missing", () => {
    const dom = new JSDOM(
      `
        <button class="layout-tab-button"></button>
      `,
      { runScripts: "dangerously" }
    );
    const doc = dom.window.document;
    const buttons = doc.querySelectorAll(".layout-tab-button");
    const calls = [];
    const onSelect = (value) => {
      calls.push(value);
    };

    createTabNavigationAdapter({
      buttons,
      buttonKey: "tabTarget",
      onSelect
    });

    buttons[0].dispatchEvent(new dom.window.Event("click", { bubbles: true }));

    expect(calls).toEqual([]);
  });

  it("returns a no-op adapter when no buttons or handler are provided", () => {
    const adapter = createTabNavigationAdapter({ buttons: [] });
    const adapterWithDefaults = createTabNavigationAdapter();
    const dom = new JSDOM(
      `
        <button class="layout-tab-button" data-tab-target="battle"></button>
      `
    );
    const adapterWithNoHandler = createTabNavigationAdapter({
      buttons: dom.window.document.querySelectorAll(".layout-tab-button"),
      buttonKey: "tabTarget"
    });

    expect(adapter).toEqual(expect.objectContaining({ destroy: expect.any(Function) }));
    expect(adapterWithDefaults).toEqual(expect.objectContaining({ destroy: expect.any(Function) }));
    expect(adapterWithNoHandler).toEqual(expect.objectContaining({ destroy: expect.any(Function) }));

    expect(() => adapter.destroy()).not.toThrow();
    expect(() => adapterWithDefaults.destroy()).not.toThrow();
    expect(() => adapterWithNoHandler.destroy()).not.toThrow();
  });
});
