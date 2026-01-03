export function createCraftingSystem({ itemRegistry, inventoryManager }) {
  function canCraft(inventory, recipe) {
    if (!recipe) {
      return false;
    }
    return Object.entries(recipe.ingredients).every(([itemId, amount]) => {
      return (inventory[itemId] ?? 0) >= amount;
    });
  }

  function craftItem(inventory, recipeId) {
    const recipe = itemRegistry.getRecipe(recipeId);
    if (!recipe) {
      return { inventory, crafted: null, error: "Recipe not found." };
    }
    if (!canCraft(inventory, recipe)) {
      return { inventory, crafted: null, error: "Missing ingredients." };
    }
    let nextInventory = { ...inventory };
    Object.entries(recipe.ingredients).forEach(([itemId, amount]) => {
      nextInventory = inventoryManager.removeItem(nextInventory, itemId, amount).inventory;
    });
    nextInventory = inventoryManager.addItem(nextInventory, recipe.resultItemId, 1);
    return { inventory: nextInventory, crafted: recipe.resultItemId };
  }

  return Object.freeze({
    canCraft,
    craftItem
  });
}
