import { NPCS } from "../battle.js";

const DEFAULT_WORLD_MAP = Object.freeze({
  id: "ember-realm",
  width: 40,
  height: 40
});

const DEFAULT_SUBMAPS = Object.freeze([
  Object.freeze({
    id: "glimmer-cavern",
    parentMapId: DEFAULT_WORLD_MAP.id,
    width: 18,
    height: 18
  })
]);

function createWorldMap({ id, width, height }) {
  return { id, width, height };
}

function createSubmap({ id, parentMapId, width, height }) {
  return { id, parentMapId, width, height };
}

function createPlayer({ id, name, isNpc = false, isHostile = false, location, position }) {
  return {
    id,
    name,
    isNpc,
    isHostile,
    location: { ...location },
    position: { ...position }
  };
}

function createWorldObject({ id, name, objectType, location, position }) {
  return {
    id,
    name,
    objectType,
    location: { ...location },
    position: { ...position }
  };
}

function createWorldState({ playerId, playerName }) {
  const spawnPosition = Object.freeze({ x: 20, y: 20 });
  const hostileSpawnOffsets = [
    Object.freeze({ x: 2, y: 0 }),
    Object.freeze({ x: -2, y: 1 }),
    Object.freeze({ x: 1, y: -2 })
  ];
  const worldMap = createWorldMap(DEFAULT_WORLD_MAP);
  const submaps = DEFAULT_SUBMAPS.map((submap) => createSubmap(submap));
  const players = [
    createPlayer({
      id: playerId,
      name: playerName,
      location: { mapId: worldMap.id, submapId: null },
      position: spawnPosition
    }),
    ...NPCS.map((npc, index) => {
      const offset = hostileSpawnOffsets[index % hostileSpawnOffsets.length];
      return createPlayer({
        id: npc.id,
        name: npc.name,
        isNpc: true,
        isHostile: true,
        location: { mapId: worldMap.id, submapId: null },
        position: {
          x: spawnPosition.x + offset.x,
          y: spawnPosition.y + offset.y
        }
      });
    }),
    createPlayer({
      id: "sun-scout",
      name: "Sun Scout",
      isNpc: true,
      isHostile: false,
      location: { mapId: worldMap.id, submapId: null },
      position: { x: 24, y: 20 }
    }),
    createPlayer({
      id: "cavern-mystic",
      name: "Cavern Mystic",
      isNpc: true,
      isHostile: false,
      location: { mapId: worldMap.id, submapId: "glimmer-cavern" },
      position: { x: 4, y: 4 }
    }),
    createPlayer({
      id: "ranger-ally",
      name: "Ranger Ally",
      location: { mapId: worldMap.id, submapId: null },
      position: { x: 36, y: 36 }
    })
  ];
  const worldObjects = [
    createWorldObject({
      id: "sun-altar",
      name: "Sun Altar",
      objectType: "altar",
      location: { mapId: worldMap.id, submapId: null },
      position: { x: 22, y: 23 }
    }),
    createWorldObject({
      id: "cavern-torch",
      name: "Cavern Torch",
      objectType: "torch",
      location: { mapId: worldMap.id, submapId: "glimmer-cavern" },
      position: { x: 7, y: 8 }
    })
  ];

  return {
    worldMap,
    submaps,
    players,
    worldObjects
  };
}

export {
  createWorldMap,
  createSubmap,
  createPlayer,
  createWorldObject,
  createWorldState
};
