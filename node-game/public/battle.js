import { rollLoot } from "./items.js";

export const DEFAULT_PLAYER = Object.freeze({
  name: "Hero",
  maxHealth: 120,
  health: 120,
  attack: 18,
  defense: 6,
  mana: 40,
  maxMana: 40,
  critChance: 0.1,
  critMultiplier: 1.5
});

export const DEFAULT_ENEMY = Object.freeze({
  name: "Otherworldly Beast",
  maxHealth: 140,
  health: 140,
  attack: 16,
  defense: 4,
  focus: 0,
  maxFocus: 60,
  mana: 0,
  maxMana: 0,
  critChance: 0.05,
  critMultiplier: 1.3,
  experienceReward: 45
});

export const NPCS = Object.freeze([
  Object.freeze({
    id: "ember_wyrmling",
    name: "Ember Wyrmling",
    description: "A young drake that lashes out with fiery desperation.",
    maxHealth: 110,
    health: 110,
    attack: 14,
    defense: 3,
    focus: 10,
    maxFocus: 50,
    mana: 0,
    maxMana: 0,
    critChance: 0.08,
    critMultiplier: 1.4,
    experienceReward: 30
  }),
  Object.freeze({
    id: "moonlit_duelist",
    name: "Moonlit Duelist",
    description: "A poised swordswoman who punishes careless strikes.",
    maxHealth: 130,
    health: 130,
    attack: 18,
    defense: 5,
    focus: 0,
    maxFocus: 70,
    mana: 15,
    maxMana: 15,
    critChance: 0.12,
    critMultiplier: 1.5,
    experienceReward: 55
  }),
  Object.freeze({
    id: "crystal_guardian",
    name: "Crystal Guardian",
    description: "A sentinel that shrugs off blows with crystalline armor.",
    maxHealth: 170,
    health: 170,
    attack: 15,
    defense: 8,
    focus: 0,
    maxFocus: 40,
    mana: 0,
    maxMana: 0,
    critChance: 0.04,
    critMultiplier: 1.2,
    experienceReward: 70
  })
]);

export const ACTIONS = Object.freeze({
  ATTACK: "attack",
  SPECIAL: "special",
  HEAL: "heal"
});

export const ACTION_CONFIG = Object.freeze({
  [ACTIONS.ATTACK]: Object.freeze({
    label: "Swift Strike",
    cooldownMs: 1500
  }),
  [ACTIONS.SPECIAL]: Object.freeze({
    label: "Ember Surge",
    cooldownMs: 5500
  }),
  [ACTIONS.HEAL]: Object.freeze({
    label: "Serenity Bloom",
    cooldownMs: 8000
  })
});

export const GLOBAL_COOLDOWN_MS = 1200;

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getNpcById(id) {
  if (!id) {
    return DEFAULT_ENEMY;
  }
  const match = NPCS.find((npc) => npc.id === id);
  return match ?? DEFAULT_ENEMY;
}

export function createCombatant(overrides = {}) {
  const base = overrides.isEnemy ? DEFAULT_ENEMY : DEFAULT_PLAYER;
  const combatant = { ...base, ...overrides };
  combatant.health = clamp(combatant.health, 0, combatant.maxHealth);
  combatant.mana = clamp(combatant.mana, 0, combatant.maxMana);
  if (typeof combatant.maxFocus === "number") {
    combatant.focus = clamp(combatant.focus ?? 0, 0, combatant.maxFocus);
  }
  return combatant;
}

export function calculateDamage(attacker, defender, rng = Math.random) {
  const critRoll = rng();
  const isCrit = critRoll < attacker.critChance;
  const rawDamage = Math.max(1, attacker.attack - defender.defense);
  const totalDamage = Math.round(rawDamage * (isCrit ? attacker.critMultiplier : 1));
  return {
    damage: totalDamage,
    isCrit
  };
}

export function applyDamage(defender, damage) {
  const nextHealth = clamp(defender.health - damage, 0, defender.maxHealth);
  return { ...defender, health: nextHealth };
}

export function applyHeal(target, amount) {
  const nextHealth = clamp(target.health + amount, 0, target.maxHealth);
  return { ...target, health: nextHealth };
}

export function applyManaCost(caster, cost) {
  const nextMana = clamp(caster.mana - cost, 0, caster.maxMana);
  return { ...caster, mana: nextMana };
}

export function applyFocusGain(combatant, amount) {
  if (typeof combatant.maxFocus !== "number") {
    return combatant;
  }
  const nextFocus = clamp((combatant.focus ?? 0) + amount, 0, combatant.maxFocus);
  return { ...combatant, focus: nextFocus };
}

export function applyFocusCost(combatant, cost) {
  if (typeof combatant.maxFocus !== "number") {
    return combatant;
  }
  const nextFocus = clamp((combatant.focus ?? 0) - cost, 0, combatant.maxFocus);
  return { ...combatant, focus: nextFocus };
}

export function getActionConfig(action) {
  return ACTION_CONFIG[action] ?? null;
}

export function getEnemyActionDelay(enemy, rng = Math.random) {
  const baseDelay = clamp(2200 - enemy.attack * 20, 1200, 2600);
  const jitter = Math.round((rng() - 0.5) * 400);
  return clamp(baseDelay + jitter, 900, 3000);
}

export function performAttack(attacker, defender, rng) {
  const { damage, isCrit } = calculateDamage(attacker, defender, rng);
  const updatedDefender = applyDamage(defender, damage);
  return {
    attacker,
    defender: updatedDefender,
    log: `${attacker.name} strikes for ${damage} damage${isCrit ? " (critical!)" : ""}.`,
    damage,
    isCrit
  };
}

export function performSpecial(attacker, defender, rng) {
  const manaCost = 15;
  if (attacker.mana < manaCost) {
    return {
      attacker,
      defender,
      log: `${attacker.name} tries to unleash a special attack, but lacks mana.`,
      failed: true,
      damage: 0,
      isCrit: false
    };
  }
  const boostedAttacker = { ...attacker, attack: attacker.attack + 10 };
  const updatedAttacker = applyManaCost(boostedAttacker, manaCost);
  const { damage, isCrit } = calculateDamage(updatedAttacker, defender, rng);
  const updatedDefender = applyDamage(defender, damage);
  return {
    attacker: updatedAttacker,
    defender: updatedDefender,
    log: `${attacker.name} channels power for ${damage} damage${isCrit ? " (critical!)" : ""}.`,
    damage,
    isCrit
  };
}

export function performHeal(actionTaker) {
  const manaCost = 10;
  if (actionTaker.mana < manaCost) {
    return {
      combatant: actionTaker,
      log: `${actionTaker.name} reaches for healing magic, but their mana is too low.`,
      failed: true,
      healed: 0
    };
  }
  const healAmount = 24;
  const updated = applyHeal(applyManaCost(actionTaker, manaCost), healAmount);
  return {
    combatant: updated,
    log: `${actionTaker.name} restores ${healAmount} health.`,
    healed: healAmount
  };
}

export function performFocusStrike(attacker, defender, rng) {
  const focusCost = 50;
  if ((attacker.focus ?? 0) < focusCost) {
    return {
      attacker,
      defender,
      log: `${attacker.name} attempts a focused strike, but their focus wavers.`,
      failed: true,
      damage: 0,
      isCrit: false
    };
  }
  const empoweredAttacker = { ...attacker, attack: attacker.attack + 12 };
  const updatedAttacker = applyFocusCost(empoweredAttacker, focusCost);
  const { damage, isCrit } = calculateDamage(updatedAttacker, defender, rng);
  const updatedDefender = applyDamage(defender, damage);
  return {
    attacker: updatedAttacker,
    defender: updatedDefender,
    log: `${attacker.name} unleashes a focused strike for ${damage} damage${
      isCrit ? " (critical!)" : ""
    }.`,
    damage,
    isCrit
  };
}

export function performPlayerAction({ player, enemy, action, rng = Math.random }) {
  let log = [];
  let updatedPlayer = player;
  let updatedEnemy = enemy;
  let actionDamage = 0;
  let healed = 0;
  let failed = false;

  if (action === ACTIONS.ATTACK) {
    const result = performAttack(updatedPlayer, updatedEnemy, rng);
    updatedEnemy = result.defender;
    log.push(result.log);
    actionDamage = result.damage;
  } else if (action === ACTIONS.SPECIAL) {
    const result = performSpecial(updatedPlayer, updatedEnemy, rng);
    updatedPlayer = result.attacker;
    updatedEnemy = result.defender;
    log.push(result.log);
    actionDamage = result.damage;
    failed = Boolean(result.failed);
  } else if (action === ACTIONS.HEAL) {
    const result = performHeal(updatedPlayer);
    updatedPlayer = result.combatant;
    log.push(result.log);
    healed = result.healed;
    failed = Boolean(result.failed);
  } else {
    log.push(`${updatedPlayer.name} hesitates.`);
    failed = true;
  }

  if (isDefeated(updatedEnemy)) {
    log.push(`${updatedEnemy.name} collapses. Victory!`);
    const loot = rollLoot(updatedEnemy.id, rng);
    const experienceGained = updatedEnemy.experienceReward ?? 0;
    return {
      player: updatedPlayer,
      enemy: updatedEnemy,
      log,
      loot,
      experienceGained,
      actionResult: { action, damage: actionDamage, healed, failed },
      victory: true
    };
  }

  if (typeof updatedEnemy.maxFocus === "number" && typeof updatedEnemy.focus !== "number") {
    updatedEnemy = { ...updatedEnemy, focus: 0 };
  }

  if (typeof updatedEnemy.maxFocus === "number") {
    updatedEnemy = applyFocusGain(
      updatedEnemy,
      calculateFocusGain({ action, damage: actionDamage })
    );
  }

  return {
    player: updatedPlayer,
    enemy: updatedEnemy,
    log,
    actionResult: { action, damage: actionDamage, healed, failed },
    victory: false
  };
}

export function performEnemyAction({ player, enemy, rng = Math.random }) {
  if (isDefeated(enemy)) {
    return { player, enemy, log: [], action: null };
  }

  let updatedEnemy = enemy;
  let updatedPlayer = player;
  const log = [];

  if (typeof updatedEnemy.maxFocus === "number" && typeof updatedEnemy.focus !== "number") {
    updatedEnemy = { ...updatedEnemy, focus: 0 };
  }

  const shouldUseFocusStrike =
    typeof updatedEnemy.maxFocus === "number" && updatedEnemy.focus >= 50;
  const shouldUseSpecial = updatedEnemy.mana >= 10 && rng() < 0.3;

  if (shouldUseFocusStrike) {
    const result = performFocusStrike(updatedEnemy, updatedPlayer, rng);
    updatedEnemy = result.attacker;
    updatedPlayer = result.defender;
    log.push(result.log);
    return { player: updatedPlayer, enemy: updatedEnemy, log, action: "focus" };
  }

  if (shouldUseSpecial) {
    const result = performSpecial(updatedEnemy, updatedPlayer, rng);
    updatedEnemy = result.attacker;
    updatedPlayer = result.defender;
    log.push(result.log);
    return { player: updatedPlayer, enemy: updatedEnemy, log, action: ACTIONS.SPECIAL };
  }

  const result = performAttack(updatedEnemy, updatedPlayer, rng);
  updatedEnemy = result.attacker;
  updatedPlayer = result.defender;
  log.push(result.log);
  return { player: updatedPlayer, enemy: updatedEnemy, log, action: ACTIONS.ATTACK };
}

export function isDefeated(combatant) {
  return combatant.health <= 0;
}

export function calculateFocusGain({ action, damage = 0 }) {
  if (action === ACTIONS.ATTACK || action === ACTIONS.SPECIAL) {
    const scaledGain = 8 + Math.floor(damage / 5);
    return clamp(scaledGain, 5, 30);
  }
  if (action === ACTIONS.HEAL) {
    return 12;
  }
  return 6;
}

export function performTurn({ player, enemy, action, rng = Math.random }) {
  const playerResult = performPlayerAction({ player, enemy, action, rng });
  let updatedPlayer = playerResult.player;
  let updatedEnemy = playerResult.enemy;
  let log = [...playerResult.log];

  if (playerResult.victory) {
    return {
      player: updatedPlayer,
      enemy: updatedEnemy,
      log,
      loot: playerResult.loot,
      experienceGained: playerResult.experienceGained
    };
  }

  const enemyResult = performEnemyAction({ player: updatedPlayer, enemy: updatedEnemy, rng });
  updatedPlayer = enemyResult.player;
  updatedEnemy = enemyResult.enemy;
  log = log.concat(enemyResult.log);

  if (isDefeated(updatedPlayer)) {
    log.push(`${updatedPlayer.name} falls. Defeat.`);
  }

  return { player: updatedPlayer, enemy: updatedEnemy, log };
}
