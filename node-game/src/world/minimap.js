export const MINIMAP_ENTITY_TYPES = Object.freeze({
  SELF: "SELF",
  PLAYER: "PLAYER",
  NPC: "NPC",
  WORLD_OBJECT: "WORLD_OBJECT"
});

export const MINIMAP_VISIBILITY_RADIUS = 6;

function normalizeRadius(radius) {
  if (!Number.isFinite(radius)) {
    return MINIMAP_VISIBILITY_RADIUS;
  }
  return Math.max(0, radius);
}

function getBounds({ centerX, centerY, radius, maxX, maxY }) {
  const boundedMaxX = Math.max(0, maxX);
  const boundedMaxY = Math.max(0, maxY);
  const maxXValue = Math.min(boundedMaxX, centerX + radius);
  const maxYValue = Math.min(boundedMaxY, centerY + radius);
  const minX = Math.max(0, Math.min(centerX - radius, maxXValue));
  const minY = Math.max(0, Math.min(centerY - radius, maxYValue));
  return {
    minX,
    maxX: maxXValue,
    minY,
    maxY: maxYValue
  };
}

function isWithinBounds({ x, y, minX, maxX, minY, maxY }) {
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

function isWithinRadius({ x, y, centerX, centerY, radius }) {
  const dx = x - centerX;
  const dy = y - centerY;
  return dx * dx + dy * dy <= radius * radius;
}

function matchesLocation(entityLocation, targetLocation) {
  return (
    entityLocation.mapId === targetLocation.mapId &&
    (entityLocation.submapId ?? null) === (targetLocation.submapId ?? null)
  );
}

function getSubmapById(submaps, submapId) {
  return submaps.find((submap) => submap.id === submapId) ?? null;
}

function resolveBoundsForPlayer(worldState, player) {
  if (player.location.submapId) {
    const submap = getSubmapById(worldState.submaps, player.location.submapId);
    if (!submap) {
      throw new Error("Submap not found.");
    }
    return { maxX: submap.width - 1, maxY: submap.height - 1 };
  }
  return { maxX: worldState.worldMap.width - 1, maxY: worldState.worldMap.height - 1 };
}

function buildPlayerEntry(player, isSelf) {
  const type = isSelf
    ? MINIMAP_ENTITY_TYPES.SELF
    : player.isNpc
      ? MINIMAP_ENTITY_TYPES.NPC
      : MINIMAP_ENTITY_TYPES.PLAYER;
  return {
    id: player.id,
    type,
    x: player.position.x,
    y: player.position.y,
    label: player.name
  };
}

function buildWorldObjectEntry(object) {
  return {
    id: object.id,
    type: MINIMAP_ENTITY_TYPES.WORLD_OBJECT,
    x: object.position.x,
    y: object.position.y,
    label: object.name
  };
}

export function buildMinimapSnapshot({ worldState, playerId, radius }) {
  if (!worldState) {
    throw new Error("World state is required.");
  }
  const player = worldState.players.find((entry) => entry.id === playerId);
  if (!player) {
    throw new Error("Player not found.");
  }

  const normalizedRadius = normalizeRadius(radius);
  const { maxX, maxY } = resolveBoundsForPlayer(worldState, player);
  const bounds = getBounds({
    centerX: player.position.x,
    centerY: player.position.y,
    radius: normalizedRadius,
    maxX,
    maxY
  });

  const entries = [];
  worldState.players
    .filter((entry) => matchesLocation(entry.location, player.location))
    .filter((entry) =>
      isWithinBounds({
        x: entry.position.x,
        y: entry.position.y,
        ...bounds
      })
    )
    .filter((entry) =>
      isWithinRadius({
        x: entry.position.x,
        y: entry.position.y,
        centerX: player.position.x,
        centerY: player.position.y,
        radius: normalizedRadius
      })
    )
    .forEach((entry) => entries.push(buildPlayerEntry(entry, entry.id === player.id)));

  worldState.worldObjects
    .filter((entry) => matchesLocation(entry.location, player.location))
    .filter((entry) =>
      isWithinBounds({
        x: entry.position.x,
        y: entry.position.y,
        ...bounds
      })
    )
    .filter((entry) =>
      isWithinRadius({
        x: entry.position.x,
        y: entry.position.y,
        centerX: player.position.x,
        centerY: player.position.y,
        radius: normalizedRadius
      })
    )
    .forEach((entry) => entries.push(buildWorldObjectEntry(entry)));

  return {
    center: { x: player.position.x, y: player.position.y },
    radius: normalizedRadius,
    location: { ...player.location },
    entries
  };
}

export {
  buildPlayerEntry,
  buildWorldObjectEntry,
  getBounds,
  isWithinBounds,
  isWithinRadius,
  matchesLocation,
  normalizeRadius,
  resolveBoundsForPlayer
};
