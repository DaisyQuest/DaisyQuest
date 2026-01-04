import { createRequire } from "module";

const require = createRequire(import.meta.url);
const {
  buildMinimapLegendItems,
  getMinimapEntityStyle,
  toggleMinimapVisibility
} = require("../../src/main/resources/static/js/minimap.js");

const createClassList = () => {
  const classes = new Set();
  return {
    toggle(name, force) {
      const shouldAdd = force !== undefined ? force : !classes.has(name);
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
};

describe("minimap UI module", () => {
  test("maps entity types to symbols and colors", () => {
    expect(getMinimapEntityStyle("SELF")).toEqual({ symbol: "◆", color: "#fbbf24", label: "You" });
    expect(getMinimapEntityStyle("PLAYER")).toEqual({ symbol: "●", color: "#38bdf8", label: "Player" });
    expect(getMinimapEntityStyle("NPC")).toEqual({ symbol: "▲", color: "#f97316", label: "NPC" });
    expect(getMinimapEntityStyle("WORLD_OBJECT")).toEqual({ symbol: "■", color: "#a78bfa", label: "Object" });
    expect(getMinimapEntityStyle("UNKNOWN")).toEqual({ symbol: "?", color: "#e2e8f0", label: "Unknown" });
  });

  test("builds legend rows for all entity styles", () => {
    const legendItems = buildMinimapLegendItems();
    const types = legendItems.map(item => item.type);
    expect(types).toEqual(expect.arrayContaining(["SELF", "PLAYER", "NPC", "WORLD_OBJECT"]));
    legendItems.forEach(item => {
      expect(item.symbol).toBeTruthy();
      expect(item.color).toBeTruthy();
      expect(item.label).toBeTruthy();
    });
  });

  test("toggleMinimapVisibility updates state and element UI", () => {
    const state = { isVisible: true };
    const container = { classList: createClassList() };
    const toggleButton = {
      attributes: {},
      textContent: "",
      setAttribute(key, value) {
        this.attributes[key] = value;
      }
    };

    toggleMinimapVisibility(state, { container, toggleButton });
    expect(state.isVisible).toBe(false);
    expect(container.classList.contains("minimap-hidden")).toBe(true);
    expect(toggleButton.attributes["aria-pressed"]).toBe("false");
    expect(toggleButton.textContent).toBe("Show");

    toggleMinimapVisibility(state, { container, toggleButton });
    expect(state.isVisible).toBe(true);
    expect(container.classList.contains("minimap-hidden")).toBe(false);
    expect(toggleButton.attributes["aria-pressed"]).toBe("true");
    expect(toggleButton.textContent).toBe("Hide");
  });
});
