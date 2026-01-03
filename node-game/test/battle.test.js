import {
  ACTIONS,
  applyDamage,
  applyHeal,
  applyManaCost,
  calculateDamage,
  clamp,
  createCombatant,
  DEFAULT_ENEMY,
  DEFAULT_PLAYER,
  isDefeated,
  performAttack,
  performHeal,
  performSpecial,
  performTurn
} from "../src/battle.js";

const fixedRng = (value) => () => value;

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

  test("calculateDamage respects crits", () => {
    const attacker = { ...DEFAULT_PLAYER, critChance: 1, critMultiplier: 2 };
    const defender = { ...DEFAULT_ENEMY, defense: 0 };
    const { damage, isCrit } = calculateDamage(attacker, defender, fixedRng(0));
    expect(isCrit).toBe(true);
    expect(damage).toBeGreaterThan(0);
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

  test("performAttack reduces defender health and logs", () => {
    const attacker = { ...DEFAULT_PLAYER, attack: 20, defense: 0 };
    const defender = { ...DEFAULT_ENEMY, defense: 0, health: 50 };
    const result = performAttack(attacker, defender, fixedRng(1));
    expect(result.defender.health).toBeLessThan(defender.health);
    expect(result.log).toContain(attacker.name);
  });

  test("performSpecial fails when mana is low", () => {
    const attacker = { ...DEFAULT_PLAYER, mana: 0 };
    const defender = { ...DEFAULT_ENEMY };
    const result = performSpecial(attacker, defender, fixedRng(1));
    expect(result.failed).toBe(true);
    expect(result.defender).toEqual(defender);
  });

  test("performSpecial consumes mana and damages", () => {
    const attacker = { ...DEFAULT_PLAYER, mana: 40, attack: 10 };
    const defender = { ...DEFAULT_ENEMY, defense: 0, health: 40 };
    const result = performSpecial(attacker, defender, fixedRng(1));
    expect(result.attacker.mana).toBeLessThan(attacker.mana);
    expect(result.defender.health).toBeLessThan(defender.health);
  });

  test("performHeal restores health when mana is available", () => {
    const combatant = { ...DEFAULT_PLAYER, health: 50, mana: 20 };
    const result = performHeal(combatant);
    expect(result.combatant.health).toBeGreaterThan(combatant.health);
    expect(result.combatant.mana).toBeLessThan(combatant.mana);
  });

  test("performHeal fails without mana", () => {
    const combatant = { ...DEFAULT_PLAYER, mana: 0 };
    const result = performHeal(combatant);
    expect(result.failed).toBe(true);
    expect(result.combatant).toEqual(combatant);
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

  test("performTurn resolves player victory", () => {
    const player = { ...DEFAULT_PLAYER, attack: 200 };
    const enemy = { ...DEFAULT_ENEMY, health: 10, defense: 0 };
    const result = performTurn({ player, enemy, action: ACTIONS.ATTACK, rng: fixedRng(1) });
    expect(result.log[result.log.length - 1]).toContain("Victory");
    expect(result.enemy.health).toBe(0);
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
