export const DND_ATTRIBUTES = Object.freeze([
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma"
]);

export function createProgressionSystem({
  baseAttributes = DND_ATTRIBUTES,
  startingAttributeValue = 10,
  statPointsPerLevel = 2,
  linearLevelCap = 20,
  linearBaseXp = 100,
  linearIncrement = 50,
  logarithmicScale = 500
} = {}) {
  function createAttributes(overrides = {}) {
    return baseAttributes.reduce((acc, attribute) => {
      acc[attribute] = overrides[attribute] ?? startingAttributeValue;
      return acc;
    }, {});
  }

  function experienceForLevel(level) {
    if (level <= 1) {
      return 0;
    }
    if (level <= linearLevelCap) {
      return linearBaseXp + (level - 1) * linearIncrement;
    }
    const linearEnd = linearBaseXp + (linearLevelCap - 1) * linearIncrement;
    const postLinearLevel = level - linearLevelCap + 1;
    return Math.round(linearEnd + logarithmicScale * postLinearLevel * Math.log10(postLinearLevel + 1));
  }

  function experienceForNextLevel(currentLevel) {
    return experienceForLevel(currentLevel + 1);
  }

  function applyExperience(state, amount) {
    if (amount <= 0) {
      return { ...state };
    }
    let level = state.level;
    let experience = state.experience + amount;
    let statPoints = state.statPoints;
    let nextLevelXp = experienceForNextLevel(level);

    while (experience >= nextLevelXp) {
      level += 1;
      statPoints += statPointsPerLevel;
      nextLevelXp = experienceForNextLevel(level);
    }

    return {
      ...state,
      level,
      experience,
      statPoints
    };
  }

  function allocateStatPoint(state, attribute, amount = 1) {
    if (!baseAttributes.includes(attribute)) {
      return { ...state, error: "Unknown attribute." };
    }
    if (amount <= 0) {
      return { ...state, error: "Invalid point amount." };
    }
    if (state.statPoints < amount) {
      return { ...state, error: "Not enough stat points." };
    }
    const attributes = {
      ...state.attributes,
      [attribute]: state.attributes[attribute] + amount
    };
    return {
      ...state,
      attributes,
      statPoints: state.statPoints - amount
    };
  }

  function createPlayerProgression({
    level = 1,
    experience = 0,
    statPoints = 0,
    attributes = createAttributes()
  } = {}) {
    return {
      level,
      experience,
      statPoints,
      attributes
    };
  }

  return Object.freeze({
    createPlayerProgression,
    createAttributes,
    experienceForLevel,
    experienceForNextLevel,
    applyExperience,
    allocateStatPoint,
    baseAttributes
  });
}
