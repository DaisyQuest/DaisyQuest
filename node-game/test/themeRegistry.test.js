import { createThemeRegistry, FALLBACK_THEME } from "../src/systems/themeRegistry.js";

describe("theme registry", () => {
  test("falls back to default theme when no themes supplied", () => {
    const registry = createThemeRegistry();
    expect(registry.getThemes()).toHaveLength(1);
    expect(registry.defaultTheme.name).toBe(FALLBACK_THEME.name);
  });

  test("ignores themes without names and deduplicates by name", () => {
    const registry = createThemeRegistry({
      themes: [
        { label: "Missing" },
        { name: "Aurora", label: "Aurora" },
        { name: "aurora", label: "Duplicate" }
      ]
    });
    expect(registry.getThemes()).toHaveLength(1);
    expect(registry.getThemes()[0].label).toBe("Aurora");
  });

  test("resolves default theme by preferred name", () => {
    const registry = createThemeRegistry({
      themes: [
        { name: "ember", label: "Ember" },
        { name: "verdant", label: "Verdant", isDefault: true }
      ],
      defaultThemeName: "ember"
    });
    expect(registry.defaultTheme.name).toBe("ember");
  });

  test("uses marked default when preferred name missing", () => {
    const registry = createThemeRegistry({
      themes: [
        { name: "ember", label: "Ember", isDefault: true },
        { name: "verdant", label: "Verdant" }
      ],
      defaultThemeName: "missing"
    });
    expect(registry.defaultTheme.name).toBe("ember");
  });

  test("falls back to first theme when no default is marked", () => {
    const registry = createThemeRegistry({
      themes: [{ name: "ember", label: "Ember" }, { name: "verdant", label: "Verdant" }]
    });
    expect(registry.defaultTheme.name).toBe("ember");
  });

  test("getThemeByName falls back to default theme", () => {
    const registry = createThemeRegistry({
      themes: [{ name: "ember", label: "Ember", isDefault: true }]
    });
    expect(registry.getThemeByName("missing").name).toBe("ember");
    expect(registry.getThemeTokens("missing")).toEqual({});
    expect(registry.getThemeByName(null).name).toBe("ember");
  });

  test("normalizes missing tokens and labels", () => {
    const registry = createThemeRegistry({
      themes: [{ name: "ember", tokens: "bad" }]
    });
    const theme = registry.getThemeByName("ember");
    expect(theme.label).toBe("ember");
    expect(theme.tokens).toEqual({});
  });

  test("preserves token maps when provided", () => {
    const registry = createThemeRegistry({
      themes: [
        {
          name: "ember",
          label: "Ember",
          tokens: { "dq-bg": "#000" },
          isDefault: true
        }
      ]
    });
    expect(registry.getThemeTokens("ember")).toEqual({ "dq-bg": "#000" });
  });
});
