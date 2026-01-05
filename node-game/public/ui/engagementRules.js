const DEFAULT_ENGAGE_RANGE = 2;

function isSameLocation(a, b) {
  return (
    a?.mapId === b?.mapId &&
    (a?.submapId ?? null) === (b?.submapId ?? null)
  );
}

export function resolveEngagementStatus({ world, playerId, targetId, range = DEFAULT_ENGAGE_RANGE } = {}) {
  if (!world) {
    return { canEngage: false, reason: "World state is not ready.", range, distance: null };
  }
  const players = Array.isArray(world.players) ? world.players : [];
  const player = players.find((entry) => entry.id === playerId);
  if (!player) {
    return { canEngage: false, reason: "Player location is unavailable.", range, distance: null };
  }
  const target = players.find((entry) => entry.id === targetId);
  if (!target) {
    return { canEngage: false, reason: "Target location is unavailable.", range, distance: null };
  }
  if (!isSameLocation(player.location, target.location)) {
    const label = target.name ?? "Target";
    return {
      canEngage: false,
      reason: `${label} is in another region. Move closer to engage.`,
      range,
      distance: null
    };
  }
  const distance = Math.hypot(
    player.position.x - target.position.x,
    player.position.y - target.position.y
  );
  if (!Number.isFinite(distance)) {
    return { canEngage: false, reason: "Distance could not be determined.", range, distance: null };
  }
  const canEngage = distance <= range;
  return {
    canEngage,
    distance,
    range,
    reason: canEngage
      ? null
      : `Move within ${range} tiles to engage ${target.name ?? "the target"}.`
  };
}

export { DEFAULT_ENGAGE_RANGE };
