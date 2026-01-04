import {
  createUnlockablesRegistry,
  normalizeTexturePath,
  normalizeUnlockableCategory,
  normalizeUnlockableEntry
} from "../src/systems/unlockables.js";

describe("unlockables registry", () => {
  test("normalizes categories with aliases", () => {
    expect(normalizeUnlockableCategory("trail")).toBe("trail");
    expect(normalizeUnlockableCategory("Trails")).toBe("trail");
    expect(normalizeUnlockableCategory("ICON")).toBe("icon");
    expect(normalizeUnlockableCategory("pipe-textures")).toBe("pipe");
    expect(normalizeUnlockableCategory("")).toBeNull();
    expect(normalizeUnlockableCategory(null)).toBeNull();
  });

  test("normalizes texture paths without stripping /icon prefixes", () => {
    const normalized = normalizeTexturePath("  /icon\\\\trails//spark  ");
    expect(normalized).toBe("/icon/trails/spark");
    expect(normalizeTexturePath("   ")).toBeNull();
    expect(normalizeTexturePath(null)).toBeNull();
  });

  test("normalizes unlockable entries from mixed key names", () => {
    const entry = normalizeUnlockableEntry(
      { texture: "/icon/trails/ember", unlockRequirements: [{ type: "anyOf" }] },
      "trail"
    );
    expect(entry).toEqual({
      id: "/icon/trails/ember",
      category: "trail",
      texturePath: "/icon/trails/ember",
      unlockRequirements: [{ type: "anyOf" }],
      isDefault: false
    });
  });

  test("skips invalid unlockable entries", () => {
    expect(normalizeUnlockableEntry(null, "trail")).toBeNull();
    expect(normalizeUnlockableEntry({ id: "missing" }, "trail")).toBeNull();
    expect(normalizeUnlockableEntry({ texturePath: "/icon/trails/ember" }, "unknown")).toBeNull();
    expect(
      normalizeUnlockableEntry(
        { id: "   ", texturePath: "/trails/blank", category: "trail" },
        null
      )
    ).toBeNull();
  });

  test("defaults unlock requirements when omitted", () => {
    const entry = normalizeUnlockableEntry(
      { id: "pipe_simple", texturePath: "/pipes/simple", category: "pipe" },
      null
    );
    expect(entry.unlockRequirements).toEqual([]);
  });

  test("normalizes unlockables when category is provided on the entry", () => {
    const entry = normalizeUnlockableEntry(
      { id: "trail_note", texturePath: "/trails/note", category: "trail", unlockRequirements: "none" },
      null
    );
    expect(entry.category).toBe("trail");
    expect(entry.unlockRequirements).toEqual([]);
  });

  test("indexes unlockables by id and texture path", () => {
    const registry = createUnlockablesRegistry({
      trails: [{ texturePath: "/icon/trails/ember", isDefault: true }, null],
      icons: [{ id: "crest", texturePath: "/icons/crest" }],
      pipeTextures: [{ id: "pipe_basic", path: "/pipes/basic" }],
      unlockables: [{ id: "pipe_bonus", category: "pipe", texturePath: "/pipes/bonus" }]
    });

    expect(registry.getUnlockable("crest")).toMatchObject({ category: "icon" });
    expect(registry.getUnlockable(null)).toBeNull();
    expect(registry.getUnlockable("/ICON/TRAILS/EMBER")).toMatchObject({
      id: "/icon/trails/ember"
    });
    expect(registry.getUnlockableByTexturePath("/pipes/basic", "pipe")).toMatchObject({
      id: "pipe_basic"
    });
    expect(registry.isUnlockableTexture("/pipes/bonus")).toBe(true);
    expect(registry.listUnlockables()).toHaveLength(4);
    expect(registry.getUnlockableByTexturePath(null, "pipe")).toBeNull();
  });

  test("lists unlockables by category", () => {
    const registry = createUnlockablesRegistry({
      trails: [{ id: "trail_a", texturePath: "/trails/a" }],
      icons: [{ id: "icon_a", texturePath: "/icons/a" }]
    });

    expect(registry.listByCategory("trail")).toHaveLength(1);
    expect(registry.listByCategory("icon")).toHaveLength(1);
    expect(registry.listByCategory("pipe")).toHaveLength(0);
    expect(registry.listByCategory("unknown")).toEqual([]);
  });

  test("handles non-array category lists", () => {
    const registry = createUnlockablesRegistry({
      icons: null
    });

    expect(registry.listByCategory("icon")).toEqual([]);
  });

  test("handles empty registry lookups", () => {
    const registry = createUnlockablesRegistry();

    expect(registry.listUnlockables()).toEqual([]);
    expect(registry.getUnlockable("missing")).toBeNull();
    expect(registry.getUnlockableByTexturePath("/unknown")).toBeNull();
    expect(registry.canUseTexture()).toBe(false);
  });

  test("deduplicates ids and texture paths", () => {
    const registry = createUnlockablesRegistry({
      trails: [
        { id: "trail_a", texturePath: "/trails/a" },
        { id: "TRAIL_A", texturePath: "/trails/dupe" }
      ],
      icons: [
        { id: "icon_a", texturePath: "/icons/a" },
        { id: "icon_b", texturePath: "/icons/a" }
      ],
      pipeTextures: [
        { id: "shared", texturePath: "/pipes/shared" }
      ],
      unlockables: [
        { id: "shared", category: "trail", texturePath: "/trails/shared" }
      ]
    });

    expect(registry.listByCategory("trail")).toHaveLength(2);
    expect(registry.getUnlockableByTexturePath("/icons/a", "icon").id).toBe("icon_a");
    expect(registry.getUnlockable("shared").texturePath).toBe("/pipes/shared");
  });

  test("canUseTexture respects default unlockables", () => {
    const registry = createUnlockablesRegistry({
      trails: [{ id: "trail_default", texturePath: "/trails/default", isDefault: true }]
    });

    expect(registry.canUseTexture({ texturePath: "/trails/default", category: "trail" })).toBe(true);
  });

  test("canUseTexture requires unlock for non-defaults", () => {
    const registry = createUnlockablesRegistry({
      icons: [{ id: "icon_locked", texturePath: "/icons/locked" }]
    });

    expect(registry.canUseTexture({ texturePath: "/icons/locked", category: "icon" })).toBe(false);
    expect(
      registry.canUseTexture({
        texturePath: "/icons/locked",
        category: "icon",
        unlockedIds: ["ICON_LOCKED"]
      })
    ).toBe(true);
    expect(registry.isUnlocked(null, ["ICON_LOCKED"])).toBe(false);
    expect(registry.isUnlocked("icon_locked", new Set(["ICON_LOCKED"]))).toBe(true);
  });

  test("canUseTexture fails for unknown textures", () => {
    const registry = createUnlockablesRegistry({
      pipeTextures: [{ id: "pipe_a", texturePath: "/pipes/a" }]
    });

    expect(registry.canUseTexture({ texturePath: "/pipes/unknown", category: "pipe" })).toBe(false);
    expect(
      registry.canUseTexture({
        texturePath: "/pipes/a",
        category: "pipe",
        unlockedIds: { id: "pipe_a" }
      })
    ).toBe(false);
  });
});
