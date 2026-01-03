const DEFAULT_THRESHOLDS = [0, 120, 280, 480, 720, 1000];

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

export function createProgressionSystem({ thresholds } = {}) {
  const xpThresholds = sanitizeThresholds(thresholds);

  function getProgressSnapshot(totalXp) {
    return createSnapshot(xpThresholds, totalXp ?? 0);
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
    awardXp
  });
}
