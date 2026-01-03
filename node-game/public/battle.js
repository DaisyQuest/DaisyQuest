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
  mana: 0,
  maxMana: 0,
  critChance: 0.05,
  critMultiplier: 1.3
});

export const ACTIONS = Object.freeze({
  ATTACK: "attack",
  SPECIAL: "special",
  HEAL: "heal"
});

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function createCombatant(overrides = {}) {
  const base = overrides.isEnemy ? DEFAULT_ENEMY : DEFAULT_PLAYER;
  const combatant = { ...base, ...overrides };
  combatant.health = clamp(combatant.health, 0, combatant.maxHealth);
  combatant.mana = clamp(combatant.mana, 0, combatant.maxMana);
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

export function performAttack(attacker, defender, rng) {
  const { damage, isCrit } = calculateDamage(attacker, defender, rng);
  const updatedDefender = applyDamage(defender, damage);
  return {
    attacker,
    defender: updatedDefender,
    log: `${attacker.name} strikes for ${damage} damage${isCrit ? " (critical!)" : ""}.`
  };
}

export function performSpecial(attacker, defender, rng) {
  const manaCost = 15;
  if (attacker.mana < manaCost) {
    return {
      attacker,
      defender,
      log: `${attacker.name} tries to unleash a special attack, but lacks mana.`,
      failed: true
    };
  }
  const boostedAttacker = { ...attacker, attack: attacker.attack + 10 };
  const updatedAttacker = applyManaCost(boostedAttacker, manaCost);
  const { damage, isCrit } = calculateDamage(updatedAttacker, defender, rng);
  const updatedDefender = applyDamage(defender, damage);
  return {
    attacker: updatedAttacker,
    defender: updatedDefender,
    log: `${attacker.name} channels power for ${damage} damage${isCrit ? " (critical!)" : ""}.`
  };
}

export function performHeal(actionTaker) {
  const manaCost = 10;
  if (actionTaker.mana < manaCost) {
    return {
      combatant: actionTaker,
      log: `${actionTaker.name} reaches for healing magic, but their mana is too low.`,
      failed: true
    };
  }
  const healAmount = 24;
  const updated = applyHeal(applyManaCost(actionTaker, manaCost), healAmount);
  return {
    combatant: updated,
    log: `${actionTaker.name} restores ${healAmount} health.`
  };
}

export function isDefeated(combatant) {
  return combatant.health <= 0;
}

export function performTurn({ player, enemy, action, rng = Math.random }) {
  let log = [];
  let updatedPlayer = player;
  let updatedEnemy = enemy;

  if (action === ACTIONS.ATTACK) {
    const result = performAttack(updatedPlayer, updatedEnemy, rng);
    updatedEnemy = result.defender;
    log.push(result.log);
  } else if (action === ACTIONS.SPECIAL) {
    const result = performSpecial(updatedPlayer, updatedEnemy, rng);
    updatedPlayer = result.attacker;
    updatedEnemy = result.defender;
    log.push(result.log);
  } else if (action === ACTIONS.HEAL) {
    const result = performHeal(updatedPlayer);
    updatedPlayer = result.combatant;
    log.push(result.log);
  } else {
    log.push(`${updatedPlayer.name} hesitates.`);
  }

  if (isDefeated(updatedEnemy)) {
    log.push(`${updatedEnemy.name} collapses. Victory!`);
    return { player: updatedPlayer, enemy: updatedEnemy, log };
  }

  const enemyAction = updatedEnemy.mana >= 10 && rng() < 0.3 ? ACTIONS.SPECIAL : ACTIONS.ATTACK;
  if (enemyAction === ACTIONS.SPECIAL) {
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
