import { jest } from "@jest/globals";
import { createCraftingSystem } from "../src/systems/craftingSystem.js";
import { createInventoryManager } from "../src/systems/inventorySystem.js";
import { createItemRegistry } from "../src/systems/itemRegistry.js";
import { createLootSystem } from "../src/systems/lootSystem.js";

const baseItems = [
  {
    id: "ring",
    name: "Ring",
    equippable: true,
    equipmentSlotTypeString: "FINGER"
  },
  {
    id: "gem",
    name: "Gem",
    equippable: false
  }
];

const baseRecipes = [
  {
    id: "craft_ring",
    resultItemId: "ring",
    ingredients: { gem: 2 }
  }
];

const baseLootTables = {
  default: [{ itemId: "gem", min: 1, max: 1, chance: 1 }]
};

const baseRarityColors = {
  COMMON: "#fff"
};

describe("item registry system", () => {
  test("item registry lookup returns expected items and recipes", () => {
    const registry = createItemRegistry({
      items: baseItems,
      recipes: baseRecipes,
      lootTables: baseLootTables,
      rarityColors: baseRarityColors,
      equipmentSlots: ["FINGER"]
    });
    expect(registry.getItem("ring").name).toBe("Ring");
    expect(registry.getRecipe("craft_ring").resultItemId).toBe("ring");
  });

  test("item registry fallback behavior handles missing data", () => {
    const registry = createItemRegistry({
      items: [],
      recipes: [],
      lootTables: {},
      rarityColors: {},
      equipmentSlots: []
    });
    expect(registry.getLootTable("unknown")).toEqual([]);
    expect(registry.getRarityColor("UNKNOWN")).toBe("#FFFFFF");
    expect(registry.isSupportedSlot("FINGER")).toBe(false);
    expect(registry.listEquipmentSlots()).toEqual([]);
  });

  test("item registry returns a new equipment slot list", () => {
    const registry = createItemRegistry({
      items: baseItems,
      recipes: baseRecipes,
      lootTables: baseLootTables,
      rarityColors: baseRarityColors,
      equipmentSlots: ["FINGER"]
    });
    const slots = registry.listEquipmentSlots();
    slots.push("EXTRA");
    expect(registry.listEquipmentSlots()).toEqual(["FINGER"]);
  });
});

describe("inventory system", () => {
  const registry = createItemRegistry({
    items: baseItems,
    recipes: baseRecipes,
    lootTables: baseLootTables,
    rarityColors: baseRarityColors,
    equipmentSlots: ["FINGER"]
  });
  const inventoryManager = createInventoryManager({ itemRegistry: registry });

  test("inventory manager add/remove handles invalid quantities", () => {
    const inventory = inventoryManager.addItem({ gem: 1 }, "gem", 0);
    expect(inventory.gem).toBe(1);
    const result = inventoryManager.removeItem({ gem: 1 }, "gem", 2);
    expect(result.removed).toBe(false);
  });

  test("inventory manager equip rejects unsupported slots", () => {
    const registryWithMissingSlot = createItemRegistry({
      items: baseItems,
      recipes: baseRecipes,
      lootTables: baseLootTables,
      rarityColors: baseRarityColors,
      equipmentSlots: []
    });
    const manager = createInventoryManager({ itemRegistry: registryWithMissingSlot });
    const result = manager.equipItem({ ring: 1 }, {}, "ring");
    expect(result.error).toBe("Item cannot be equipped.");
  });

  test("inventory manager equip rejects non-equippable items", () => {
    const result = inventoryManager.equipItem({ gem: 1 }, {}, "gem");
    expect(result.error).toBe("Item cannot be equipped.");
  });

  test("inventory manager equip/unequip flow swaps items", () => {
    const equipped = inventoryManager.equipItem({ ring: 1 }, {}, "ring");
    expect(equipped.equipment.FINGER).toBe("ring");
    const unequipped = inventoryManager.unequipItem(
      equipped.inventory,
      equipped.equipment,
      "FINGER"
    );
    expect(unequipped.inventory.ring).toBe(1);
  });
});

describe("loot system", () => {
  test("loot system uses default rng when omitted", () => {
    const registry = createItemRegistry({
      items: baseItems,
      recipes: baseRecipes,
      lootTables: baseLootTables,
      rarityColors: baseRarityColors,
      equipmentSlots: ["FINGER"]
    });
    const lootSystem = createLootSystem({ itemRegistry: registry });
    const spy = jest.spyOn(Math, "random").mockReturnValue(0);
    const loot = lootSystem.rollLoot("default");
    spy.mockRestore();
    expect(loot).toEqual([{ itemId: "gem", quantity: 1 }]);
  });
});

describe("crafting system", () => {
  test("crafting system validates missing recipes", () => {
    const registry = createItemRegistry({
      items: baseItems,
      recipes: [],
      lootTables: baseLootTables,
      rarityColors: baseRarityColors,
      equipmentSlots: ["FINGER"]
    });
    const inventoryManager = createInventoryManager({ itemRegistry: registry });
    const craftingSystem = createCraftingSystem({ itemRegistry: registry, inventoryManager });
    const result = craftingSystem.craftItem({}, "missing");
    expect(result.error).toBe("Recipe not found.");
  });

  test("crafting system consumes ingredients", () => {
    const registry = createItemRegistry({
      items: baseItems,
      recipes: baseRecipes,
      lootTables: baseLootTables,
      rarityColors: baseRarityColors,
      equipmentSlots: ["FINGER"]
    });
    const inventoryManager = createInventoryManager({ itemRegistry: registry });
    const craftingSystem = createCraftingSystem({ itemRegistry: registry, inventoryManager });
    const result = craftingSystem.craftItem({ gem: 2 }, "craft_ring");
    expect(result.inventory.gem).toBeUndefined();
    expect(result.inventory.ring).toBe(1);
  });
});
