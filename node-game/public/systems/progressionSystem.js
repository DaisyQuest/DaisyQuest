export const DND_ATTRIBUTES = Object.freeze([
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma"
]);

const DEFAULT_THRESHOLDS = [0, 120, 280, 480, 720, 1000];
const DEFAULT_BASE_ATTRIBUTE_VALUE = 10;
const DEFAULT_LINEAR_BASE_XP = 100;
const DEFAULT_LINEAR_INCREMENT = 50;
const DEFAULT_LOGARITHMIC_SCALE = 500;

function sanitizeThresholds(thresholds) {
  if (!Array.isArray(thresholds) || thresholds.length < 2) {
    return DEFAULT_THRESHOLDS;
  }
  const sorted = [...thresholds]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value >= 0)
    .sort((a, b) => a - b);

  if (sorted.length < 2) {
    return DEFAULT_THRESHOLDS;
  }
  if (sorted[0] !== 0) {
    sorted.unshift(0);
  }
  return sorted;
}

function sanitizeAttributes(baseAttributes) {
  if (!Array.isArray(baseAttributes) || baseAttributes.length === 0) {
    return [...DND_ATTRIBUTES];
  }
  const sanitized = baseAttributes
    .map((attribute) => `${attribute}`.trim())
    .filter(Boolean);
  return sanitized.length > 0 ? Array.from(new Set(sanitized)) : [...DND_ATTRIBUTES];
}

function resolveLevel(thresholds, totalXp) {
  const xp = Math.max(0, totalXp);
  let level = 1;
  for (let index = 1; index < thresholds.length; index += 1) {
    if (xp >= thresholds[index]) {
      level = index + 1;
    } else {
      break;
    }
  }
  return level;
}

function getLevelBounds(thresholds, level) {
  const clampedLevel = Math.max(1, Math.floor(level));
  const maxIndex = thresholds.length - 1;
  const thresholdIndex = Math.min(clampedLevel - 1, maxIndex);
  const current = thresholds[thresholdIndex];
  const next = thresholds[Math.min(thresholdIndex + 1, maxIndex)];
  return { current, next };
}

function createSnapshot(thresholds, totalXp) {
  const level = resolveLevel(thresholds, totalXp);
  const { current, next } = getLevelBounds(thresholds, level);
  const clampedTotal = Math.max(0, totalXp);
  const span = Math.max(1, next - current);
  const progress = Math.min(1, (clampedTotal - current) / span);
  return {
    level,
    totalXp: clampedTotal,
    currentXp: clampedTotal - current,
    nextLevelXp: next - current,
    progress
  };
}

export function createProgressionSystem({
  thresholds,
  baseAttributes,
  linearBaseXp = DEFAULT_LINEAR_BASE_XP,
  linearIncrement = DEFAULT_LINEAR_INCREMENT,
  logarithmicScale = DEFAULT_LOGARITHMIC_SCALE,
  linearCapLevel = 20
} = {}) {
  const xpThresholds = sanitizeThresholds(thresholds);
  const attributeList = sanitizeAttributes(baseAttributes);

  function getProgressSnapshot(totalXp) {
    return createSnapshot(xpThresholds, totalXp ?? 0);
  }

  function createAttributes(overrides = {}) {
    const normalized = typeof overrides === "object" && overrides ? overrides : {};
    return attributeList.reduce((accumulator, attribute) => {
      const value = Number(normalized[attribute]);
      accumulator[attribute] = Number.isFinite(value) ? value : DEFAULT_BASE_ATTRIBUTE_VALUE;
      return accumulator;
    }, {});
  }

  function createPlayerProgression({
    level = 1,
    experience = 0,
    statPoints = 0,
    attributes = {}
  } = {}) {
    return {
      level: Math.max(1, Math.floor(level)),
      experience: Math.max(0, Math.floor(experience)),
      statPoints: Math.max(0, Math.floor(statPoints)),
      attributes: createAttributes(attributes)
    };
  }

  function experienceForLevel(level) {
    const targetLevel = Math.max(1, Math.floor(level));
    if (targetLevel === 1) {
      return 0;
    }
    if (targetLevel <= linearCapLevel) {
      return linearBaseXp + linearIncrement * (targetLevel - 1);
    }
    const linearCapXp = linearBaseXp + linearIncrement * (linearCapLevel - 1);
    const overflow = targetLevel - linearCapLevel + 1;
    return Math.round(linearCapXp + logarithmicScale * Math.log(overflow));
  }

  function experienceForNextLevel(level) {
    return experienceForLevel(Math.max(1, Math.floor(level)) + 1);
  }

  function resolveLevelFromExperience(totalExperience) {
    let level = 1;
    let nextLevel = level + 1;
    while (totalExperience >= experienceForLevel(nextLevel)) {
      level = nextLevel;
      nextLevel += 1;
    }
    return level;
  }

  function applyExperience(state, amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
      return state;
    }
    const totalExperience = state.experience + amount;
    const nextLevel = resolveLevelFromExperience(totalExperience);
    const gainedLevels = Math.max(0, nextLevel - state.level);
    return {
      ...state,
      experience: totalExperience,
      level: nextLevel,
      statPoints: state.statPoints + gainedLevels
    };
  }

  function allocateStatPoint(state, attribute, amount = 1) {
    if (!attributeList.includes(attribute)) {
      return { ...state, error: "Unknown attribute." };
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ...state, error: "Invalid point amount." };
    }
    if (state.statPoints < amount) {
      return { ...state, error: "Not enough stat points." };
    }
    return {
      ...state,
      statPoints: state.statPoints - amount,
      attributes: {
        ...state.attributes,
        [attribute]: state.attributes[attribute] + amount
      }
    };
  }

  function awardXp(state, amount) {
    if (!state || typeof state.totalXp !== "number") {
      return { error: "Invalid progression state." };
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { state, leveledUp: false, gained: 0 };
    }
    const updatedTotal = state.totalXp + amount;
    const snapshot = getProgressSnapshot(updatedTotal);
    const leveledUp = snapshot.level > state.level;
    return { state: snapshot, leveledUp, gained: amount };
  }

  return Object.freeze({
    thresholds: [...xpThresholds],
    getProgressSnapshot,
    awardXp,
    createAttributes,
    createPlayerProgression,
    experienceForLevel,
    experienceForNextLevel,
    applyExperience,
    allocateStatPoint
  });
}
