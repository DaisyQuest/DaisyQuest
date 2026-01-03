export function createItemRegistry({
  items,
  recipes,
  lootTables,
  rarityColors,
  equipmentSlots
}) {
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const recipesById = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const slots = [...equipmentSlots];

  function getItem(id) {
    return itemsById.get(id);
  }

  function getRecipe(id) {
    return recipesById.get(id);
  }

  function getLootTable(npcId) {
    return lootTables[npcId] ?? lootTables.default ?? [];
  }

  function getRarityColor(rarity) {
    return rarityColors[rarity] ?? rarityColors.COMMON ?? "#FFFFFF";
  }

  function isSupportedSlot(slotType) {
    return slots.includes(slotType);
  }

  function listEquipmentSlots() {
    return [...slots];
  }

  return Object.freeze({
    getItem,
    getRecipe,
    getLootTable,
    getRarityColor,
    isSupportedSlot,
    listEquipmentSlots
  });
}
