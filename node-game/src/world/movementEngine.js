const DEFAULT_RULES = Object.freeze({
  maxStep: 3,
  allowDiagonal: true,
  otherPlayerStep: 1,
  idleChance: 0.2
});

const MOVE_DIRECTIONS = Object.freeze([
  Object.freeze({ x: 0, y: 0 }),
  Object.freeze({ x: 1, y: 0 }),
  Object.freeze({ x: -1, y: 0 }),
  Object.freeze({ x: 0, y: 1 }),
  Object.freeze({ x: 0, y: -1 }),
  Object.freeze({ x: 1, y: 1 }),
  Object.freeze({ x: 1, y: -1 }),
  Object.freeze({ x: -1, y: 1 }),
  Object.freeze({ x: -1, y: -1 })
]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizePercent(value) {
  if (!Number.isFinite(value)) {
    return null;
  }
  const normalized = value > 1 ? value / 100 : value;
  return clamp(normalized, 0, 1);
}

function getMapBoundsForLocation(worldState, location) {
  if (!worldState?.worldMap) {
    return { error: "World map is required." };
  }
  if (!location) {
    return { error: "Location is required." };
  }

  if (location.submapId) {
    const submap = worldState.submaps?.find((entry) => entry.id === location.submapId);
    if (!submap) {
      return { error: "Submap not found." };
    }
    return {
      width: submap.width,
      height: submap.height,
      maxX: submap.width - 1,
      maxY: submap.height - 1
    };
  }

  return {
    width: worldState.worldMap.width,
    height: worldState.worldMap.height,
    maxX: worldState.worldMap.width - 1,
    maxY: worldState.worldMap.height - 1
  };
}

function resolveTargetPosition(target, bounds) {
  if (!target || typeof target !== "object") {
    return { error: "Movement target is required." };
  }

  if (Number.isFinite(target.x) && Number.isFinite(target.y)) {
    const x = clamp(Math.round(target.x), 0, bounds.maxX);
    const y = clamp(Math.round(target.y), 0, bounds.maxY);
    return { position: { x, y }, clamped: x !== target.x || y !== target.y };
  }

  const xPercent = normalizePercent(target.xPercent);
  const yPercent = normalizePercent(target.yPercent);
  if (xPercent === null || yPercent === null) {
    return { error: "Movement target must include coordinates." };
  }
  const x = clamp(Math.round(xPercent * bounds.maxX), 0, bounds.maxX);
  const y = clamp(Math.round(yPercent * bounds.maxY), 0, bounds.maxY);
  return { position: { x, y }, clamped: false };
}

function stepTowardsTarget({ from, to, maxStep, allowDiagonal }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 0 && dy === 0) {
    return { next: { ...from }, delta: { x: 0, y: 0 } };
  }
  if (!Number.isFinite(maxStep) || maxStep <= 0) {
    return { next: { ...from }, delta: { x: 0, y: 0 } };
  }

  let stepX = clamp(dx, -maxStep, maxStep);
  let stepY = clamp(dy, -maxStep, maxStep);

  if (!allowDiagonal) {
    if (Math.abs(dx) >= Math.abs(dy)) {
      stepY = 0;
      stepX = clamp(dx, -maxStep, maxStep);
    } else {
      stepX = 0;
      stepY = clamp(dy, -maxStep, maxStep);
    }
  }

  return {
    next: { x: from.x + stepX, y: from.y + stepY },
    delta: { x: stepX, y: stepY }
  };
}

function updatePlayerPosition(players, playerId, nextPosition) {
  const index = players.findIndex((player) => player.id === playerId);
  if (index < 0) {
    return { error: "Player not found." };
  }
  const player = players[index];
  const updatedPlayer = {
    ...player,
    position: { ...nextPosition }
  };
  const nextPlayers = [...players];
  nextPlayers[index] = updatedPlayer;
  return { players: nextPlayers, player: updatedPlayer };
}

export function movePlayerToTarget({ worldState, playerId, target, rules = {} } = {}) {
  if (!worldState) {
    return { error: "World state is required." };
  }
  if (!playerId) {
    return { error: "Player id is required." };
  }
  const player = worldState.players?.find((entry) => entry.id === playerId);
  if (!player) {
    return { error: "Player not found." };
  }
  const bounds = getMapBoundsForLocation(worldState, player.location);
  if (bounds.error) {
    return { error: bounds.error };
  }
  const resolvedTarget = resolveTargetPosition(target, bounds);
  if (resolvedTarget.error) {
    return { error: resolvedTarget.error };
  }

  const ruleSet = { ...DEFAULT_RULES, ...rules };
  const from = { ...player.position };
  const { next, delta } = stepTowardsTarget({
    from,
    to: resolvedTarget.position,
    maxStep: ruleSet.maxStep,
    allowDiagonal: ruleSet.allowDiagonal
  });
  const moved = delta.x !== 0 || delta.y !== 0;

  const updateResult = updatePlayerPosition(worldState.players, playerId, next);
  if (updateResult.error) {
    return { error: updateResult.error };
  }

  const nextWorldState = {
    ...worldState,
    players: updateResult.players
  };

  return {
    worldState: nextWorldState,
    movement: {
      id: playerId,
      from,
      to: next,
      target: resolvedTarget.position,
      moved,
      clamped: resolvedTarget.clamped,
      delta,
      distance: Math.hypot(delta.x, delta.y)
    }
  };
}

export function moveOtherPlayers({ worldState, playerId, rng = Math.random, rules = {} } = {}) {
  if (!worldState) {
    return { error: "World state is required." };
  }
  if (!worldState.worldMap) {
    return { error: "World map is required." };
  }
  const ruleSet = { ...DEFAULT_RULES, ...rules };
  const players = worldState.players ?? [];
  const movements = [];

  const nextPlayers = players.map((player) => {
    if (!player || player.id === playerId) {
      return player;
    }
    const bounds = getMapBoundsForLocation(worldState, player.location);
    if (bounds.error) {
      return player;
    }

    const idleRoll = rng();
    const shouldIdle = Number.isFinite(ruleSet.idleChance) && idleRoll < ruleSet.idleChance;
    const directions = shouldIdle ? [MOVE_DIRECTIONS[0]] : MOVE_DIRECTIONS.slice(1);
    const directionIndex = Math.floor(clamp(rng(), 0, 0.9999) * directions.length);
    const direction = directions[directionIndex] ?? MOVE_DIRECTIONS[0];

    const nextPosition = {
      x: clamp(player.position.x + direction.x * ruleSet.otherPlayerStep, 0, bounds.maxX),
      y: clamp(player.position.y + direction.y * ruleSet.otherPlayerStep, 0, bounds.maxY)
    };
    const moved = nextPosition.x !== player.position.x || nextPosition.y !== player.position.y;

    movements.push({
      id: player.id,
      from: { ...player.position },
      to: { ...nextPosition },
      moved
    });

    return {
      ...player,
      position: nextPosition
    };
  });

  return {
    worldState: {
      ...worldState,
      players: nextPlayers
    },
    movements
  };
}

export function applyWorldMovement({
  worldState,
  playerId,
  target,
  rng = Math.random,
  rules = {}
} = {}) {
  const moveResult = movePlayerToTarget({ worldState, playerId, target, rules });
  if (moveResult.error) {
    return { error: moveResult.error };
  }
  const othersResult = moveOtherPlayers({
    worldState: moveResult.worldState,
    playerId,
    rng,
    rules
  });
  if (othersResult.error) {
    return { error: othersResult.error };
  }
  return {
    worldState: othersResult.worldState,
    movement: moveResult.movement,
    otherMovements: othersResult.movements
  };
}

export {
  DEFAULT_RULES,
  MOVE_DIRECTIONS,
  clamp,
  getMapBoundsForLocation,
  normalizePercent,
  resolveTargetPosition,
  stepTowardsTarget
};
