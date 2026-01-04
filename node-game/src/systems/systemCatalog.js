import { createCraftingSystem } from "./craftingSystem.js";
import { createInventoryManager } from "./inventorySystem.js";
import { createItemRegistry } from "./itemRegistry.js";
import { createLootSystem } from "./lootSystem.js";
import { createSystemRegistry } from "./systemRegistry.js";

function registerAdditionalSystems(registry, additionalSystems) {
  if (!additionalSystems) {
    return;
  }
  if (Array.isArray(additionalSystems)) {
    additionalSystems.forEach((entry) => {
      if (entry?.name && entry.definition) {
        registry.registerSystem(entry.name, entry.definition);
      }
    });
    return;
  }
  if (typeof additionalSystems === "object") {
    Object.entries(additionalSystems).forEach(([name, definition]) => {
      registry.registerSystem(name, definition);
    });
  }
}

export function createCoreSystemRegistry({ additionalSystems } = {}) {
  const registry = createSystemRegistry();

  registry.registerSystem("itemRegistry", {
    create: ({ context }) =>
      createItemRegistry({
        items: context.items ?? [],
        recipes: context.recipes ?? [],
        lootTables: context.lootTables ?? {},
        rarityColors: context.rarityColors ?? {},
        equipmentSlots: context.equipmentSlots ?? []
      })
  });

  registry.registerSystem("inventoryManager", {
    dependencies: ["itemRegistry"],
    create: ({ dependencies }) =>
      createInventoryManager({ itemRegistry: dependencies.itemRegistry })
  });

  registry.registerSystem("craftingSystem", {
    dependencies: ["itemRegistry", "inventoryManager"],
    create: ({ dependencies }) =>
      createCraftingSystem({
        itemRegistry: dependencies.itemRegistry,
        inventoryManager: dependencies.inventoryManager
      })
  });

  registry.registerSystem("lootSystem", {
    dependencies: ["itemRegistry"],
    create: ({ dependencies }) => createLootSystem({ itemRegistry: dependencies.itemRegistry })
  });

  registerAdditionalSystems(registry, additionalSystems);

  return registry;
}
