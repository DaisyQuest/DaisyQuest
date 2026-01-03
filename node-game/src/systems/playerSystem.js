export function createPlayerSystem({
  progressionSystem,
  inventoryManager,
  spellRegistry,
  spellbookSystem,
  unlockSystem
}) {
  if (!progressionSystem || !inventoryManager || !spellRegistry || !spellbookSystem || !unlockSystem) {
    throw new Error("Player system requires all dependencies.");
  }

  function createPlayerState({
    progression = progressionSystem.createPlayerProgression(),
    inventory = {},
    equipment = {},
    consumedItems = [],
    knownSpells = [],
    spellbook = spellbookSystem.createSpellbook({ knownSpells })
  } = {}) {
    return {
      progression,
      inventory,
      equipment,
      consumedItems: [...consumedItems],
      knownSpells: [...knownSpells],
      spellbook
    };
  }

  function applyExperience(state, amount) {
    return {
      ...state,
      progression: progressionSystem.applyExperience(state.progression, amount)
    };
  }

  function allocateStatPoint(state, attribute, amount = 1) {
    const updated = progressionSystem.allocateStatPoint(state.progression, attribute, amount);
    return {
      ...state,
      progression: updated
    };
  }

  function addItem(state, itemId, quantity) {
    return {
      ...state,
      inventory: inventoryManager.addItem(state.inventory, itemId, quantity)
    };
  }

  function removeItem(state, itemId, quantity) {
    const result = inventoryManager.removeItem(state.inventory, itemId, quantity);
    return {
      ...state,
      inventory: result.inventory,
      removed: result.removed
    };
  }

  function equipItem(state, itemId) {
    const result = inventoryManager.equipItem(state.inventory, state.equipment, itemId);
    if (result.error) {
      return { ...state, error: result.error };
    }
    return {
      ...state,
      inventory: result.inventory,
      equipment: result.equipment
    };
  }

  function unequipItem(state, slotType) {
    const result = inventoryManager.unequipItem(state.inventory, state.equipment, slotType);
    if (result.error) {
      return { ...state, error: result.error };
    }
    return {
      ...state,
      inventory: result.inventory,
      equipment: result.equipment
    };
  }

  function learnSpell(state, spellId) {
    const spell = spellRegistry.getSpell(spellId);
    if (!spell) {
      return { ...state, error: "Spell not found." };
    }
    if (state.knownSpells.includes(spellId)) {
      return { ...state, error: "Spell already known." };
    }
    const requirementResult = unlockSystem.evaluateRequirements(spell.unlockRequirements, {
      attributes: state.progression.attributes,
      inventory: state.inventory,
      consumedItems: state.consumedItems
    });
    if (!requirementResult.ok) {
      return { ...state, error: requirementResult.reason };
    }
    let nextInventory = state.inventory;
    let nextConsumed = [...state.consumedItems];
    requirementResult.consume.forEach((entry) => {
      const removal = inventoryManager.removeItem(nextInventory, entry.itemId, entry.quantity);
      nextInventory = removal.inventory;
      if (removal.removed && !nextConsumed.includes(entry.itemId)) {
        nextConsumed.push(entry.itemId);
      }
    });
    const knownSpells = [...state.knownSpells, spellId];
    const spellbook = spellbookSystem.createSpellbook({
      knownSpells,
      equippedSlots: state.spellbook.equippedSlots
    });
    return {
      ...state,
      inventory: nextInventory,
      consumedItems: nextConsumed,
      knownSpells,
      spellbook
    };
  }

  function equipSpell(state, spellId, slotIndex = 0) {
    const updated = spellbookSystem.equipSpell(state.spellbook, spellId, slotIndex);
    if (updated.error) {
      return { ...state, error: updated.error };
    }
    return {
      ...state,
      spellbook: updated
    };
  }

  function unequipSpell(state, slotIndex) {
    const updated = spellbookSystem.unequipSpell(state.spellbook, slotIndex);
    if (updated.error) {
      return { ...state, error: updated.error };
    }
    return {
      ...state,
      spellbook: updated
    };
  }

  return Object.freeze({
    createPlayerState,
    applyExperience,
    allocateStatPoint,
    addItem,
    removeItem,
    equipItem,
    unequipItem,
    learnSpell,
    equipSpell,
    unequipSpell
  });
}
