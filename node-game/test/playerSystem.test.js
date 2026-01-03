import { createProgressionSystem } from "../src/systems/progressionSystem.js";
import { createInventoryManager } from "../src/systems/inventorySystem.js";
import { createItemRegistry } from "../src/systems/itemRegistry.js";
import { createSpellRegistry } from "../src/systems/spellRegistry.js";
import { createSpellbookSystem } from "../src/systems/spellbookSystem.js";
import { createUnlockSystem } from "../src/systems/unlockSystem.js";
import { createPlayerSystem } from "../src/systems/playerSystem.js";

describe("player system", () => {
  const itemRegistry = createItemRegistry({
    items: [
      { id: "tome", equippable: false },
      { id: "ring", equippable: true, equipmentSlotTypeString: "RING" }
    ],
    recipes: [],
    lootTables: {},
    rarityColors: { COMMON: "#fff" },
    equipmentSlots: ["RING"]
  });
  const inventoryManager = createInventoryManager({ itemRegistry });
  const progressionSystem = createProgressionSystem({ baseAttributes: ["intelligence"] });
  const spellRegistry = createSpellRegistry({
    spells: [
      { id: "spark", unlockRequirements: [] },
      {
        id: "rift",
        unlockRequirements: [{ type: "consumeItem", itemId: "tome", quantity: 1 }]
      }
    ]
  });
  const spellbookSystem = createSpellbookSystem({ spellRegistry, slotCount: 2 });
  const unlockSystem = createUnlockSystem();
  const playerSystem = createPlayerSystem({
    progressionSystem,
    inventoryManager,
    spellRegistry,
    spellbookSystem,
    unlockSystem
  });

  test("createPlayerSystem validates dependencies", () => {
    expect(() => createPlayerSystem({})).toThrow("Player system requires all dependencies.");
  });

  test("createPlayerState uses defaults", () => {
    const state = playerSystem.createPlayerState();
    expect(state.progression.level).toBe(1);
    expect(state.spellbook.equippedSlots).toHaveLength(2);
  });

  test("addItem and removeItem update inventory", () => {
    const state = playerSystem.createPlayerState();
    const added = playerSystem.addItem(state, "tome", 1);
    expect(added.inventory.tome).toBe(1);
    const removed = playerSystem.removeItem(added, "tome", 1);
    expect(removed.inventory.tome).toBeUndefined();
    expect(removed.removed).toBe(true);
  });

  test("equipItem returns error when invalid", () => {
    const state = playerSystem.createPlayerState();
    const result = playerSystem.equipItem(state, "missing");
    expect(result.error).toBe("Item not found.");
  });

  test("equipItem equips valid items", () => {
    const state = playerSystem.addItem(playerSystem.createPlayerState(), "ring", 1);
    const result = playerSystem.equipItem(state, "ring");
    expect(result.equipment.RING).toBe("ring");
  });

  test("unequipItem returns inventory on success", () => {
    const base = playerSystem.addItem(playerSystem.createPlayerState(), "ring", 1);
    const equipped = playerSystem.equipItem(base, "ring");
    const result = playerSystem.unequipItem(equipped, "RING");
    expect(result.inventory.ring).toBe(1);
  });

  test("unequipItem returns error when slot is empty", () => {
    const state = playerSystem.createPlayerState();
    const result = playerSystem.unequipItem(state, "RING");
    expect(result.error).toBe("No item equipped in that slot.");
  });

  test("learnSpell fails when requirements are missing", () => {
    const state = playerSystem.createPlayerState();
    const result = playerSystem.learnSpell(state, "rift");
    expect(result.error).toContain("Requires");
  });

  test("learnSpell fails when spell is missing", () => {
    const state = playerSystem.createPlayerState();
    const result = playerSystem.learnSpell(state, "missing");
    expect(result.error).toBe("Spell not found.");
  });

  test("learnSpell fails when already known", () => {
    const state = playerSystem.createPlayerState({ knownSpells: ["spark"] });
    const result = playerSystem.learnSpell(state, "spark");
    expect(result.error).toBe("Spell already known.");
  });

  test("learnSpell consumes items and records consumed items", () => {
    const state = playerSystem.addItem(playerSystem.createPlayerState(), "tome", 1);
    const learned = playerSystem.learnSpell(state, "rift");
    expect(learned.inventory.tome).toBeUndefined();
    expect(learned.consumedItems).toContain("tome");
    expect(learned.knownSpells).toContain("rift");
  });

  test("learnSpell does not duplicate consumed items", () => {
    const base = playerSystem.createPlayerState({
      consumedItems: ["tome"]
    });
    const state = playerSystem.addItem(base, "tome", 1);
    const learned = playerSystem.learnSpell(state, "rift");
    expect(learned.consumedItems).toEqual(["tome"]);
  });

  test("equipSpell and unequipSpell update spellbook", () => {
    const base = playerSystem.createPlayerState({ knownSpells: ["spark"] });
    const equipped = playerSystem.equipSpell(base, "spark", 0);
    expect(equipped.spellbook.equippedSlots[0]).toBe("spark");
    const unequipped = playerSystem.unequipSpell(equipped, 0);
    expect(unequipped.spellbook.equippedSlots[0]).toBeNull();
  });

  test("equipSpell handles default slot and errors", () => {
    const base = playerSystem.createPlayerState({ knownSpells: ["spark"] });
    const equipped = playerSystem.equipSpell(base, "spark");
    expect(equipped.spellbook.equippedSlots[0]).toBe("spark");
    const errorResult = playerSystem.equipSpell(base, "missing", 0);
    expect(errorResult.error).toBe("Spell not found.");
  });

  test("unequipSpell returns errors for invalid slots", () => {
    const base = playerSystem.createPlayerState({ knownSpells: ["spark"] });
    const result = playerSystem.unequipSpell(base, 1);
    expect(result.error).toBe("No spell equipped in that slot.");
  });

  test("allocateStatPoint uses default amount", () => {
    const base = playerSystem.createPlayerState({
      progression: progressionSystem.createPlayerProgression({
        statPoints: 1,
        attributes: { intelligence: 10 }
      })
    });
    const updated = playerSystem.allocateStatPoint(base, "intelligence");
    expect(updated.progression.attributes.intelligence).toBe(11);
  });

  test("applyExperience updates progression state", () => {
    const base = playerSystem.createPlayerState();
    const updated = playerSystem.applyExperience(base, 200);
    expect(updated.progression.experience).toBeGreaterThan(0);
  });
});
