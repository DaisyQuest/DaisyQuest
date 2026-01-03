import { createRegistryEditor } from "../src/systems/registryEditor.js";

const baseItems = [
  {
    id: "ember_scale",
    name: "Ember Scale",
    description: "Warm scale",
    rarity: "COMMON",
    equippable: false
  },
  {
    id: "wyrmling_helm",
    name: "Wyrmling Helm",
    description: "Helm",
    rarity: "RARE",
    equippable: true,
    equipmentSlotTypeString: "HEAD"
  }
];

const baseRecipes = [
  {
    id: "craft_helm",
    name: "Craft Helm",
    resultItemId: "wyrmling_helm",
    ingredients: { ember_scale: 2 }
  }
];

describe("registry editor", () => {
  test("adds and updates items", () => {
    const editor = createRegistryEditor({ items: baseItems, recipes: baseRecipes });
    const addResult = editor.addItem({
      id: "moonsteel",
      name: "Moonsteel",
      description: "Shiny",
      rarity: "UNCOMMON",
      equippable: false
    });
    expect(addResult.item.id).toBe("moonsteel");

    const updateResult = editor.updateItem("moonsteel", { name: "Moonsteel Ingot" });
    expect(updateResult.item.name).toBe("Moonsteel Ingot");
  });

  test("rejects invalid or duplicate items", () => {
    const editor = createRegistryEditor({ items: baseItems, recipes: baseRecipes });
    const invalid = editor.addItem({ id: "", name: "" });
    expect(invalid.error).toBe("Item must include id, name, and description.");

    const missingRarity = editor.addItem({
      id: "missing_rarity",
      name: "Missing",
      description: "Missing rarity"
    });
    expect(missingRarity.error).toBe("Item must include rarity.");

    const missingSlot = editor.addItem({
      id: "bad_gear",
      name: "Bad Gear",
      description: "Missing slot",
      rarity: "RARE",
      equippable: true
    });
    expect(missingSlot.error).toBe("Equippable items must define an equipment slot.");

    const duplicate = editor.addItem({
      id: "ember_scale",
      name: "Duplicate",
      description: "desc",
      rarity: "COMMON",
      equippable: false
    });
    expect(duplicate.error).toBe("Item id already exists.");
  });

  test("rejects invalid item updates", () => {
    const editor = createRegistryEditor({ items: baseItems, recipes: baseRecipes });
    const missing = editor.updateItem("missing", { name: "Nope" });
    expect(missing.error).toBe("Item not found.");

    const invalid = editor.updateItem("ember_scale", { description: "", rarity: "" });
    expect(invalid.error).toBe("Item must include id, name, and description.");

    const missingSlot = editor.updateItem("wyrmling_helm", {
      equippable: true,
      equipmentSlotTypeString: ""
    });
    expect(missingSlot.error).toBe("Equippable items must define an equipment slot.");
  });

  test("removes items and dependent recipes", () => {
    const editor = createRegistryEditor({ items: baseItems, recipes: baseRecipes });
    const removal = editor.removeItem("ember_scale");
    expect(removal.removed).toBe("ember_scale");
    expect(editor.listRecipes()).toHaveLength(0);
  });

  test("rejects missing item removals", () => {
    const editor = createRegistryEditor({ items: baseItems, recipes: baseRecipes });
    const removal = editor.removeItem("missing");
    expect(removal.error).toBe("Item not found.");
  });

  test("adds and updates recipes", () => {
    const editor = createRegistryEditor({ items: baseItems, recipes: baseRecipes });
    const addResult = editor.addRecipe({
      id: "craft_scale",
      name: "Craft Scale",
      resultItemId: "ember_scale",
      ingredients: { ember_scale: 1 }
    });
    expect(addResult.recipe.id).toBe("craft_scale");

    const updateResult = editor.updateRecipe("craft_scale", { name: "Scale Recipe" });
    expect(updateResult.recipe.name).toBe("Scale Recipe");
  });

  test("rejects invalid recipes", () => {
    const editor = createRegistryEditor({ items: baseItems, recipes: baseRecipes });
    const incomplete = editor.addRecipe({
      id: "",
      name: "",
      resultItemId: "",
      ingredients: { ember_scale: 1 }
    });
    expect(incomplete.error).toBe("Recipe must include id, name, and result item.");

    const invalid = editor.addRecipe({
      id: "missing",
      name: "Broken",
      resultItemId: "missing",
      ingredients: {}
    });
    expect(invalid.error).toBe("Recipe result item must exist.");

    const missingIngredients = editor.addRecipe({
      id: "empty",
      name: "Empty",
      resultItemId: "ember_scale",
      ingredients: {}
    });
    expect(missingIngredients.error).toBe("Recipe ingredients cannot be empty.");

    const duplicate = editor.addRecipe({
      id: "craft_helm",
      name: "Duplicate",
      resultItemId: "wyrmling_helm",
      ingredients: { ember_scale: 1 }
    });
    expect(duplicate.error).toBe("Recipe id already exists.");

    const invalidIngredient = editor.updateRecipe("craft_helm", {
      ingredients: { ember_scale: 0 }
    });
    expect(invalidIngredient.error).toBe(
      "Recipe ingredients must reference items with positive quantities."
    );

    const unknownIngredient = editor.updateRecipe("craft_helm", {
      ingredients: { missing_item: 1 }
    });
    expect(unknownIngredient.error).toBe(
      "Recipe ingredients must reference items with positive quantities."
    );
  });

  test("rejects missing recipe updates and removals", () => {
    const editor = createRegistryEditor({ items: baseItems, recipes: baseRecipes });
    const update = editor.updateRecipe("missing", { name: "No" });
    expect(update.error).toBe("Recipe not found.");

    const removal = editor.removeRecipe("missing");
    expect(removal.error).toBe("Recipe not found.");
  });

  test("removes recipes", () => {
    const editor = createRegistryEditor({ items: baseItems, recipes: baseRecipes });
    const removal = editor.removeRecipe("craft_helm");
    expect(removal.removed).toBe("craft_helm");
    expect(editor.listRecipes()).toHaveLength(0);
  });

  test("reads items and recipes by id", () => {
    const editor = createRegistryEditor({ items: baseItems, recipes: baseRecipes });
    expect(editor.getItem("ember_scale").name).toBe("Ember Scale");
    expect(editor.getRecipe("craft_helm").name).toBe("Craft Helm");
  });

  test("handles missing registry inputs", () => {
    const editor = createRegistryEditor({ items: null, recipes: null });
    expect(editor.listItems()).toEqual([]);
    expect(editor.listRecipes()).toEqual([]);
  });

  test("skips invalid entries when building indexes", () => {
    const editor = createRegistryEditor({
      items: [null, { name: "No Id", description: "Missing", rarity: "COMMON" }, baseItems[0]],
      recipes: [null]
    });
    expect(editor.getItem("ember_scale").name).toBe("Ember Scale");
    expect(editor.getRecipe("missing")).toBeUndefined();
  });

  test("creates an empty registry when no args passed", () => {
    const editor = createRegistryEditor();
    expect(editor.listItems()).toEqual([]);
    expect(editor.listRecipes()).toEqual([]);
  });

  test("returns a snapshot clone", () => {
    const editor = createRegistryEditor({ items: baseItems, recipes: baseRecipes });
    const snapshot = editor.getSnapshot();
    expect(snapshot.items).toHaveLength(2);
    expect(snapshot.recipes).toHaveLength(1);
  });
});
