import { createGameSession, REWARD_MILESTONES } from "../src/server/gameSession.js";

describe("game session", () => {
  const rng = () => 0;

  test("builds initial snapshots and config", () => {
    const session = createGameSession({ username: "hero", nowFn: () => 1000, rng });
    const snapshot = session.getSnapshot();
    const config = session.getConfig();

    expect(snapshot.state.player.name).toBe("Hero");
    expect(snapshot.state.enemy.name).toBe(config.npcs[0].name);
    expect(snapshot.timers.globalCooldownUntil).toBe(0);
    expect(config.rewardMilestones).toEqual(REWARD_MILESTONES);
  });

  test("creates default sessions without options", () => {
    const session = createGameSession();
    expect(session.getSnapshot().state.player.name).toBe("Hero");
  });

  test("resets battles and schedules enemy action", () => {
    let now = 5000;
    const session = createGameSession({ username: "hero", nowFn: () => now, rng });
    const reset = session.resetBattle("ember_wyrmling");

    expect(reset.state.enemy.name).toBe("Ember Wyrmling");
    expect(reset.timers.enemyNextActionAt).toBeGreaterThan(now);
    expect(reset.log[0]).toMatch("Ember Wyrmling");
  });

  test("validates combat actions and cooldowns", () => {
    let now = 1000;
    const session = createGameSession({ username: "hero", nowFn: () => now, rng });

    expect(session.attemptAction("unknown").error).toBe("Unknown action.");

    const first = session.attemptAction("attack");
    expect(first.error).toBeUndefined();

    const onCooldown = session.attemptAction("attack");
    expect(onCooldown.error).toBe("Action is recharging.");

    session.unsafeSetTimers({ actionCooldowns: { attack: 0 }, globalCooldownUntil: now + 5000 });
    const globalCooldown = session.attemptAction("attack");
    expect(globalCooldown.error).toBe("Global cooldown active.");

    session.unsafeSetTimers({ actionCooldowns: {}, globalCooldownUntil: 0 });
    const defaultCooldown = session.attemptAction("attack");
    expect(defaultCooldown.error).toBeUndefined();

    session.unsafeSetState({ enemy: { ...session.getSnapshot().state.enemy, health: 0 } });
    expect(session.attemptAction("attack").error).toBe("Combat has concluded.");
  });

  test("resolves victory rewards and loot", () => {
    let now = 2000;
    const session = createGameSession({ username: "hero", nowFn: () => now, rng });
    const snapshot = session.getSnapshot();
    session.unsafeSetState({
      enemy: { ...snapshot.state.enemy, id: "ember_wyrmling", health: 1, maxHealth: 110 }
    });

    const result = session.attemptAction("attack");
    expect(result.log.join(" ")).toMatch("Victory");
    expect(result.loot.length).toBeGreaterThan(0);
    expect(result.state.progression.totalXp).toBeGreaterThan(0);
  });

  test("processes enemy ticks and defeat", () => {
    let now = 3000;
    const session = createGameSession({ username: "hero", nowFn: () => now, rng });
    session.unsafeSetTimers({ enemyNextActionAt: 0 });
    const idle = session.processEnemyTick();
    expect(idle.log).toEqual([]);

    session.unsafeSetTimers({ enemyNextActionAt: now - 1 });
    session.unsafeSetState({ enemy: { ...session.getSnapshot().state.enemy, health: 0 } });
    const concluded = session.processEnemyTick();
    expect(concluded.log).toEqual([]);

    session.unsafeSetState({ enemy: { ...session.getSnapshot().state.enemy, health: 110 } });
    session.unsafeSetState({ player: { ...session.getSnapshot().state.player, health: 1 } });
    session.unsafeSetTimers({ enemyNextActionAt: now - 1 });
    const result = session.processEnemyTick();
    expect(result.log.join(" ")).toMatch("Defeat");
    expect(result.timers.enemyNextActionAt).toBe(0);

    session.unsafeSetState({ player: { ...session.getSnapshot().state.player, health: 120 } });
    session.unsafeSetState({ enemy: { ...session.getSnapshot().state.enemy, health: 110 } });
    session.unsafeSetTimers({ enemyNextActionAt: now - 1 });
    const active = session.processEnemyTick();
    expect(active.log.length).toBeGreaterThan(0);
    expect(active.timers.enemyNextActionAt).toBeGreaterThan(now);
  });

  test("crafts items and applies progression", () => {
    const session = createGameSession({ username: "hero", nowFn: () => 1000, rng });

    expect(session.craftItem().error).toBe("Recipe is required.");

    session.grantItem("ember_scale", 3);
    session.grantItem("moonsteel_ingot", 1);
    const crafted = session.craftItem("craft_wyrmling_helm");
    expect(crafted.log[0]).toMatch("Crafted");
    expect(crafted.state.inventory.wyrmling_helm).toBe(1);

    expect(session.craftItem("missing_recipe").error).toBe("Recipe not found.");

    session.grantItem("ember_scale", 3);
    session.grantItem("moonsteel_ingot", 1);
    session.unsafeSetState({ progression: { totalXp: "invalid" } });
    const progressionError = session.craftItem("craft_wyrmling_helm");
    expect(progressionError.log.join(" ")).toMatch("Invalid progression state");
  });

  test("equips, unequips, and claims rewards", () => {
    const session = createGameSession({ username: "hero", nowFn: () => 1000, rng });

    expect(session.equipItem().error).toBe("Item id is required.");
    expect(session.unequipItem("HEAD").error).toBe("No item equipped in that slot.");
    session.grantItem("unknown_item", 1);
    expect(session.equipItem("unknown_item").error).toBe("Item not found.");
    session.grantItem("wyrmling_helm", 1);
    const equipped = session.equipItem("wyrmling_helm");
    expect(equipped.state.equipment.HEAD).toBe("wyrmling_helm");
    expect(equipped.log[0]).toMatch("Wyrmling");

    expect(session.unequipItem().error).toBe("Equipment slot is required.");
    const unequipped = session.unequipItem("HEAD");
    expect(unequipped.state.equipment.HEAD).toBeUndefined();
    expect(unequipped.log[0]).toMatch("Unequipped");

    expect(session.claimReward().error).toBe("No reward available.");
    const reward = REWARD_MILESTONES[0];
    session.unsafeSetState({ pendingReward: reward, claimedRewards: new Set() });
    const claimed = session.claimReward();
    expect(claimed.state.pendingReward).toBeNull();
    expect(claimed.state.claimedRewards).toContain(reward.level);
  });

  test("awards xp and tracks milestones", () => {
    const session = createGameSession({ username: "hero", nowFn: () => 1000, rng });

    const idle = session.awardXp(0);
    expect(idle.log).toEqual([]);

    session.unsafeSetState({ progression: { totalXp: 119, level: 1 }, pendingReward: null });
    const milestone = session.awardXp(5);
    expect(milestone.state.pendingReward.level).toBe(2);

    session.unsafeSetState({ progression: { totalXp: 119, level: 1 }, pendingReward: null });
    session.unsafeSetState({ claimedRewards: new Set([2]) });
    const claimed = session.awardXp(5);
    expect(claimed.state.pendingReward).toBeNull();
  });

  test("handles victories without loot drops", () => {
    const session = createGameSession({ username: "hero", nowFn: () => 1000, rng: () => 1 });
    const snapshot = session.getSnapshot();
    session.unsafeSetState({ enemy: { ...snapshot.state.enemy, id: "ember_wyrmling", health: 1 } });
    const result = session.attemptAction("attack");
    expect(result.loot).toEqual([]);
  });

  test("updates registry entries and handles errors", () => {
    const session = createGameSession({ username: "hero", nowFn: () => 1000, rng });

    expect(session.updateItem().error).toBe("Item payload is required.");
    const addedItem = session.updateItem({
      id: "test_item",
      name: "Test Item",
      description: "Test",
      rarity: "COMMON",
      equippable: false
    });
    expect(addedItem.registry.items.some((item) => item.id === "test_item")).toBe(true);

    const updatedItem = session.updateItem({
      id: "test_item",
      name: "Test Item+",
      description: "Updated",
      rarity: "RARE",
      equippable: false
    });
    expect(updatedItem.item.name).toBe("Test Item+");

    expect(session.updateRecipe().error).toBe("Recipe payload is required.");
    const recipeError = session.updateRecipe({
      id: "bad_recipe",
      name: "Bad",
      resultItemId: "missing",
      ingredients: { missing: 1 }
    });
    expect(recipeError.error).toBe("Recipe result item must exist.");

    const addedRecipe = session.updateRecipe({
      id: "test_recipe",
      name: "Test Recipe",
      resultItemId: "test_item",
      ingredients: { test_item: 1 }
    });
    expect(addedRecipe.registry.recipes.some((recipe) => recipe.id === "test_recipe")).toBe(true);

    const updatedRecipe = session.updateRecipe({
      id: "test_recipe",
      name: "Test Recipe+",
      resultItemId: "test_item",
      ingredients: { test_item: 1 }
    });
    expect(updatedRecipe.recipe.name).toBe("Test Recipe+");
  });

  test("rejects invalid grants", () => {
    const session = createGameSession({ username: "hero", nowFn: () => 1000, rng });

    expect(session.grantItem().error).toBe("Invalid grant request.");
  });
});
