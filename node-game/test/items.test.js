import { jest } from "@jest/globals";
import {
  addToInventory,
  canCraft,
  craftItem,
  equipItem,
  getItemById,
  getLootTable,
  getRarityColor,
  getRecipeById,
  ITEMS,
  NPC_LOOT_TABLES,
  RECIPES,
  removeFromInventory,
  rollLoot,
  rollLootFromTable,
  unequipItem
} from "../src/items.js";

const fixedRng = (values) => {
  let index = 0;
  return () => values[index++ % values.length];
};

describe("item data helpers", () => {
  test("getItemById returns item matches", () => {
    expect(getItemById(ITEMS[0].id).name).toBe(ITEMS[0].name);
  });

  test("getItemById returns undefined for unknown item", () => {
    expect(getItemById("missing-item")).toBeUndefined();
  });

  test("getRecipeById returns recipe matches", () => {
    expect(getRecipeById(RECIPES[0].id).name).toBe(RECIPES[0].name);
  });

  test("getRecipeById returns undefined for unknown recipe", () => {
    expect(getRecipeById("missing-recipe")).toBeUndefined();
  });

  test("getRarityColor falls back to common", () => {
    expect(getRarityColor("RARE")).not.toBe(getRarityColor("missing"));
    expect(getRarityColor("missing")).toBe(getRarityColor("COMMON"));
  });

  test("getLootTable returns NPC-specific table", () => {
    expect(getLootTable("ember_wyrmling")).toBe(NPC_LOOT_TABLES.ember_wyrmling);
  });

  test("getLootTable falls back to default table", () => {
    expect(getLootTable("missing")).toBe(NPC_LOOT_TABLES.default);
  });
});

describe("loot rolling", () => {
  test("rollLoot returns drops when rng passes", () => {
    const rng = fixedRng([0.1, 0, 0.1]);
    const loot = rollLoot("ember_wyrmling", rng);
    expect(loot).toEqual([
      { itemId: "ember_scale", quantity: 1 },
      { itemId: "wyrmling_helm", quantity: 1 }
    ]);
  });

  test("rollLoot returns empty when rng fails", () => {
    const rng = fixedRng([0.95, 0.95]);
    const loot = rollLoot("ember_wyrmling", rng);
    expect(loot).toEqual([]);
  });

  test("rollLoot uses Math.random when rng is omitted", () => {
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.2);
    const loot = rollLoot("ember_wyrmling");
    spy.mockRestore();
    expect(loot.length).toBeGreaterThan(0);
  });

  test("rollLootFromTable drops nothing when quantity is zero", () => {
    const table = [{ itemId: "ember_scale", min: 0, max: 0, chance: 1 }];
    const loot = rollLootFromTable(table, fixedRng([0.1]));
    expect(loot).toEqual([]);
  });

  test("rollLootFromTable uses Math.random when rng is omitted", () => {
    const table = [{ itemId: "ember_scale", min: 1, max: 1, chance: 1 }];
    const spy = jest.spyOn(Math, "random").mockReturnValue(0.1);
    const loot = rollLootFromTable(table);
    spy.mockRestore();
    expect(loot).toEqual([{ itemId: "ember_scale", quantity: 1 }]);
  });
});

describe("inventory helpers", () => {
  test("addToInventory increases quantity", () => {
    const inventory = addToInventory({}, "ember_scale", 2);
    expect(inventory.ember_scale).toBe(2);
  });

  test("addToInventory ignores non-positive amounts", () => {
    const inventory = addToInventory({ ember_scale: 1 }, "ember_scale", 0);
    expect(inventory).toEqual({ ember_scale: 1 });
  });

  test("removeFromInventory rejects insufficient quantity", () => {
    const result = removeFromInventory({ ember_scale: 1 }, "ember_scale", 2);
    expect(result.removed).toBe(false);
    expect(result.inventory.ember_scale).toBe(1);
  });

  test("removeFromInventory rejects non-positive quantity", () => {
    const result = removeFromInventory({ ember_scale: 1 }, "ember_scale", 0);
    expect(result.removed).toBe(false);
  });

  test("removeFromInventory removes item when quantity reaches zero", () => {
    const result = removeFromInventory({ ember_scale: 1 }, "ember_scale", 1);
    expect(result.removed).toBe(true);
    expect(result.inventory.ember_scale).toBeUndefined();
  });

  test("removeFromInventory keeps item when quantity remains", () => {
    const result = removeFromInventory({ ember_scale: 3 }, "ember_scale", 1);
    expect(result.removed).toBe(true);
    expect(result.inventory.ember_scale).toBe(2);
  });

  test("removeFromInventory handles missing items", () => {
    const result = removeFromInventory({}, "ember_scale", 1);
    expect(result.removed).toBe(false);
    expect(result.inventory.ember_scale).toBeUndefined();
  });
});

describe("equipment helpers", () => {
  test("equipItem rejects unknown items", () => {
    const result = equipItem({}, {}, "missing-item");
    expect(result.error).toBe("Item not found.");
  });

  test("equipItem rejects non-equippable items", () => {
    const result = equipItem({ ember_scale: 1 }, {}, "ember_scale");
    expect(result.error).toBe("Item cannot be equipped.");
  });

  test("equipItem rejects items not in inventory", () => {
    const result = equipItem({}, {}, "wyrmling_helm");
    expect(result.error).toBe("Item is not in inventory.");
  });

  test("equipItem equips and removes from inventory", () => {
    const result = equipItem({ wyrmling_helm: 1 }, {}, "wyrmling_helm");
    expect(result.error).toBeUndefined();
    expect(result.inventory.wyrmling_helm).toBeUndefined();
    expect(result.equipment.HEAD).toBe("wyrmling_helm");
  });

  test("equipItem swaps existing equipment back into inventory", () => {
    const result = equipItem(
      { guardian_plate: 1 },
      { CHEST: "wyrmling_helm" },
      "guardian_plate"
    );
    expect(result.inventory.wyrmling_helm).toBe(1);
    expect(result.equipment.CHEST).toBe("guardian_plate");
  });

  test("unequipItem rejects empty slots", () => {
    const result = unequipItem({}, {}, "HEAD");
    expect(result.error).toBe("No item equipped in that slot.");
  });

  test("unequipItem moves item to inventory", () => {
    const result = unequipItem({}, { HEAD: "wyrmling_helm" }, "HEAD");
    expect(result.inventory.wyrmling_helm).toBe(1);
    expect(result.equipment.HEAD).toBeUndefined();
  });
});

describe("crafting helpers", () => {
  test("canCraft returns false when recipe is missing", () => {
    expect(canCraft({}, null)).toBe(false);
  });

  test("canCraft validates ingredient quantities", () => {
    const recipe = RECIPES[0];
    expect(canCraft({ ember_scale: 3, moonsteel_ingot: 1 }, recipe)).toBe(true);
    expect(canCraft({ ember_scale: 2, moonsteel_ingot: 1 }, recipe)).toBe(false);
  });

  test("canCraft handles missing ingredient entries", () => {
    const recipe = RECIPES[0];
    expect(canCraft({ ember_scale: 3 }, recipe)).toBe(false);
  });

  test("craftItem fails for missing recipe", () => {
    const result = craftItem({}, "missing-recipe");
    expect(result.error).toBe("Recipe not found.");
  });

  test("craftItem fails with missing ingredients", () => {
    const result = craftItem({ ember_scale: 1 }, RECIPES[0].id);
    expect(result.error).toBe("Missing ingredients.");
  });

  test("craftItem consumes ingredients and adds result", () => {
    const inventory = { ember_scale: 3, moonsteel_ingot: 1 };
    const result = craftItem(inventory, RECIPES[0].id);
    expect(result.inventory.ember_scale).toBeUndefined();
    expect(result.inventory.moonsteel_ingot).toBeUndefined();
    expect(result.inventory.wyrmling_helm).toBe(1);
  });
});
