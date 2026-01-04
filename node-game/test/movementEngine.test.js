import { createWorldState } from "../src/world/worldState.js";
import {
  applyWorldMovement,
  getMapBoundsForLocation,
  moveOtherPlayers,
  movePlayerToTarget,
  normalizePercent,
  resolveTargetPosition,
  stepTowardsTarget
} from "../src/world/movementEngine.js";

describe("movement engine", () => {
  test("validates inputs and resolves bounds", () => {
    const world = createWorldState({ playerId: "hero", playerName: "Hero" });
    const player = world.players.find((entry) => entry.id === "hero");

    expect(getMapBoundsForLocation(null, player.location).error).toBe("World map is required.");
    expect(getMapBoundsForLocation(world, null).error).toBe("Location is required.");
    expect(
      getMapBoundsForLocation(world, { mapId: "ember-realm", submapId: "missing" }).error
    ).toBe("Submap not found.");
  });

  test("normalizes percent inputs and target positions", () => {
    const world = createWorldState({ playerId: "hero", playerName: "Hero" });
    const bounds = getMapBoundsForLocation(world, { mapId: "ember-realm", submapId: null });

    expect(normalizePercent(50)).toBeCloseTo(0.5, 2);
    expect(normalizePercent(0.25)).toBeCloseTo(0.25, 2);
    expect(normalizePercent("bad")).toBeNull();

    const resolved = resolveTargetPosition({ xPercent: 0.5, yPercent: 0.5 }, bounds);
    expect(resolved.position).toEqual({ x: 20, y: 20 });

    const resolvedCoords = resolveTargetPosition({ x: 200, y: -5 }, bounds);
    expect(resolvedCoords.position).toEqual({ x: bounds.maxX, y: 0 });
  });

  test("steps toward targets with diagonal and non-diagonal rules", () => {
    const diagonal = stepTowardsTarget({
      from: { x: 10, y: 10 },
      to: { x: 20, y: 20 },
      maxStep: 3,
      allowDiagonal: true
    });
    expect(diagonal.next).toEqual({ x: 13, y: 13 });

    const orthogonal = stepTowardsTarget({
      from: { x: 10, y: 10 },
      to: { x: 20, y: 12 },
      maxStep: 2,
      allowDiagonal: false
    });
    expect(orthogonal.next).toEqual({ x: 12, y: 10 });

    const vertical = stepTowardsTarget({
      from: { x: 10, y: 10 },
      to: { x: 12, y: 20 },
      maxStep: 2,
      allowDiagonal: false
    });
    expect(vertical.next).toEqual({ x: 10, y: 12 });

    const idle = stepTowardsTarget({
      from: { x: 5, y: 5 },
      to: { x: 5, y: 5 },
      maxStep: 2,
      allowDiagonal: true
    });
    expect(idle.next).toEqual({ x: 5, y: 5 });
    expect(idle.delta).toEqual({ x: 0, y: 0 });
  });

  test("moves the active player and reports movement metadata", () => {
    const world = createWorldState({ playerId: "hero", playerName: "Hero" });
    const result = movePlayerToTarget({
      worldState: world,
      playerId: "hero",
      target: { xPercent: 0, yPercent: 0 },
      rules: { maxStep: 5 }
    });

    expect(result.error).toBeUndefined();
    expect(result.movement.from).toEqual({ x: 20, y: 20 });
    expect(result.movement.to).toEqual({ x: 15, y: 15 });
    expect(result.movement.moved).toBe(true);
  });

  test("rejects invalid movement requests and respects zero-step rules", () => {
    const world = createWorldState({ playerId: "hero", playerName: "Hero" });

    expect(movePlayerToTarget().error).toBe("World state is required.");
    expect(movePlayerToTarget({ worldState: world }).error).toBe("Player id is required.");
    expect(
      movePlayerToTarget({ worldState: world, playerId: "hero", target: { x: "bad" } }).error
    ).toBe("Movement target must include coordinates.");

    const noMove = movePlayerToTarget({
      worldState: world,
      playerId: "hero",
      target: { x: 25, y: 20 },
      rules: { maxStep: 0 }
    });
    expect(noMove.movement.moved).toBe(false);
    expect(noMove.movement.to).toEqual(noMove.movement.from);
  });

  test("returns bounds errors when a player references a missing submap", () => {
    const world = createWorldState({ playerId: "hero", playerName: "Hero" });
    const brokenWorld = {
      ...world,
      players: world.players.map((player) =>
        player.id === "hero"
          ? { ...player, location: { mapId: player.location.mapId, submapId: "missing" } }
          : player
      )
    };

    const result = movePlayerToTarget({
      worldState: brokenWorld,
      playerId: "hero",
      target: { x: 10, y: 10 }
    });
    expect(result.error).toBe("Submap not found.");
  });

  test("fails when the active player cannot be found", () => {
    const world = createWorldState({ playerId: "hero", playerName: "Hero" });
    const result = movePlayerToTarget({
      worldState: world,
      playerId: "missing",
      target: { x: 10, y: 10 }
    });
    expect(result.error).toBe("Player not found.");
  });

  test("applies other player movement and skips missing world state", () => {
    const world = createWorldState({ playerId: "hero", playerName: "Hero" });
    expect(moveOtherPlayers({ worldState: null }).error).toBe("World state is required.");
    expect(moveOtherPlayers({ worldState: { players: [] } }).error).toBe("World map is required.");

    const result = moveOtherPlayers({
      worldState: world,
      playerId: "hero",
      rng: () => 0.6,
      rules: { idleChance: 0, otherPlayerStep: 1 }
    });
    expect(result.movements.length).toBeGreaterThan(0);
    const moved = result.movements.some((movement) => movement.moved);
    expect(moved).toBe(true);
  });

  test("allows other players to idle when idle chance triggers", () => {
    const world = createWorldState({ playerId: "hero", playerName: "Hero" });
    const result = moveOtherPlayers({
      worldState: world,
      playerId: "hero",
      rng: () => 0,
      rules: { idleChance: 1, otherPlayerStep: 2 }
    });
    const moved = result.movements.some((movement) => movement.moved);
    expect(moved).toBe(false);
  });

  test("skips moving players with invalid locations", () => {
    const world = createWorldState({ playerId: "hero", playerName: "Hero" });
    const brokenWorld = {
      ...world,
      players: [
        ...world.players,
        {
          id: "lost",
          name: "Lost",
          location: { mapId: "ember-realm", submapId: "missing" },
          position: { x: 1, y: 1 }
        }
      ]
    };

    const result = moveOtherPlayers({
      worldState: brokenWorld,
      playerId: "hero",
      rng: () => 0.4,
      rules: { idleChance: 0 }
    });
    expect(result.movements.some((movement) => movement.id === "lost")).toBe(false);
  });

  test("ignores null player entries while moving others", () => {
    const world = createWorldState({ playerId: "hero", playerName: "Hero" });
    const brokenWorld = { ...world, players: [null, ...world.players] };
    const result = moveOtherPlayers({
      worldState: brokenWorld,
      playerId: "hero",
      rng: () => 0.3,
      rules: { idleChance: 0 }
    });
    expect(result.worldState.players[0]).toBeNull();
    expect(result.movements.length).toBeGreaterThan(0);
  });

  test("applies full movement updates with errors when missing target", () => {
    const world = createWorldState({ playerId: "hero", playerName: "Hero" });
    expect(applyWorldMovement({ worldState: world, playerId: "hero" }).error).toBe(
      "Movement target is required."
    );

    const result = applyWorldMovement({
      worldState: world,
      playerId: "hero",
      target: { x: 20, y: 18 },
      rng: () => 0.8,
      rules: { maxStep: 2, idleChance: 0 }
    });
    expect(result.movement.to).toEqual({ x: 20, y: 18 });
    expect(result.otherMovements.length).toBeGreaterThan(0);
  });
});
