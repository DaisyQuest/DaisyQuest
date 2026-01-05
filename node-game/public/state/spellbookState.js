export function normalizeSpellbookState({ knownSpells, spellbook, slotCount } = {}) {
  const normalizedKnown = Array.isArray(knownSpells) ? [...knownSpells] : [];
  const normalizedSlots = Array.isArray(spellbook?.equippedSlots)
    ? [...spellbook.equippedSlots]
    : [];
  const resolvedSlotCount = Number.isInteger(slotCount) && slotCount >= 0
    ? slotCount
    : normalizedSlots.length;

  while (normalizedSlots.length < resolvedSlotCount) {
    normalizedSlots.push(null);
  }

  return {
    knownSpells: normalizedKnown,
    spellbook: {
      knownSpells: normalizedKnown,
      equippedSlots: normalizedSlots.slice(0, resolvedSlotCount)
    }
  };
}
