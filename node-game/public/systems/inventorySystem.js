export function createInventoryManager({ itemRegistry }) {
  function addItem(inventory, itemId, quantity) {
    if (quantity <= 0) {
      return { ...inventory };
    }
    const next = { ...inventory };
    next[itemId] = (next[itemId] ?? 0) + quantity;
    return next;
  }

  function removeItem(inventory, itemId, quantity) {
    const current = inventory[itemId] ?? 0;
    if (quantity <= 0 || current < quantity) {
      return { inventory: { ...inventory }, removed: false };
    }
    const next = { ...inventory };
    const remaining = current - quantity;
    if (remaining === 0) {
      delete next[itemId];
    } else {
      next[itemId] = remaining;
    }
    return { inventory: next, removed: true };
  }

  function equipItem(inventory, equipment, itemId) {
    const item = itemRegistry.getItem(itemId);
    if (!item) {
      return { inventory, equipment, error: "Item not found." };
    }
    if (!item.equippable || !item.equipmentSlotTypeString) {
      return { inventory, equipment, error: "Item cannot be equipped." };
    }
    if (!itemRegistry.isSupportedSlot(item.equipmentSlotTypeString)) {
      return { inventory, equipment, error: "Item cannot be equipped." };
    }
    const available = inventory[itemId] ?? 0;
    if (available <= 0) {
      return { inventory, equipment, error: "Item is not in inventory." };
    }
    const slot = item.equipmentSlotTypeString;
    let nextInventory = { ...inventory };
    const nextEquipment = { ...equipment };
    const existing = nextEquipment[slot];
    if (existing) {
      nextInventory = addItem(nextInventory, existing, 1);
    }
    nextEquipment[slot] = itemId;
    nextInventory = removeItem(nextInventory, itemId, 1).inventory;
    return { inventory: nextInventory, equipment: nextEquipment, equipped: itemId };
  }

  function unequipItem(inventory, equipment, slotType) {
    const existing = equipment[slotType];
    if (!existing) {
      return { inventory, equipment, error: "No item equipped in that slot." };
    }
    const nextEquipment = { ...equipment };
    delete nextEquipment[slotType];
    const nextInventory = addItem(inventory, existing, 1);
    return { inventory: nextInventory, equipment: nextEquipment, unequipped: existing };
  }

  return Object.freeze({
    addItem,
    removeItem,
    equipItem,
    unequipItem
  });
}
