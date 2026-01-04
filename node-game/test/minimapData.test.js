import {
  MINIMAP_ENTITY_TYPES,
  MINIMAP_VISIBILITY_RADIUS,
  buildMinimapSnapshot,
  buildPlayerEntry,
  buildWorldObjectEntry,
  getBounds,
  isWithinBounds,
  isWithinRadius,
  matchesLocation,
  normalizeRadius,
  resolveBoundsForPlayer
} from "../src/world/minimap.js";
import { createWorldState } from "../src/world/worldState.js";

describe("minimap snapshot", () => {
  test("normalizeRadius handles invalid and negative inputs", () => {
    expect(normalizeRadius(Number.NaN)).toBe(MINIMAP_VISIBILITY_RADIUS);
    expect(normalizeRadius(-4)).toBe(0);
    expect(normalizeRadius(5)).toBe(5);
  });

  test("builds entries within bounds and radius on world map", () => {
    const worldState = {
      worldMap: { id: "realm", width: 10, height: 10 },
      submaps: [],
      players: [
        {
          id: "hero",
          name: "Hero",
          isNpc: false,
          location: { mapId: "realm", submapId: null },
          position: { x: 0, y: 0 }
        },
        {
          id: "scout",
          name: "Scout",
          isNpc: true,
          location: { mapId: "realm", submapId: null },
          position: { x: 2, y: 0 }
        },
        {
          id: "wanderer",
          name: "Wanderer",
          isNpc: false,
          location: { mapId: "realm", submapId: null },
          position: { x: 9, y: 9 }
        }
      ],
      worldObjects: [
        {
          id: "altar",
          name: "Altar",
          objectType: "altar",
          location: { mapId: "realm", submapId: null },
          position: { x: 1, y: 1 }
        },
        {
          id: "far-object",
          name: "Far Object",
          objectType: "shrine",
          location: { mapId: "realm", submapId: null },
          position: { x: 8, y: 8 }
        }
      ]
    };

    const snapshot = buildMinimapSnapshot({ worldState, playerId: "hero", radius: 2 });

    expect(snapshot.center).toEqual({ x: 0, y: 0 });
    expect(snapshot.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "hero", type: MINIMAP_ENTITY_TYPES.SELF }),
        expect.objectContaining({ id: "scout", type: MINIMAP_ENTITY_TYPES.NPC }),
        expect.objectContaining({ id: "altar", type: MINIMAP_ENTITY_TYPES.WORLD_OBJECT })
      ])
    );
    expect(snapshot.entries.find((entry) => entry.id === "wanderer")).toBeUndefined();
    expect(snapshot.entries.find((entry) => entry.id === "far-object")).toBeUndefined();
  });

  test("includes only entries at the center when radius is zero", () => {
    const worldState = {
      worldMap: { id: "realm", width: 5, height: 5 },
      submaps: [],
      players: [
        {
          id: "hero",
          name: "Hero",
          isNpc: false,
          location: { mapId: "realm", submapId: null },
          position: { x: 2, y: 2 }
        },
        {
          id: "ally",
          name: "Ally",
          isNpc: false,
          location: { mapId: "realm", submapId: null },
          position: { x: 3, y: 2 }
        }
      ],
      worldObjects: [
        {
          id: "altar",
          name: "Altar",
          objectType: "altar",
          location: { mapId: "realm", submapId: null },
          position: { x: 2, y: 2 }
        }
      ]
    };

    const snapshot = buildMinimapSnapshot({ worldState, playerId: "hero", radius: 0 });

    expect(snapshot.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "hero", type: MINIMAP_ENTITY_TYPES.SELF }),
        expect.objectContaining({ id: "altar", type: MINIMAP_ENTITY_TYPES.WORLD_OBJECT })
      ])
    );
    expect(snapshot.entries.find((entry) => entry.id === "ally")).toBeUndefined();
  });

  test("filters to submap and includes submap bounds", () => {
    const worldState = {
      worldMap: { id: "realm", width: 30, height: 30 },
      submaps: [{ id: "cave", parentMapId: "realm", width: 6, height: 6 }],
      players: [
        {
          id: "hero",
          name: "Hero",
          isNpc: false,
          location: { mapId: "realm", submapId: "cave" },
          position: { x: 5, y: 5 }
        },
        {
          id: "guardian",
          name: "Guardian",
          isNpc: true,
          location: { mapId: "realm", submapId: "cave" },
          position: { x: 5, y: 4 }
        },
        {
          id: "surface",
          name: "Surface",
          isNpc: true,
          location: { mapId: "realm", submapId: null },
          position: { x: 5, y: 4 }
        }
      ],
      worldObjects: [
        {
          id: "torch",
          name: "Torch",
          objectType: "torch",
          location: { mapId: "realm", submapId: "cave" },
          position: { x: 4, y: 5 }
        }
      ]
    };

    const snapshot = buildMinimapSnapshot({ worldState, playerId: "hero", radius: 10 });

    expect(snapshot.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "guardian", type: MINIMAP_ENTITY_TYPES.NPC }),
        expect.objectContaining({ id: "torch", type: MINIMAP_ENTITY_TYPES.WORLD_OBJECT })
      ])
    );
    expect(snapshot.entries.find((entry) => entry.id === "surface")).toBeUndefined();
  });

  test("throws when player is missing", () => {
    const worldState = createWorldState({ playerId: "hero", playerName: "Hero" });
    expect(() => buildMinimapSnapshot({ worldState, playerId: "missing", radius: 2 })).toThrow(
      "Player not found."
    );
  });

  test("throws when world state is missing", () => {
    expect(() => buildMinimapSnapshot({ worldState: null, playerId: "hero", radius: 2 })).toThrow(
      "World state is required."
    );
  });

  test("throws when submap is missing", () => {
    const worldState = createWorldState({ playerId: "hero", playerName: "Hero" });
    worldState.players[0].location.submapId = "unknown";
    expect(() => buildMinimapSnapshot({ worldState, playerId: "hero", radius: 2 })).toThrow(
      "Submap not found."
    );
  });
});

describe("minimap helpers", () => {
  test("buildPlayerEntry captures NPC and player types", () => {
    const npcEntry = buildPlayerEntry(
      { id: "npc", name: "NPC", isNpc: true, position: { x: 1, y: 2 } },
      false
    );
    const playerEntry = buildPlayerEntry(
      { id: "player", name: "Player", isNpc: false, position: { x: 3, y: 4 } },
      false
    );
    const selfEntry = buildPlayerEntry(
      { id: "self", name: "Self", isNpc: false, position: { x: 0, y: 0 } },
      true
    );

    expect(npcEntry.type).toBe(MINIMAP_ENTITY_TYPES.NPC);
    expect(playerEntry.type).toBe(MINIMAP_ENTITY_TYPES.PLAYER);
    expect(selfEntry.type).toBe(MINIMAP_ENTITY_TYPES.SELF);
  });

  test("buildWorldObjectEntry maps object fields", () => {
    const entry = buildWorldObjectEntry({
      id: "object",
      name: "Object",
      position: { x: 2, y: 3 }
    });
    expect(entry).toEqual({
      id: "object",
      type: MINIMAP_ENTITY_TYPES.WORLD_OBJECT,
      x: 2,
      y: 3,
      label: "Object"
    });
  });

  test("getBounds clamps to zero when map size is missing", () => {
    const bounds = getBounds({ centerX: 4, centerY: 4, radius: 3, maxX: -1, maxY: -2 });
    const missingBounds = getBounds({
      centerX: 4,
      centerY: 4,
      radius: 3,
      maxX: Number.NaN,
      maxY: undefined
    });
    expect(bounds).toEqual({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
    expect(missingBounds).toEqual({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
  });

  test("bounds and radius checks handle inclusive edges", () => {
    expect(isWithinBounds({ x: 1, y: 1, minX: 1, maxX: 3, minY: 1, maxY: 3 })).toBe(true);
    expect(isWithinBounds({ x: 0, y: 2, minX: 1, maxX: 3, minY: 1, maxY: 3 })).toBe(false);
    expect(isWithinRadius({ x: 3, y: 4, centerX: 0, centerY: 0, radius: 5 })).toBe(true);
    expect(isWithinRadius({ x: 4, y: 4, centerX: 0, centerY: 0, radius: 5 })).toBe(false);
  });

  test("matchesLocation compares submap values", () => {
    expect(
      matchesLocation(
        { mapId: "realm", submapId: null },
        { mapId: "realm", submapId: null }
      )
    ).toBe(true);
    expect(
      matchesLocation(
        { mapId: "realm", submapId: "cave" },
        { mapId: "realm", submapId: null }
      )
    ).toBe(false);
  });

  test("resolveBoundsForPlayer uses map or submap", () => {
    const worldState = {
      worldMap: { id: "realm", width: 12, height: 12 },
      submaps: [{ id: "cave", parentMapId: "realm", width: 5, height: 6 }]
    };
    const worldBounds = resolveBoundsForPlayer(worldState, {
      location: { mapId: "realm", submapId: null }
    });
    const submapBounds = resolveBoundsForPlayer(worldState, {
      location: { mapId: "realm", submapId: "cave" }
    });

    expect(worldBounds).toEqual({ maxX: 11, maxY: 11 });
    expect(submapBounds).toEqual({ maxX: 4, maxY: 5 });
  });
});
