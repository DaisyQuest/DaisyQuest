import { createCraftingSystem } from "./systems/craftingSystem.js";
import { createInventoryManager } from "./systems/inventorySystem.js";
import { createItemRegistry } from "./systems/itemRegistry.js";
import { createLootSystem } from "./systems/lootSystem.js";

export const RARITY_COLORS = Object.freeze({
  JUNK: "#7F7F7F",
  COMMON: "#FFFFFF",
  UNCOMMON: "#1EFF00",
  RARE: "#0070DD",
  EPIC: "#A335EE",
  LEGENDARY: "#FF8000",
  SUPERLATIVE: "#00FFFF"
});

export const ITEMS = Object.freeze([
  Object.freeze({
    id: "ember_scale",
    name: "Ember Scale",
    description: "A warm scale humming with young draconic energy.",
    rarity: "COMMON",
    equippable: false
  }),
  Object.freeze({
    id: "moonsteel_ingot",
    name: "Moonsteel Ingot",
    description: "Refined moonsteel that gleams in any light.",
    rarity: "UNCOMMON",
    equippable: false
  }),
  Object.freeze({
    id: "crystal_shard",
    name: "Crystal Shard",
    description: "A splinter of guardian crystal that never dulls.",
    rarity: "UNCOMMON",
    equippable: false
  }),
  Object.freeze({
    id: "necrotic_tome",
    name: "Necrotic Tome",
    description: "A brittle tome filled with forbidden rites.",
    rarity: "RARE",
    equippable: false
  }),
  Object.freeze({
    id: "wyrmling_helm",
    name: "Wyrmling Helm",
    description: "A helm forged from ember scales.",
    rarity: "RARE",
    equippable: true,
    equippableInStacks: false,
    equipmentSlotTypeString: "HEAD"
  }),
  Object.freeze({
    id: "duelist_blade",
    name: "Moonlit Duelist Blade",
    description: "A balanced blade favored by moonlit duelists.",
    rarity: "EPIC",
    equippable: true,
    equippableInStacks: false,
    equipmentSlotTypeString: "RIGHT_HAND"
  }),
  Object.freeze({
    id: "guardian_plate",
    name: "Crystal Guardian Plate",
    description: "Dense armor that channels crystalline resolve.",
    rarity: "RARE",
    equippable: true,
    equippableInStacks: false,
    equipmentSlotTypeString: "CHEST"
  })
]);

export const RECIPES = Object.freeze([
  Object.freeze({
    id: "craft_wyrmling_helm",
    name: "Forge Wyrmling Helm",
    resultItemId: "wyrmling_helm",
    ingredients: Object.freeze({
      ember_scale: 3,
      moonsteel_ingot: 1
    })
  }),
  Object.freeze({
    id: "craft_duelist_blade",
    name: "Assemble Duelist Blade",
    resultItemId: "duelist_blade",
    ingredients: Object.freeze({
      moonsteel_ingot: 2,
      crystal_shard: 1
    })
  }),
  Object.freeze({
    id: "craft_guardian_plate",
    name: "Temper Guardian Plate",
    resultItemId: "guardian_plate",
    ingredients: Object.freeze({
      crystal_shard: 3,
      ember_scale: 1
    })
  })
]);

export const EQUIPMENT_SLOTS = Object.freeze(["HEAD", "CHEST", "RIGHT_HAND"]);

export const NPC_LOOT_TABLES = Object.freeze({
  ember_wyrmling: Object.freeze([
    Object.freeze({ itemId: "ember_scale", min: 1, max: 2, chance: 0.9 }),
    Object.freeze({ itemId: "wyrmling_helm", min: 1, max: 1, chance: 0.2 })
  ]),
  moonlit_duelist: Object.freeze([
    Object.freeze({ itemId: "moonsteel_ingot", min: 1, max: 2, chance: 0.75 }),
    Object.freeze({ itemId: "duelist_blade", min: 1, max: 1, chance: 0.15 }),
    Object.freeze({ itemId: "necrotic_tome", min: 1, max: 1, chance: 0.1 })
  ]),
  crystal_guardian: Object.freeze([
    Object.freeze({ itemId: "crystal_shard", min: 1, max: 2, chance: 0.8 }),
    Object.freeze({ itemId: "guardian_plate", min: 1, max: 1, chance: 0.2 })
  ]),
  default: Object.freeze([
    Object.freeze({ itemId: "ember_scale", min: 1, max: 1, chance: 0.4 }),
    Object.freeze({ itemId: "crystal_shard", min: 1, max: 1, chance: 0.4 })
  ])
});

const itemRegistry = createItemRegistry({
  items: ITEMS,
  recipes: RECIPES,
  lootTables: NPC_LOOT_TABLES,
  rarityColors: RARITY_COLORS,
  equipmentSlots: EQUIPMENT_SLOTS
});

const inventoryManager = createInventoryManager({ itemRegistry });
const craftingSystem = createCraftingSystem({ itemRegistry, inventoryManager });
const lootSystem = createLootSystem({ itemRegistry });

export const getItemById = itemRegistry.getItem;
export const getRecipeById = itemRegistry.getRecipe;
export const getRarityColor = itemRegistry.getRarityColor;
export const getLootTable = itemRegistry.getLootTable;

export const rollLootFromTable = lootSystem.rollLootFromTable;
export const rollLoot = lootSystem.rollLoot;

export const addToInventory = inventoryManager.addItem;
export const removeFromInventory = inventoryManager.removeItem;
export const equipItem = inventoryManager.equipItem;
export const unequipItem = inventoryManager.unequipItem;

export const canCraft = craftingSystem.canCraft;
export const craftItem = craftingSystem.craftItem;
