function normalizeSpellId(id) {
  if (typeof id !== "string") {
    return null;
  }
  const trimmed = id.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed;
}

function normalizeUnlockRequirements(requirements) {
  if (!Array.isArray(requirements)) {
    return [];
  }
  return [...requirements];
}

export function createSpellUnlockRegistry({ spells = [] } = {}) {
  const entries = new Map();

  if (Array.isArray(spells)) {
    spells.forEach((spell) => {
      if (!spell || typeof spell !== "object") {
        return;
      }
      const id = normalizeSpellId(spell.id);
      if (!id) {
        return;
      }
      const key = id.toLowerCase();
      if (entries.has(key)) {
        return;
      }
      entries.set(
        key,
        Object.freeze({
          id,
          spellId: id,
          unlockRequirements: normalizeUnlockRequirements(spell.unlockRequirements),
          isDefault: Boolean(spell.isDefault)
        })
      );
    });
  }

  const unlockList = Array.from(entries.values());

  function listUnlocks() {
    return unlockList.map((entry) => ({ ...entry }));
  }

  function getUnlock(spellId) {
    const normalized = normalizeSpellId(spellId);
    if (!normalized) {
      return null;
    }
    return entries.get(normalized.toLowerCase()) ?? null;
  }

  function listDefaultSpellIds() {
    return unlockList.filter((entry) => entry.isDefault).map((entry) => entry.spellId);
  }

  return Object.freeze({
    listUnlocks,
    getUnlock,
    listDefaultSpellIds
  });
}
