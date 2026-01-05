const DEFAULT_POLL_INTERVAL = 2000;
const DEFAULT_MARKER_RADIUS = 0.14;

const MARKER_LAYER = Object.freeze({
  self: 40,
  player: 30,
  npc: 25,
  object: 20
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function matchesLocation(entityLocation, targetLocation) {
  return (
    entityLocation?.mapId === targetLocation?.mapId &&
    (entityLocation?.submapId ?? null) === (targetLocation?.submapId ?? null)
  );
}

export function getWorldBoundsForLocation(world, location) {
  if (!world?.worldMap) {
    return { error: "World map is required." };
  }
  if (!location) {
    return { error: "Location is required." };
  }
  if (location.submapId) {
    const submap = world.submaps?.find((entry) => entry.id === location.submapId);
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
    width: world.worldMap.width,
    height: world.worldMap.height,
    maxX: world.worldMap.width - 1,
    maxY: world.worldMap.height - 1
  };
}

export function projectToPercent(value, max) {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return 50;
  }
  return clamp((value / max) * 100, 0, 100);
}

export function getSurfacePercentFromEvent({ event, surface }) {
  if (!event || !surface) {
    return null;
  }
  const rect = surface.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return null;
  }
  const xPercent = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  const yPercent = clamp((event.clientY - rect.top) / rect.height, 0, 1);
  return { xPercent, yPercent };
}

export function resolveWorldTargetFromEvent({
  event,
  surface,
  world,
  playerId,
  fallbackRadius = DEFAULT_MARKER_RADIUS
} = {}) {
  const percent = getSurfacePercentFromEvent({ event, surface });
  if (!percent) {
    return null;
  }
  if (!world || !playerId) {
    return { ...percent, precisionRadius: fallbackRadius };
  }
  const player = world.players?.find((entry) => entry.id === playerId);
  if (!player) {
    return { ...percent, precisionRadius: fallbackRadius };
  }
  const bounds = getWorldBoundsForLocation(world, player.location);
  if (bounds.error) {
    return { ...percent, precisionRadius: fallbackRadius };
  }
  return {
    xPercent: percent.xPercent,
    yPercent: percent.yPercent,
    x: Math.round(percent.xPercent * bounds.maxX),
    y: Math.round(percent.yPercent * bounds.maxY),
    precisionRadius: fallbackRadius
  };
}

function createMarkerLabel({ text, doc }) {
  const label = doc.createElement("span");
  label.className = "world-panel__marker-label";
  label.textContent = text ?? "";
  return label;
}

function createMarkerDot({ doc }) {
  const dot = doc.createElement("span");
  dot.className = "world-panel__marker-dot";
  return dot;
}

function applyMarkerMetadata({ marker, positionPercent, position, bounds, radius }) {
  marker.style.setProperty("--x", `${positionPercent.x}%`);
  marker.style.setProperty("--y", `${positionPercent.y}%`);
  marker.dataset.interactionXPercent = String(positionPercent.x / 100);
  marker.dataset.interactionYPercent = String(positionPercent.y / 100);
  marker.dataset.interactionX = String(position.x);
  marker.dataset.interactionY = String(position.y);
  marker.dataset.interactionMaxX = String(bounds.maxX);
  marker.dataset.interactionMaxY = String(bounds.maxY);
  marker.dataset.interactionRadius = String(radius);
}

export function buildWorldMarkers({ world, playerId, doc = document } = {}) {
  if (!world) {
    return [];
  }
  const markers = [];
  const players = Array.isArray(world.players) ? world.players : [];
  const objects = Array.isArray(world.worldObjects) ? world.worldObjects : [];
  const playerLocation = players.find((player) => player.id === playerId)?.location ?? null;

  players.forEach((player) => {
    if (playerLocation && !matchesLocation(player.location, playerLocation)) {
      return;
    }
    const bounds = getWorldBoundsForLocation(world, player.location);
    if (bounds.error) {
      return;
    }
    const isSelf = player.id === playerId;
    const marker = doc.createElement("div");
    marker.className = `world-panel__target world-panel__target--${
      isSelf ? "self" : player.isNpc ? "npc" : "player"
    }`;
    if (player.isNpc && player.isHostile) {
      marker.classList.add("world-panel__target--hostile");
    }
    const positionPercent = {
      x: projectToPercent(player.position.x, bounds.maxX),
      y: projectToPercent(player.position.y, bounds.maxY)
    };
    applyMarkerMetadata({
      marker,
      positionPercent,
      position: player.position,
      bounds,
      radius: DEFAULT_MARKER_RADIUS
    });
    marker.appendChild(createMarkerDot({ doc }));
    marker.appendChild(createMarkerLabel({ text: isSelf ? "You" : player.name, doc }));
    marker.dataset.interactionType = player.isNpc ? "npc" : "player";
    marker.dataset.interactionId = player.id;
    marker.dataset.interactionLabel = player.name;
    marker.dataset.interactionHostile = player.isHostile ? "true" : "false";
    marker.dataset.interactionLayer = String(
      isSelf ? MARKER_LAYER.self : player.isNpc ? MARKER_LAYER.npc : MARKER_LAYER.player
    );
    marker.dataset.self = isSelf ? "true" : "false";
    markers.push(marker);
  });

  objects.forEach((object) => {
    if (playerLocation && !matchesLocation(object.location, playerLocation)) {
      return;
    }
    const bounds = getWorldBoundsForLocation(world, object.location);
    if (bounds.error) {
      return;
    }
    const marker = doc.createElement("div");
    marker.className = "world-panel__target world-panel__target--object";
    const positionPercent = {
      x: projectToPercent(object.position.x, bounds.maxX),
      y: projectToPercent(object.position.y, bounds.maxY)
    };
    applyMarkerMetadata({
      marker,
      positionPercent,
      position: object.position,
      bounds,
      radius: DEFAULT_MARKER_RADIUS
    });
    marker.appendChild(createMarkerDot({ doc }));
    marker.appendChild(createMarkerLabel({ text: object.name, doc }));
    marker.dataset.interactionType = "object";
    marker.dataset.interactionId = object.id;
    marker.dataset.interactionLabel = object.name;
    marker.dataset.interactionLayer = String(MARKER_LAYER.object);
    markers.push(marker);
  });

  return markers;
}

export function renderWorldMap({
  world,
  playerId,
  entitiesContainer,
  coordinatesLabel,
  regionLabel
} = {}) {
  if (!world || !entitiesContainer) {
    return;
  }
  entitiesContainer.innerHTML = "";
  const markers = buildWorldMarkers({ world, playerId, doc: entitiesContainer.ownerDocument });
  entitiesContainer.replaceChildren(...markers);

  const player = world.players?.find((entry) => entry.id === playerId);
  if (player) {
    const bounds = getWorldBoundsForLocation(world, player.location);
    if (!bounds.error && coordinatesLabel) {
      coordinatesLabel.textContent = `Coordinates: ${String(player.position.x).padStart(2, "0")}, ${String(
        player.position.y
      ).padStart(2, "0")}`;
    }
    if (regionLabel) {
      const region = player.location.submapId ?? world.worldMap?.id ?? "Unknown";
      regionLabel.textContent = `Region: ${region}`;
    }
  }
}

export function createWorldMapView({
  surface,
  entitiesContainer,
  coordinatesLabel,
  regionLabel,
  apiRequest,
  pollIntervalMs = DEFAULT_POLL_INTERVAL,
  setIntervalFn = setInterval,
  clearIntervalFn = clearInterval
} = {}) {
  const state = {
    world: null,
    playerId: null,
    intervalId: null
  };

  if (!surface || !entitiesContainer || typeof apiRequest !== "function") {
    return {
      state,
      start() {},
      stop() {},
      refresh: async () => null,
      moveToTarget: async () => null,
      moveToPercent: async () => null
    };
  }

  async function refresh() {
    const payload = await apiRequest("/api/world/state");
    if (!payload) {
      return null;
    }
    state.world = payload.world;
    state.playerId = payload.playerId;
    renderWorldMap({
      world: state.world,
      playerId: state.playerId,
      entitiesContainer,
      coordinatesLabel,
      regionLabel
    });
    return payload;
  }

  async function moveToTarget(target) {
    const payload = await apiRequest("/api/world/move", {
      method: "POST",
      body: { target }
    });
    if (!payload) {
      return null;
    }
    state.world = payload.world;
    state.playerId = payload.playerId;
    renderWorldMap({
      world: state.world,
      playerId: state.playerId,
      entitiesContainer,
      coordinatesLabel,
      regionLabel
    });
    return payload;
  }

  async function moveToPercent({ xPercent, yPercent } = {}) {
    return moveToTarget({ xPercent, yPercent });
  }

  function start() {
    if (state.intervalId) {
      return;
    }
    refresh();
    state.intervalId = setIntervalFn(refresh, pollIntervalMs);
  }

  function stop() {
    if (!state.intervalId) {
      return;
    }
    clearIntervalFn(state.intervalId);
    state.intervalId = null;
  }

  return {
    state,
    start,
    stop,
    refresh,
    moveToTarget,
    moveToPercent
  };
}
