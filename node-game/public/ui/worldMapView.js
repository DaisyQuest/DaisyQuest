const DEFAULT_POLL_INTERVAL = 2000;

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
    marker.style.setProperty("--x", `${projectToPercent(player.position.x, bounds.maxX)}%`);
    marker.style.setProperty("--y", `${projectToPercent(player.position.y, bounds.maxY)}%`);
    marker.textContent = isSelf ? "You" : player.name;
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
    marker.style.setProperty("--x", `${projectToPercent(object.position.x, bounds.maxX)}%`);
    marker.style.setProperty("--y", `${projectToPercent(object.position.y, bounds.maxY)}%`);
    marker.textContent = object.name;
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

  async function moveToPercent({ xPercent, yPercent } = {}) {
    const payload = await apiRequest("/api/world/move", {
      method: "POST",
      body: { target: { xPercent, yPercent } }
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
    moveToPercent
  };
}
