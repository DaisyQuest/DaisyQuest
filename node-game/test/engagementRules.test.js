import { DEFAULT_ENGAGE_RANGE, resolveEngagementStatus } from "../public/ui/engagementRules.js";

describe("engagement rules", () => {
  test("reports missing world state", () => {
    const result = resolveEngagementStatus({ world: null, playerId: "hero", targetId: "enemy" });
    expect(result.canEngage).toBe(false);
    expect(result.reason).toMatch(/World state is not ready/);
  });

  test("uses default parameters when called without arguments", () => {
    const result = resolveEngagementStatus();
    expect(result.range).toBe(DEFAULT_ENGAGE_RANGE);
    expect(result.reason).toMatch(/World state is not ready/);
  });

  test("reports missing player or target locations", () => {
    const world = { players: [{ id: "enemy", location: { mapId: "map", submapId: null }, position: { x: 1, y: 1 } }] };
    const missingPlayer = resolveEngagementStatus({ world, playerId: "hero", targetId: "enemy" });
    expect(missingPlayer.reason).toMatch(/Player location is unavailable/);

    const nonArrayPlayers = resolveEngagementStatus({
      world: { players: null },
      playerId: "hero",
      targetId: "enemy"
    });
    expect(nonArrayPlayers.reason).toMatch(/Player location is unavailable/);

    const missingTarget = resolveEngagementStatus({
      world: { players: [{ id: "hero", location: { mapId: "map", submapId: null }, position: { x: 0, y: 0 } }] },
      playerId: "hero",
      targetId: "enemy"
    });
    expect(missingTarget.reason).toMatch(/Target location is unavailable/);
  });

  test("rejects engagement when target is in another region", () => {
    const world = {
      players: [
        { id: "hero", name: "Hero", location: { mapId: "map", submapId: null }, position: { x: 0, y: 0 } },
        { id: "enemy", name: "Enemy", location: { mapId: "map", submapId: "cave" }, position: { x: 1, y: 1 } }
      ]
    };
    const result = resolveEngagementStatus({ world, playerId: "hero", targetId: "enemy" });
    expect(result.canEngage).toBe(false);
    expect(result.reason).toMatch(/another region/);

    const unnamedTarget = resolveEngagementStatus({
      world: {
        players: [
          { id: "hero", location: { mapId: "map", submapId: null }, position: { x: 0, y: 0 } },
          { id: "enemy", location: { mapId: "map", submapId: "cave" }, position: { x: 1, y: 1 } }
        ]
      },
      playerId: "hero",
      targetId: "enemy"
    });
    expect(unnamedTarget.reason).toMatch(/Target is in another region/);
  });

  test("calculates engagement distance and range checks", () => {
    const world = {
      players: [
        { id: "hero", location: { mapId: "map", submapId: null }, position: { x: 0, y: 0 } },
        { id: "enemy", name: "Enemy", location: { mapId: "map", submapId: null }, position: { x: 1, y: 1 } }
      ]
    };
    const inRange = resolveEngagementStatus({
      world,
      playerId: "hero",
      targetId: "enemy",
      range: DEFAULT_ENGAGE_RANGE
    });
    expect(inRange.canEngage).toBe(true);
    expect(inRange.distance).toBeCloseTo(Math.hypot(1, 1));

    const outOfRange = resolveEngagementStatus({
      world,
      playerId: "hero",
      targetId: "enemy",
      range: 1
    });
    expect(outOfRange.canEngage).toBe(false);
    expect(outOfRange.reason).toMatch(/Move within 1 tiles/);

    const unnamedOutOfRange = resolveEngagementStatus({
      world: {
        players: [
          { id: "hero", location: { mapId: "map", submapId: null }, position: { x: 0, y: 0 } },
          { id: "enemy", location: { mapId: "map", submapId: null }, position: { x: 3, y: 0 } }
        ]
      },
      playerId: "hero",
      targetId: "enemy",
      range: 2
    });
    expect(unnamedOutOfRange.reason).toMatch(/the target/);
  });

  test("handles non-finite distance values", () => {
    const world = {
      players: [
        { id: "hero", location: { mapId: "map", submapId: null }, position: { x: Number.NaN, y: 0 } },
        { id: "enemy", location: { mapId: "map", submapId: null }, position: { x: 1, y: 1 } }
      ]
    };
    const result = resolveEngagementStatus({ world, playerId: "hero", targetId: "enemy" });
    expect(result.canEngage).toBe(false);
    expect(result.reason).toMatch(/Distance could not be determined/);
  });
});
