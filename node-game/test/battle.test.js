import {
  ACTIONS,
  applyDamage,
  applyHeal,
  applyFocusCost,
  applyFocusGain,
  applyManaCost,
  calculateFocusGain,
  calculateDamage,
  clamp,
  createCombatant,
  DEFAULT_ENEMY,
  DEFAULT_PLAYER,
  getNpcById,
  isDefeated,
  NPCS,
  performAttack,
  performFocusStrike,
  performHeal,
  performSpecial,
  performTurn
} from "../src/battle.js";

const fixedRng = (value) => () => value;
const sequenceRng = (values) => {
  let index = 0;
  return () => values[index++ % values.length];
};

describe("battle helpers", () => {
  test("clamp bounds values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(50, 0, 10)).toBe(10);
  });

  test("createCombatant normalizes health and mana", () => {
    const combatant = createCombatant({ health: 999, mana: -5 });
    expect(combatant.health).toBe(combatant.maxHealth);
    expect(combatant.mana).toBe(0);
  });

  test("createCombatant clamps focus when present", () => {
    const combatant = createCombatant({ isEnemy: true, focus: 999, maxFocus: 50 });
    expect(combatant.focus).toBe(50);
  });

  test("createCombatant assigns missing focus to zero", () => {
    const combatant = createCombatant({ isEnemy: true, maxFocus: 50 });
    expect(combatant.focus).toBe(0);
  });

  test("createCombatant uses default values when omitted", () => {
    const combatant = createCombatant();
    expect(combatant.name).toBe(DEFAULT_PLAYER.name);
  });

  test("createCombatant initializes focus for non-enemy with focus cap", () => {
    const combatant = createCombatant({ maxFocus: 50 });
    expect(combatant.focus).toBe(0);
  });

  test("getNpcById returns a matching NPC", () => {
    const npc = getNpcById(NPCS[0].id);
    expect(npc.name).toBe(NPCS[0].name);
  });

  test("getNpcById falls back to default enemy when id is missing", () => {
    const npc = getNpcById();
    expect(npc.name).toBe(DEFAULT_ENEMY.name);
  });

  test("getNpcById falls back to default enemy when id is unknown", () => {
    const npc = getNpcById("unknown-npc");
    expect(npc).toBe(DEFAULT_ENEMY);
  });

  test("calculateDamage respects crits", () => {
    const attacker = { ...DEFAULT_PLAYER, critChance: 1, critMultiplier: 2 };
    const defender = { ...DEFAULT_ENEMY, defense: 0 };
    const { damage, isCrit } = calculateDamage(attacker, defender, fixedRng(0));
    expect(isCrit).toBe(true);
    expect(damage).toBeGreaterThan(0);
  });

  test("calculateDamage uses default rng when omitted", () => {
    const attacker = { ...DEFAULT_PLAYER, critChance: 0, attack: 5 };
    const defender = { ...DEFAULT_ENEMY, defense: 0 };
    const { damage, isCrit } = calculateDamage(attacker, defender);
    expect(isCrit).toBe(false);
    expect(damage).toBe(5);
  });

  test("applyDamage cannot drop below zero", () => {
    const defender = { ...DEFAULT_ENEMY, health: 5 };
    const updated = applyDamage(defender, 999);
    expect(updated.health).toBe(0);
  });

  test("applyHeal cannot exceed max", () => {
    const target = { ...DEFAULT_PLAYER, health: 110 };
    const updated = applyHeal(target, 50);
    expect(updated.health).toBe(updated.maxHealth);
  });

  test("applyManaCost cannot drop below zero", () => {
    const caster = { ...DEFAULT_PLAYER, mana: 5 };
    const updated = applyManaCost(caster, 20);
    expect(updated.mana).toBe(0);
  });

  test("applyFocusGain increases focus within bounds", () => {
    const enemy = { ...DEFAULT_ENEMY, focus: 10, maxFocus: 30 };
    const updated = applyFocusGain(enemy, 50);
    expect(updated.focus).toBe(30);
  });

  test("applyFocusGain handles missing focus value", () => {
    const enemy = { ...DEFAULT_ENEMY, maxFocus: 30 };
    delete enemy.focus;
    const updated = applyFocusGain(enemy, 10);
    expect(updated.focus).toBe(10);
  });

  test("applyFocusGain ignores combatants without focus", () => {
    const combatant = { ...DEFAULT_PLAYER };
    expect(applyFocusGain(combatant, 10)).toBe(combatant);
  });

  test("applyFocusCost cannot drop below zero", () => {
    const enemy = { ...DEFAULT_ENEMY, focus: 5, maxFocus: 20 };
    const updated = applyFocusCost(enemy, 12);
    expect(updated.focus).toBe(0);
  });

  test("applyFocusCost handles missing focus value", () => {
    const enemy = { ...DEFAULT_ENEMY, maxFocus: 20 };
    delete enemy.focus;
    const updated = applyFocusCost(enemy, 5);
    expect(updated.focus).toBe(0);
  });

  test("applyFocusCost ignores combatants without focus", () => {
    const combatant = { ...DEFAULT_PLAYER };
    expect(applyFocusCost(combatant, 10)).toBe(combatant);
  });

  test("calculateFocusGain scales with damage for attacks", () => {
    expect(calculateFocusGain({ action: ACTIONS.ATTACK, damage: 5 })).toBe(9);
    expect(calculateFocusGain({ action: ACTIONS.SPECIAL, damage: 200 })).toBe(30);
  });

  test("calculateFocusGain handles healing and hesitation", () => {
    expect(calculateFocusGain({ action: ACTIONS.HEAL, damage: 0 })).toBe(12);
    expect(calculateFocusGain({ action: "unknown", damage: 0 })).toBe(6);
  });

  test("calculateFocusGain uses default damage value", () => {
    expect(calculateFocusGain({ action: ACTIONS.ATTACK })).toBe(8);
  });

  test("performAttack reduces defender health and logs", () => {
    const attacker = { ...DEFAULT_PLAYER, attack: 20, defense: 0 };
    const defender = { ...DEFAULT_ENEMY, defense: 0, health: 50 };
    const result = performAttack(attacker, defender, fixedRng(1));
    expect(result.defender.health).toBeLessThan(defender.health);
    expect(result.log).toContain(attacker.name);
    expect(result.damage).toBeGreaterThan(0);
  });

  test("performAttack logs critical hits", () => {
    const attacker = { ...DEFAULT_PLAYER, critChance: 1 };
    const defender = { ...DEFAULT_ENEMY, defense: 0 };
    const result = performAttack(attacker, defender, fixedRng(0));
    expect(result.isCrit).toBe(true);
    expect(result.log).toContain("critical");
  });

  test("performSpecial fails when mana is low", () => {
    const attacker = { ...DEFAULT_PLAYER, mana: 0 };
    const defender = { ...DEFAULT_ENEMY };
    const result = performSpecial(attacker, defender, fixedRng(1));
    expect(result.failed).toBe(true);
    expect(result.defender).toEqual(defender);
    expect(result.damage).toBe(0);
  });

  test("performSpecial consumes mana and damages", () => {
    const attacker = { ...DEFAULT_PLAYER, mana: 40, attack: 10 };
    const defender = { ...DEFAULT_ENEMY, defense: 0, health: 40 };
    const result = performSpecial(attacker, defender, fixedRng(1));
    expect(result.attacker.mana).toBeLessThan(attacker.mana);
    expect(result.defender.health).toBeLessThan(defender.health);
    expect(result.damage).toBeGreaterThan(0);
  });

  test("performSpecial logs critical hits", () => {
    const attacker = { ...DEFAULT_PLAYER, mana: 40, critChance: 1, attack: 12 };
    const defender = { ...DEFAULT_ENEMY, defense: 0 };
    const result = performSpecial(attacker, defender, fixedRng(0));
    expect(result.isCrit).toBe(true);
    expect(result.log).toContain("critical");
  });

  test("performHeal restores health when mana is available", () => {
    const combatant = { ...DEFAULT_PLAYER, health: 50, mana: 20 };
    const result = performHeal(combatant);
    expect(result.combatant.health).toBeGreaterThan(combatant.health);
    expect(result.combatant.mana).toBeLessThan(combatant.mana);
    expect(result.healed).toBeGreaterThan(0);
  });

  test("performHeal fails without mana", () => {
    const combatant = { ...DEFAULT_PLAYER, mana: 0 };
    const result = performHeal(combatant);
    expect(result.failed).toBe(true);
    expect(result.combatant).toEqual(combatant);
    expect(result.healed).toBe(0);
  });

  test("performFocusStrike fails without focus", () => {
    const attacker = { ...DEFAULT_ENEMY, focus: 0, maxFocus: 60 };
    const defender = { ...DEFAULT_PLAYER };
    const result = performFocusStrike(attacker, defender, fixedRng(1));
    expect(result.failed).toBe(true);
    expect(result.damage).toBe(0);
    expect(result.defender).toEqual(defender);
  });

  test("performFocusStrike fails when focus is missing", () => {
    const attacker = { ...DEFAULT_ENEMY, maxFocus: 60 };
    delete attacker.focus;
    const defender = { ...DEFAULT_PLAYER };
    const result = performFocusStrike(attacker, defender, fixedRng(1));
    expect(result.failed).toBe(true);
    expect(result.damage).toBe(0);
  });

  test("performFocusStrike consumes focus and damages", () => {
    const attacker = { ...DEFAULT_ENEMY, focus: 60, maxFocus: 60, attack: 12 };
    const defender = { ...DEFAULT_PLAYER, defense: 0, health: 80 };
    const result = performFocusStrike(attacker, defender, fixedRng(1));
    expect(result.attacker.focus).toBeLessThan(attacker.focus);
    expect(result.defender.health).toBeLessThan(defender.health);
    expect(result.damage).toBeGreaterThan(0);
  });

  test("performFocusStrike logs critical hits", () => {
    const attacker = { ...DEFAULT_ENEMY, focus: 60, maxFocus: 60, critChance: 1 };
    const defender = { ...DEFAULT_PLAYER, defense: 0 };
    const result = performFocusStrike(attacker, defender, fixedRng(0));
    expect(result.isCrit).toBe(true);
    expect(result.log).toContain("critical");
  });

  test("isDefeated returns true at zero health", () => {
    expect(isDefeated({ health: 0 })).toBe(true);
  });
});

describe("battle flow", () => {
  test("performTurn handles attack flow and enemy response", () => {
    const player = { ...DEFAULT_PLAYER, attack: 25 };
    const enemy = { ...DEFAULT_ENEMY, defense: 0 };
    const result = performTurn({ player, enemy, action: ACTIONS.ATTACK, rng: fixedRng(1) });
    expect(result.log.length).toBe(2);
    expect(result.enemy.health).toBeLessThan(enemy.health);
  });

  test("performTurn handles player special action", () => {
    const player = { ...DEFAULT_PLAYER, mana: 40, attack: 18 };
    const enemy = { ...DEFAULT_ENEMY, defense: 0, health: 120 };
    const result = performTurn({ player, enemy, action: ACTIONS.SPECIAL, rng: fixedRng(1) });
    expect(result.log[0]).toContain("channels power");
    expect(result.enemy.health).toBeLessThan(enemy.health);
  });

  test("performTurn uses default rng when not supplied", () => {
    const player = { ...DEFAULT_PLAYER, attack: 200, critChance: 0 };
    const enemy = { ...DEFAULT_ENEMY, defense: 0, health: 10 };
    const result = performTurn({ player, enemy, action: ACTIONS.ATTACK });
    expect(result.log[result.log.length - 1]).toContain("Victory");
  });

  test("performTurn resolves player victory", () => {
    const player = { ...DEFAULT_PLAYER, attack: 200 };
    const enemy = { ...DEFAULT_ENEMY, health: 10, defense: 0 };
    const result = performTurn({ player, enemy, action: ACTIONS.ATTACK, rng: fixedRng(1) });
    expect(result.log[result.log.length - 1]).toContain("Victory");
    expect(result.enemy.health).toBe(0);
  });

  test("performTurn awards loot on victory", () => {
    const player = { ...DEFAULT_PLAYER, attack: 250 };
    const enemyTemplate = getNpcById("ember_wyrmling");
    const enemy = createCombatant({ ...enemyTemplate, isEnemy: true, health: 5, defense: 0 });
    const rng = sequenceRng([1, 0.1, 0, 0.1]);
    const result = performTurn({ player, enemy, action: ACTIONS.ATTACK, rng });
    expect(result.loot).toEqual([
      { itemId: "ember_scale", quantity: 1 },
      { itemId: "wyrmling_helm", quantity: 1 }
    ]);
  });

  test("performTurn resolves player defeat", () => {
    const player = { ...DEFAULT_PLAYER, health: 10 };
    const enemy = { ...DEFAULT_ENEMY, attack: 50, defense: 0 };
    const result = performTurn({ player, enemy, action: ACTIONS.HEAL, rng: fixedRng(1) });
    expect(result.player.health).toBe(0);
    expect(result.log[result.log.length - 1]).toContain("Defeat");
  });

  test("performTurn handles unknown action", () => {
    const player = { ...DEFAULT_PLAYER };
    const enemy = { ...DEFAULT_ENEMY };
    const result = performTurn({ player, enemy, action: "unknown", rng: fixedRng(1) });
    expect(result.log[0]).toContain("hesitates");
  });

  test("performTurn skips focus gain without focus meter", () => {
    const player = { ...DEFAULT_PLAYER };
    const enemy = { ...DEFAULT_ENEMY };
    delete enemy.maxFocus;
    delete enemy.focus;
    const result = performTurn({ player, enemy, action: ACTIONS.ATTACK, rng: fixedRng(1) });
    expect(result.enemy.focus).toBeUndefined();
  });

  test("performTurn initializes missing focus before gain", () => {
    const player = { ...DEFAULT_PLAYER, attack: 20 };
    const enemy = { ...DEFAULT_ENEMY, maxFocus: 60 };
    delete enemy.focus;
    const result = performTurn({ player, enemy, action: ACTIONS.ATTACK, rng: fixedRng(1) });
    expect(result.enemy.focus).toBeGreaterThan(0);
  });

  test("performTurn raises enemy focus after player action", () => {
    const player = { ...DEFAULT_PLAYER, attack: 25 };
    const enemy = { ...DEFAULT_ENEMY, focus: 0, maxFocus: 60, defense: 0 };
    const result = performTurn({ player, enemy, action: ACTIONS.ATTACK, rng: fixedRng(1) });
    expect(result.enemy.focus).toBeGreaterThan(0);
  });

  test("performTurn triggers enemy focus strike when focus is high enough", () => {
    const player = { ...DEFAULT_PLAYER, health: 120 };
    const enemy = { ...DEFAULT_ENEMY, focus: 48, maxFocus: 60, attack: 20, defense: 0 };
    const rng = fixedRng(1);
    const result = performTurn({ player, enemy, action: ACTIONS.ATTACK, rng });
    expect(result.log.some((entry) => entry.includes("focused strike"))).toBe(true);
    expect(result.enemy.focus).toBeLessThan(enemy.focus + 10);
  });

  test("enemy special attack triggers when mana and rng allow", () => {
    const player = { ...DEFAULT_PLAYER };
    const enemy = { ...DEFAULT_ENEMY, mana: 20, maxMana: 20 };
    const rngSequence = [0.2, 0.2, 0.2];
    let index = 0;
    const rng = () => rngSequence[index++ % rngSequence.length];
    const result = performTurn({ player, enemy, action: ACTIONS.ATTACK, rng });
    expect(result.log.some((entry) => entry.includes("channels power"))).toBe(true);
  });
});
