export function createSpellRegistry({ spells }) {
  const spellsById = new Map(spells.map((spell) => [spell.id, spell]));

  function getSpell(id) {
    return spellsById.get(id);
  }

  function listSpells() {
    return [...spells];
  }

  return Object.freeze({
    getSpell,
    listSpells
  });
}
