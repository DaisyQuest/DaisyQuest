export function createLootSystem({ itemRegistry }) {
  function rollLootFromTable(table, rng = Math.random) {
    return table.flatMap((entry) => {
      if (rng() > entry.chance) {
        return [];
      }
      const spread = Math.max(0, entry.max - entry.min);
      const roll = spread === 0 ? 0 : Math.floor(rng() * (spread + 1));
      const quantity = entry.min + roll;
      return quantity > 0 ? [{ itemId: entry.itemId, quantity }] : [];
    });
  }

  function rollLoot(npcId, rng = Math.random) {
    return rollLootFromTable(itemRegistry.getLootTable(npcId), rng);
  }

  return Object.freeze({
    rollLootFromTable,
    rollLoot
  });
}
