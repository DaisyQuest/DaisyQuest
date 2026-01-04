import { NPCS } from "../src/battle.js";
import { createWorldState } from "../src/world/worldState.js";

describe("world state", () => {
  test("spawns the player near hostile combat NPCs", () => {
    const world = createWorldState({ playerId: "hero", playerName: "Hero" });
    const player = world.players.find((entry) => entry.id === "hero");
    expect(player).toBeDefined();
    const hostiles = world.players.filter((entry) => entry.isNpc && entry.isHostile);
    expect(hostiles.length).toBeGreaterThan(0);
    hostiles.forEach((npc) => {
      const dx = Math.abs(npc.position.x - player.position.x);
      const dy = Math.abs(npc.position.y - player.position.y);
      expect(dx + dy).toBeLessThanOrEqual(4);
    });
  });

  test("includes combat-ready NPCs that align with battle profiles", () => {
    const world = createWorldState({ playerId: "hero", playerName: "Hero" });
    const hostileIds = world.players
      .filter((entry) => entry.isNpc && entry.isHostile)
      .map((entry) => entry.id);
    const npcIds = NPCS.map((npc) => npc.id);
    expect(hostileIds).toEqual(expect.arrayContaining(npcIds));
  });
});
