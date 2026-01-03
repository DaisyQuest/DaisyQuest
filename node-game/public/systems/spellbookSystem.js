export function createSpellbookSystem({ spellRegistry, slotCount = 4 } = {}) {
  if (!spellRegistry) {
    throw new Error("Spell registry is required.");
  }
  function createSpellbook({ knownSpells = [], equippedSlots = [] } = {}) {
    const normalizedSlots = [...equippedSlots];
    while (normalizedSlots.length < slotCount) {
      normalizedSlots.push(null);
    }
    return {
      knownSpells: [...knownSpells],
      equippedSlots: normalizedSlots.slice(0, slotCount)
    };
  }

  function equipSpell(spellbook, spellId, slotIndex = 0) {
    const spell = spellRegistry.getSpell(spellId);
    if (!spell) {
      return { ...spellbook, error: "Spell not found." };
    }
    if (!spellbook.knownSpells.includes(spellId)) {
      return { ...spellbook, error: "Spell is not known." };
    }
    if (slotIndex < 0 || slotIndex >= slotCount) {
      return { ...spellbook, error: "Invalid spell slot." };
    }
    const equippedSlots = [...spellbook.equippedSlots];
    equippedSlots[slotIndex] = spellId;
    return { ...spellbook, equippedSlots };
  }

  function unequipSpell(spellbook, slotIndex) {
    if (slotIndex < 0 || slotIndex >= slotCount) {
      return { ...spellbook, error: "Invalid spell slot." };
    }
    const equippedSlots = [...spellbook.equippedSlots];
    if (!equippedSlots[slotIndex]) {
      return { ...spellbook, error: "No spell equipped in that slot." };
    }
    equippedSlots[slotIndex] = null;
    return { ...spellbook, equippedSlots };
  }

  return Object.freeze({
    createSpellbook,
    equipSpell,
    unequipSpell,
    slotCount
  });
}
