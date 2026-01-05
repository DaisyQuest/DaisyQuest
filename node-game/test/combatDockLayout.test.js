import { JSDOM } from "jsdom";
import { jest } from "@jest/globals";
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

  test("marks the dock as expanded when size thresholds are met", () => {
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

    dock.getBoundingClientRect = () => ({ height: 700, width: 960 });

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
    const observer = { observe: jest.fn(), disconnect: jest.fn() };

    const layout = createCombatDockLayout({
      dock,
      panel,
      stage,
      viewport,
      createObserver: () => observer
    });

    expect(dock.classList.contains("combat-dock--expanded")).toBe(true);
    expect(dock.classList.contains("combat-dock--compact")).toBe(false);
    expect(panel.classList.contains("combat-panel--expanded")).toBe(true);
    expect(panel.classList.contains("combat-panel--compact")).toBe(false);
    expect(panel.dataset.combatMode).toBe("expanded");
    expect(stage.classList.contains("battle-stage--expanded")).toBe(true);
    expect(stage.classList.contains("battle-stage--compact")).toBe(false);
    expect(observer.observe).toHaveBeenCalledWith(dock);

    listeners.resize();

    expect(dock.classList.contains("combat-dock--expanded")).toBe(true);
    expect(panel.classList.contains("combat-panel--expanded")).toBe(true);
    expect(stage.classList.contains("battle-stage--expanded")).toBe(true);

    layout.destroy();
    expect(listeners.resize).toBeUndefined();
    expect(observer.disconnect).toHaveBeenCalled();
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

    dock.getBoundingClientRect = () => ({ height: 360, width: 600 });

    const viewport = {};

    const layout = createCombatDockLayout({ dock, panel, viewport });

    expect(dock.classList.contains("combat-dock--expanded")).toBe(false);
    expect(dock.classList.contains("combat-dock--compact")).toBe(true);
    expect(panel.classList.contains("combat-panel--expanded")).toBe(false);
    expect(panel.classList.contains("combat-panel--compact")).toBe(true);
    expect(panel.dataset.combatMode).toBe("compact");

    layout.sync();
    expect(() => layout.destroy()).not.toThrow();
  });

  test("uses the viewport ResizeObserver when available", () => {
    const dom = new JSDOM(
      `<section id="panel" class="combat-panel">
        <section class="combat-dock" data-combat-dock></section>
      </section>`
    );
    const { document } = dom.window;
    const dock = document.querySelector("[data-combat-dock]");
    const panel = document.getElementById("panel");
    dock.getBoundingClientRect = () => ({ height: 500, width: 900 });

    let observed = null;
    class TestObserver {
      constructor() {
        this.observe = jest.fn((target) => {
          observed = target;
        });
        this.disconnect = jest.fn();
      }
    }

    const viewport = { innerHeight: 800, ResizeObserver: TestObserver };
    const layout = createCombatDockLayout({ dock, panel, viewport });

    expect(observed).toBe(dock);
    layout.destroy();
  });

  test("falls back to the global ResizeObserver when the viewport lacks one", () => {
    const dom = new JSDOM(
      `<section id="panel" class="combat-panel">
        <section class="combat-dock" data-combat-dock></section>
      </section>`
    );
    const { document } = dom.window;
    const dock = document.querySelector("[data-combat-dock]");
    const panel = document.getElementById("panel");
    dock.getBoundingClientRect = () => ({ height: 500, width: 900 });

    let observed = null;
    class TestObserver {
      constructor() {
        this.observe = jest.fn((target) => {
          observed = target;
        });
        this.disconnect = jest.fn();
      }
    }

    const originalObserver = globalThis.ResizeObserver;
    globalThis.ResizeObserver = TestObserver;

    const viewport = { innerHeight: 800 };
    const layout = createCombatDockLayout({ dock, panel, viewport });

    expect(observed).toBe(dock);

    layout.destroy();
    globalThis.ResizeObserver = originalObserver;
  });
});
