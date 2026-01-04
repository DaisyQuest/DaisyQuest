export const UNLOCKABLE_CATEGORIES = Object.freeze({
  TRAIL: "trail",
  ICON: "icon",
  PIPE: "pipe"
});

const CATEGORY_ALIASES = new Map([
  ["trail", UNLOCKABLE_CATEGORIES.TRAIL],
  ["trails", UNLOCKABLE_CATEGORIES.TRAIL],
  ["icon", UNLOCKABLE_CATEGORIES.ICON],
  ["icons", UNLOCKABLE_CATEGORIES.ICON],
  ["pipe", UNLOCKABLE_CATEGORIES.PIPE],
  ["pipes", UNLOCKABLE_CATEGORIES.PIPE],
  ["pipe-texture", UNLOCKABLE_CATEGORIES.PIPE],
  ["pipe-textures", UNLOCKABLE_CATEGORIES.PIPE]
]);

export function normalizeUnlockableCategory(category) {
  if (typeof category !== "string") {
    return null;
  }
  const normalized = category.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  return CATEGORY_ALIASES.get(normalized) ?? null;
}

export function normalizeTexturePath(texturePath) {
  if (typeof texturePath !== "string") {
    return null;
  }
  const trimmed = texturePath.trim();
  if (!trimmed) {
    return null;
  }
  const normalized = trimmed.replace(/\\/g, "/");
  return normalized.replace(/\/{2,}/g, "/");
}

function normalizeUnlockableId(id) {
  if (typeof id !== "string") {
    return null;
  }
  const trimmed = id.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed;
}

function resolveTexturePath(entry) {
  return normalizeTexturePath(entry?.texturePath ?? entry?.texture ?? entry?.path ?? entry?.textureId);
}

export function normalizeUnlockableEntry(entry, fallbackCategory) {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const category = normalizeUnlockableCategory(entry.category ?? fallbackCategory);
  if (!category) {
    return null;
  }
  const texturePath = resolveTexturePath(entry);
  const id = normalizeUnlockableId(entry.id ?? texturePath);
  if (!id || !texturePath) {
    return null;
  }
  const unlockRequirements = Array.isArray(entry.unlockRequirements)
    ? entry.unlockRequirements
    : [];
  return Object.freeze({
    id,
    category,
    texturePath,
    unlockRequirements: [...unlockRequirements],
    isDefault: Boolean(entry.isDefault)
  });
}

function normalizeUnlockableList(list, category) {
  if (!Array.isArray(list)) {
    return [];
  }
  const unique = new Map();
  list.forEach((entry) => {
    const normalized = normalizeUnlockableEntry(entry, category);
    if (!normalized) {
      return;
    }
    const key = normalized.id.toLowerCase();
    if (!unique.has(key)) {
      unique.set(key, normalized);
    }
  });
  return Array.from(unique.values());
}

function buildTextureIndex(entries) {
  const index = new Map();
  entries.forEach((entry) => {
    const key = `${entry.category}:${entry.texturePath.toLowerCase()}`;
    if (!index.has(key)) {
      index.set(key, entry);
    }
  });
  return index;
}

function buildIdIndex(entries) {
  const index = new Map();
  entries.forEach((entry) => {
    const key = entry.id.toLowerCase();
    if (!index.has(key)) {
      index.set(key, entry);
    }
  });
  return index;
}

function normalizeUnlockList(unlockedIds) {
  if (!unlockedIds) {
    return new Set();
  }
  if (unlockedIds instanceof Set) {
    return new Set(Array.from(unlockedIds).map((id) => String(id).toLowerCase()));
  }
  if (Array.isArray(unlockedIds)) {
    return new Set(unlockedIds.map((id) => String(id).toLowerCase()));
  }
  return new Set();
}

export function createUnlockablesRegistry({
  trails = [],
  icons = [],
  pipeTextures = [],
  unlockables = []
} = {}) {
  const normalizedTrails = normalizeUnlockableList(trails, UNLOCKABLE_CATEGORIES.TRAIL);
  const normalizedIcons = normalizeUnlockableList(icons, UNLOCKABLE_CATEGORIES.ICON);
  const normalizedPipes = normalizeUnlockableList(pipeTextures, UNLOCKABLE_CATEGORIES.PIPE);
  const normalizedMixed = normalizeUnlockableList(unlockables, null);

  const allUnlockables = [
    ...normalizedTrails,
    ...normalizedIcons,
    ...normalizedPipes,
    ...normalizedMixed
  ];

  const idIndex = buildIdIndex(allUnlockables);
  const textureIndex = buildTextureIndex(allUnlockables);

  function listUnlockables() {
    return allUnlockables.map((entry) => ({ ...entry }));
  }

  function listByCategory(category) {
    const normalizedCategory = normalizeUnlockableCategory(category);
    if (!normalizedCategory) {
      return [];
    }
    return allUnlockables
      .filter((entry) => entry.category === normalizedCategory)
      .map((entry) => ({ ...entry }));
  }

  function getUnlockable(id) {
    const normalizedId = normalizeUnlockableId(id);
    if (!normalizedId) {
      return null;
    }
    return idIndex.get(normalizedId.toLowerCase()) ?? null;
  }

  function getUnlockableByTexturePath(texturePath, category) {
    const normalizedPath = normalizeTexturePath(texturePath);
    const normalizedCategory = normalizeUnlockableCategory(category ?? "");
    if (!normalizedPath) {
      return null;
    }
    if (normalizedCategory) {
      return (
        textureIndex.get(`${normalizedCategory}:${normalizedPath.toLowerCase()}`) ?? null
      );
    }
    return (
      allUnlockables.find(
        (entry) => entry.texturePath.toLowerCase() === normalizedPath.toLowerCase()
      ) ?? null
    );
  }

  function isUnlockableTexture(texturePath, category) {
    return Boolean(getUnlockableByTexturePath(texturePath, category));
  }

  function isUnlocked(id, unlockedIds) {
    const normalizedId = normalizeUnlockableId(id);
    if (!normalizedId) {
      return false;
    }
    const unlockedSet = normalizeUnlockList(unlockedIds);
    return unlockedSet.has(normalizedId.toLowerCase());
  }

  function canUseTexture({ texturePath, category, unlockedIds } = {}) {
    const entry = getUnlockableByTexturePath(texturePath, category);
    if (!entry) {
      return false;
    }
    if (entry.isDefault) {
      return true;
    }
    return isUnlocked(entry.id, unlockedIds);
  }

  return Object.freeze({
    listUnlockables,
    listByCategory,
    getUnlockable,
    getUnlockableByTexturePath,
    isUnlockableTexture,
    canUseTexture,
    isUnlocked,
    categories: UNLOCKABLE_CATEGORIES
  });
}
