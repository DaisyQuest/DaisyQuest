import { JSDOM } from "jsdom";
import { createCombatDockLayout } from "../public/ui/combatDockLayout.js";

describe("combat dock layout", () => {
  test("returns a noop layout when required elements are missing", () => {
    const layout = createCombatDockLayout();
    expect(layout).toEqual(
      expect.objectContaining({ destroy: expect.any(Function), sync: expect.any(Function) })
    );
    expect(() => layout.sync()).not.toThrow();
    expect(() => layout.destroy()).not.toThrow();
  });

  test("marks the dock as expanded when height and viewport thresholds are met", () => {
    const dom = new JSDOM(
      `<section id="panel" class="combat-panel">
        <section class="combat-dock" data-combat-dock>
          <div class="battle-stage battle-stage--compact" data-battle-stage></div>
        </section>
      </section>`
    );
    const { document } = dom.window;
    const dock = document.querySelector("[data-combat-dock]");
    const panel = document.getElementById("panel");
    const stage = document.querySelector("[data-battle-stage]");

    dock.getBoundingClientRect = () => ({ height: 700 });

    const listeners = {};
    const viewport = {
      innerHeight: 900,
      addEventListener: (event, handler) => {
        listeners[event] = handler;
      },
      removeEventListener: (event) => {
        delete listeners[event];
      }
    };

    const layout = createCombatDockLayout({ dock, panel, stage, viewport });

    expect(dock.classList.contains("combat-dock--expanded")).toBe(true);
    expect(dock.classList.contains("combat-dock--compact")).toBe(false);
    expect(panel.classList.contains("combat-panel--expanded")).toBe(true);
    expect(panel.classList.contains("combat-panel--compact")).toBe(false);
    expect(stage.classList.contains("battle-stage--expanded")).toBe(true);
    expect(stage.classList.contains("battle-stage--compact")).toBe(false);

    listeners.resize();

    expect(dock.classList.contains("combat-dock--expanded")).toBe(true);
    expect(panel.classList.contains("combat-panel--expanded")).toBe(true);
    expect(stage.classList.contains("battle-stage--expanded")).toBe(true);

    layout.destroy();
    expect(listeners.resize).toBeUndefined();
  });

  test("marks the dock as compact when space is limited", () => {
    const dom = new JSDOM(
      `<section id="panel" class="combat-panel">
        <section class="combat-dock" data-combat-dock></section>
      </section>`
    );
    const { document } = dom.window;
    const dock = document.querySelector("[data-combat-dock]");
    const panel = document.getElementById("panel");

    dock.getBoundingClientRect = () => ({ height: 480 });

    const viewport = {};

    const layout = createCombatDockLayout({ dock, panel, viewport });

    expect(dock.classList.contains("combat-dock--expanded")).toBe(false);
    expect(dock.classList.contains("combat-dock--compact")).toBe(true);
    expect(panel.classList.contains("combat-panel--expanded")).toBe(false);
    expect(panel.classList.contains("combat-panel--compact")).toBe(true);

    layout.sync();
    expect(() => layout.destroy()).not.toThrow();
  });
});
