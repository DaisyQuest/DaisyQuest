function cloneArray(values) {
  return values.map((value) => ({ ...value }));
}

function normalizeItems(items) {
  return Array.isArray(items) ? cloneArray(items) : [];
}

function normalizeRecipes(recipes) {
  return Array.isArray(recipes) ? cloneArray(recipes) : [];
}

function buildIndex(list, key) {
  const map = new Map();
  list.forEach((entry) => {
    if (entry && entry[key]) {
      map.set(entry[key], entry);
    }
  });
  return map;
}

function validateItem(item) {
  if (!item || !item.id || !item.name || !item.description) {
    return "Item must include id, name, and description.";
  }
  if (!item.rarity) {
    return "Item must include rarity.";
  }
  if (item.equippable && !item.equipmentSlotTypeString) {
    return "Equippable items must define an equipment slot.";
  }
  return null;
}

function validateRecipe(recipe, itemIndex) {
  if (!recipe || !recipe.id || !recipe.name || !recipe.resultItemId) {
    return "Recipe must include id, name, and result item.";
  }
  if (!itemIndex.has(recipe.resultItemId)) {
    return "Recipe result item must exist.";
  }
  if (!recipe.ingredients || Object.keys(recipe.ingredients).length === 0) {
    return "Recipe ingredients cannot be empty.";
  }
  const invalidIngredient = Object.entries(recipe.ingredients).find(
    ([itemId, amount]) => !itemIndex.has(itemId) || amount <= 0
  );
  if (invalidIngredient) {
    return "Recipe ingredients must reference items with positive quantities.";
  }
  return null;
}

export function createRegistryEditor({ items, recipes } = {}) {
  let itemList = normalizeItems(items);
  let recipeList = normalizeRecipes(recipes);
  let itemIndex = buildIndex(itemList, "id");
  let recipeIndex = buildIndex(recipeList, "id");

  function refreshIndexes() {
    itemIndex = buildIndex(itemList, "id");
    recipeIndex = buildIndex(recipeList, "id");
  }

  function getSnapshot() {
    return {
      items: cloneArray(itemList),
      recipes: cloneArray(recipeList)
    };
  }

  function listItems() {
    return cloneArray(itemList);
  }

  function listRecipes() {
    return cloneArray(recipeList);
  }

  function getItem(id) {
    return itemIndex.get(id);
  }

  function getRecipe(id) {
    return recipeIndex.get(id);
  }

  function addItem(item) {
    const error = validateItem(item);
    if (error) {
      return { error };
    }
    if (itemIndex.has(item.id)) {
      return { error: "Item id already exists." };
    }
    itemList = [...itemList, { ...item }];
    refreshIndexes();
    return { item: getItem(item.id) };
  }

  function updateItem(id, updates) {
    const existing = itemIndex.get(id);
    if (!existing) {
      return { error: "Item not found." };
    }
    const candidate = { ...existing, ...updates, id: existing.id };
    const error = validateItem(candidate);
    if (error) {
      return { error };
    }
    itemList = itemList.map((item) => (item.id === id ? candidate : item));
    refreshIndexes();
    return { item: getItem(id) };
  }

  function removeItem(id) {
    if (!itemIndex.has(id)) {
      return { error: "Item not found." };
    }
    itemList = itemList.filter((item) => item.id !== id);
    recipeList = recipeList.filter(
      (recipe) => recipe.resultItemId !== id && !recipe.ingredients?.[id]
    );
    refreshIndexes();
    return { removed: id };
  }

  function addRecipe(recipe) {
    const error = validateRecipe(recipe, itemIndex);
    if (error) {
      return { error };
    }
    if (recipeIndex.has(recipe.id)) {
      return { error: "Recipe id already exists." };
    }
    recipeList = [...recipeList, { ...recipe }];
    refreshIndexes();
    return { recipe: getRecipe(recipe.id) };
  }

  function updateRecipe(id, updates) {
    const existing = recipeIndex.get(id);
    if (!existing) {
      return { error: "Recipe not found." };
    }
    const candidate = { ...existing, ...updates, id: existing.id };
    const error = validateRecipe(candidate, itemIndex);
    if (error) {
      return { error };
    }
    recipeList = recipeList.map((recipe) => (recipe.id === id ? candidate : recipe));
    refreshIndexes();
    return { recipe: getRecipe(id) };
  }

  function removeRecipe(id) {
    if (!recipeIndex.has(id)) {
      return { error: "Recipe not found." };
    }
    recipeList = recipeList.filter((recipe) => recipe.id !== id);
    refreshIndexes();
    return { removed: id };
  }

  return Object.freeze({
    getSnapshot,
    listItems,
    listRecipes,
    getItem,
    getRecipe,
    addItem,
    updateItem,
    removeItem,
    addRecipe,
    updateRecipe,
    removeRecipe
  });
}
