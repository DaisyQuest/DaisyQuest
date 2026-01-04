import { jest } from "@jest/globals";
import {
  buildLegendItems,
  createMinimapPanel,
  getMinimapStyle,
  mapEntriesForRender,
  projectPoint,
  renderMinimap,
  toggleMinimapVisibility
} from "../public/ui/minimapPanel.js";

function createClassList() {
  const classes = new Set();
  return {
    toggle(name, force) {
      const shouldAdd = force ?? !classes.has(name);
      if (shouldAdd) {
        classes.add(name);
      } else {
        classes.delete(name);
      }
    },
    contains(name) {
      return classes.has(name);
    }
  };
}

function createMockElement() {
  return {
    classList: createClassList(),
    style: {},
    textContent: "",
    innerHTML: "",
    setAttribute: jest.fn(),
    appendChild: jest.fn(),
    append: jest.fn(),
    addEventListener: jest.fn()
  };
}

function createMockCanvas() {
  const context = {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn()
  };
  return {
    width: 180,
    height: 180,
    getContext: jest.fn(() => context)
  };
}

describe("minimap panel UI helpers", () => {
  test("style mapping returns defaults for unknown types", () => {
    expect(getMinimapStyle("SELF").symbol).toBe("◆");
    expect(getMinimapStyle("PLAYER").symbol).toBe("●");
    expect(getMinimapStyle("NPC").symbol).toBe("▲");
    expect(getMinimapStyle("WORLD_OBJECT").symbol).toBe("■");
    expect(getMinimapStyle("UNKNOWN").symbol).toBe("?");
  });

  test("buildLegendItems covers all types", () => {
    const items = buildLegendItems();
    const types = items.map((item) => item.type);
    expect(types).toEqual(expect.arrayContaining(["SELF", "PLAYER", "NPC", "WORLD_OBJECT"]));
    items.forEach((item) => {
      expect(item.symbol).toBeTruthy();
      expect(item.color).toBeTruthy();
      expect(item.label).toBeTruthy();
    });
  });

  test("projectPoint returns center for zero radius", () => {
    const point = projectPoint({
      centerX: 10,
      centerY: 10,
      radius: 0,
      entry: { x: 15, y: 15 },
      canvasWidth: 200,
      canvasHeight: 100
    });
    expect(point).toEqual({ x: 100, y: 50 });
  });

  test("mapEntriesForRender resolves symbols and coordinates", () => {
    const entries = mapEntriesForRender({
      data: {
        center: { x: 0, y: 0 },
        radius: 10,
        entries: [{ type: "PLAYER", x: 10, y: 0, label: "Scout" }]
      },
      canvasWidth: 200,
      canvasHeight: 200
    });
    expect(entries).toEqual([
      expect.objectContaining({ symbol: "●", color: "#60a5fa", label: "Scout" })
    ]);
    expect(entries[0].x).toBe(200);
    expect(entries[0].y).toBe(100);
  });

  test("mapEntriesForRender returns empty when entries are missing", () => {
    const entries = mapEntriesForRender({
      data: { center: { x: 0, y: 0 }, radius: 3 },
      canvasWidth: 100,
      canvasHeight: 100
    });
    expect(entries).toEqual([]);
  });

  test("renderMinimap draws symbols to canvas", () => {
    const canvas = createMockCanvas();
    renderMinimap({
      canvas,
      data: {
        center: { x: 0, y: 0 },
        radius: 10,
        entries: [{ type: "NPC", x: 0, y: 0, label: "Guardian" }]
      }
    });
    expect(canvas.getContext).toHaveBeenCalledWith("2d");
    expect(canvas.getContext().fillText).toHaveBeenCalledWith("▲", 90, 90);
  });

  test("renderMinimap returns early when no drawing context is available", () => {
    const canvas = {
      width: 100,
      height: 100,
      getContext: jest.fn(() => null)
    };
    renderMinimap({
      canvas,
      data: {
        center: { x: 0, y: 0 },
        radius: 1,
        entries: []
      }
    });
    expect(canvas.getContext).toHaveBeenCalledWith("2d");
  });

  test("toggleMinimapVisibility updates state and button", () => {
    const state = { isVisible: true };
    const container = createMockElement();
    const toggleButton = createMockElement();

    toggleMinimapVisibility(state, { container, toggleButton });
    expect(state.isVisible).toBe(false);
    expect(container.classList.contains("minimap-panel--hidden")).toBe(true);
    expect(toggleButton.setAttribute).toHaveBeenCalledWith("aria-pressed", "false");
    expect(toggleButton.textContent).toBe("Show");

    toggleMinimapVisibility(state, { container, toggleButton });
    expect(state.isVisible).toBe(true);
    expect(container.classList.contains("minimap-panel--hidden")).toBe(false);
    expect(toggleButton.setAttribute).toHaveBeenCalledWith("aria-pressed", "true");
    expect(toggleButton.textContent).toBe("Hide");
  });
});

describe("createMinimapPanel", () => {
  test("returns no-op handlers when elements are missing", () => {
    const panel = createMinimapPanel({});
    expect(panel.state.isVisible).toBe(true);
    expect(() => panel.start()).not.toThrow();
    expect(() => panel.stop()).not.toThrow();
    expect(() => panel.refresh()).not.toThrow();
  });

  test("starts, refreshes, and stops with provided elements", async () => {
    const originalDocument = global.document;
    global.document = {
      createElement: () => createMockElement()
    };

    const container = createMockElement();
    const canvas = createMockCanvas();
    const toggleButton = createMockElement();
    const legendContainer = createMockElement();
    const fetchMinimap = jest.fn().mockResolvedValue({
      center: { x: 0, y: 0 },
      radius: 1,
      entries: [{ type: "SELF", x: 0, y: 0, label: "Hero" }]
    });
    const setIntervalFn = jest.fn(() => 123);
    const clearIntervalFn = jest.fn();

    const panel = createMinimapPanel({
      container,
      canvas,
      toggleButton,
      legendContainer,
      fetchMinimap,
      setIntervalFn,
      clearIntervalFn,
      intervalMs: 1000
    });

    await panel.start();
    expect(toggleButton.addEventListener).toHaveBeenCalledTimes(1);
    expect(setIntervalFn).toHaveBeenCalledTimes(1);
    await panel.start();
    expect(setIntervalFn).toHaveBeenCalledTimes(1);
    expect(fetchMinimap).toHaveBeenCalled();

    panel.stop();
    expect(clearIntervalFn).toHaveBeenCalledWith(123);
    panel.stop();
    expect(clearIntervalFn).toHaveBeenCalledTimes(1);

    global.document = originalDocument;
  });

  test("refresh ignores failures and hidden state", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const panel = createMinimapPanel({
      container: createMockElement(),
      canvas: createMockCanvas(),
      toggleButton: createMockElement(),
      legendContainer: createMockElement(),
      fetchMinimap: jest.fn().mockRejectedValue(new Error("offline"))
    });

    await panel.refresh();
    expect(warnSpy).toHaveBeenCalledWith("Failed to refresh minimap.", expect.any(Error));

    panel.state.isVisible = false;
    await panel.refresh();
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });
});
