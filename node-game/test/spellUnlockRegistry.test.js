import { createSpellUnlockRegistry } from "../src/systems/spellUnlockRegistry.js";

describe("spell unlock registry", () => {
  test("normalizes unlock list and defaults", () => {
    const registry = createSpellUnlockRegistry({
      spells: [
        { id: "Spark", unlockRequirements: [{ type: "attributeLevel" }], isDefault: true },
        { id: "spark", unlockRequirements: [{ type: "inventoryItem" }] },
        { id: "rift", unlockRequirements: null }
      ]
    });

    const unlocks = registry.listUnlocks();
    expect(unlocks).toHaveLength(2);
    expect(unlocks[0].unlockRequirements.length).toBeGreaterThan(0);
    expect(registry.listDefaultSpellIds()).toEqual(["Spark"]);
  });

  test("getUnlock handles invalid ids", () => {
    const registry = createSpellUnlockRegistry({ spells: [{ id: "nova" }] });
    expect(registry.getUnlock("nova").spellId).toBe("nova");
    expect(registry.getUnlock("")).toBeNull();
    expect(registry.getUnlock(null)).toBeNull();
  });

  test("handles non-array spell inputs", () => {
    const registry = createSpellUnlockRegistry({ spells: null });
    expect(registry.listUnlocks()).toEqual([]);
    expect(registry.getUnlock("spark")).toBeNull();
    expect(registry.listDefaultSpellIds()).toEqual([]);
  });
});
