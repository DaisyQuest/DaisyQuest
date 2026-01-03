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
  let log = [];
  let updatedPlayer = player;
  let updatedEnemy = enemy;
  let actionDamage = 0;

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
  } else if (action === ACTIONS.HEAL) {
    const result = performHeal(updatedPlayer);
    updatedPlayer = result.combatant;
    log.push(result.log);
  } else {
    log.push(`${updatedPlayer.name} hesitates.`);
  }

  if (isDefeated(updatedEnemy)) {
    log.push(`${updatedEnemy.name} collapses. Victory!`);
    const loot = rollLoot(updatedEnemy.id, rng);
    const experienceGained = updatedEnemy.experienceReward ?? 0;
    return { player: updatedPlayer, enemy: updatedEnemy, log, loot, experienceGained };
  }

  if (typeof updatedEnemy.maxFocus === "number" && typeof updatedEnemy.focus !== "number") {
    updatedEnemy = { ...updatedEnemy, focus: 0 };
  }

  if (typeof updatedEnemy.maxFocus === "number") {
    updatedEnemy = applyFocusGain(updatedEnemy, calculateFocusGain({ action, damage: actionDamage }));
  }

  const shouldUseFocusStrike =
    typeof updatedEnemy.maxFocus === "number" && updatedEnemy.focus >= 50;
  const enemyAction =
    shouldUseFocusStrike || (updatedEnemy.mana >= 10 && rng() < 0.3)
      ? ACTIONS.SPECIAL
      : ACTIONS.ATTACK;

  if (shouldUseFocusStrike) {
    const result = performFocusStrike(updatedEnemy, updatedPlayer, rng);
    updatedEnemy = result.attacker;
    updatedPlayer = result.defender;
    log.push(result.log);
  } else if (enemyAction === ACTIONS.SPECIAL) {
    const result = performSpecial(updatedEnemy, updatedPlayer, rng);
    updatedEnemy = result.attacker;
    updatedPlayer = result.defender;
    log.push(result.log);
  } else {
    const result = performAttack(updatedEnemy, updatedPlayer, rng);
    updatedEnemy = result.attacker;
    updatedPlayer = result.defender;
    log.push(result.log);
  }

  if (isDefeated(updatedPlayer)) {
    log.push(`${updatedPlayer.name} falls. Defeat.`);
  }

  return { player: updatedPlayer, enemy: updatedEnemy, log };
}
