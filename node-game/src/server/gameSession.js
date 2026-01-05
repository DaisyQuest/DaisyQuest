import {
  ACTIONS,
  ACTION_CONFIG,
  DEFAULT_PLAYER,
  GLOBAL_COOLDOWN_MS,
  NPCS,
  createCombatant,
  getEnemyActionDelay,
  getNpcById,
  isDefeated,
  performEnemyAction,
  performPlayerAction
} from "../battle.js";
import {
  EQUIPMENT_SLOTS,
  ITEMS,
  NPC_LOOT_TABLES,
  RARITY_COLORS,
  RECIPES
} from "../items.js";
import { COMBAT_CONFIG } from "../systems/combatConfig.js";
import {
  createSpellbook,
  equipSpell as equipSpellbook,
  getSpellById,
  listDefaultSpellIds,
  listSpellUnlocks,
  listSpells,
  SPELLBOOK_SLOTS,
  unequipSpell as unequipSpellbook
} from "../spells.js";
import { createCoreSystemRegistry } from "../systems/systemCatalog.js";
import { createProgressionSystem } from "../systems/progressionSystem.js";
import { createRegistryEditor } from "../systems/registryEditor.js";
import { createUnlockSystem } from "../systems/unlockSystem.js";
import { createWorldState } from "../world/worldState.js";
import { applyWorldMovement, moveOtherPlayers } from "../world/movementEngine.js";

export const PROGRESSION_THRESHOLDS = Object.freeze([0, 120, 280, 480, 720, 1000, 1400, 1900]);

export const REWARD_MILESTONES = Object.freeze([
  Object.freeze({
    level: 2,
    reward: { itemId: "ember_scale", quantity: 2 },
    label: "Ember Cache"
  }),
  Object.freeze({
    level: 3,
    reward: { itemId: "moonsteel_ingot", quantity: 1 },
    label: "Moonsteel Shard"
  }),
  Object.freeze({
    level: 4,
    reward: { itemId: "crystal_shard", quantity: 2 },
    label: "Guardian Crystal"
  }),
  Object.freeze({
    level: 5,
    reward: { itemId: "wyrmling_helm", quantity: 1 },
    label: "Wyrmling Relic"
  })
]);

export const HOTBAR_SIZE = 4;

const DEFAULT_HOTBAR = Object.freeze([
  ACTIONS.ATTACK,
  ACTIONS.SPECIAL,
  ACTIONS.HEAL,
  null
]);

const VALID_HOTBAR_ACTIONS = new Set(Object.keys(ACTION_CONFIG));

function normalizeHotbarSlots(slots) {
  const nextSlots = Array.isArray(slots) ? [...slots] : [];
  if (nextSlots.length > HOTBAR_SIZE) {
    nextSlots.length = HOTBAR_SIZE;
  }
  while (nextSlots.length < HOTBAR_SIZE) {
    nextSlots.push(null);
  }
  return nextSlots.map((slot) => (slot == null ? null : slot));
}

function validateHotbarSlots(slots) {
  if (!Array.isArray(slots)) {
    return { error: "Hotbar slots are required." };
  }
  if (slots.length !== HOTBAR_SIZE) {
    return { error: `Hotbar must have ${HOTBAR_SIZE} slots.` };
  }
  for (const slot of slots) {
    if (slot == null) {
      continue;
    }
    if (typeof slot !== "string" || !VALID_HOTBAR_ACTIONS.has(slot)) {
      return { error: "Hotbar contains an unknown action." };
    }
  }
  return { slots: normalizeHotbarSlots(slots) };
}

export const BATTLE_SCENE_CONFIG = Object.freeze({
  layout: Object.freeze({
    arenaBaseline: Object.freeze({ xPercent: 50, yPercent: 72 }),
    spritePlacement: Object.freeze({
      player: Object.freeze({ xPercent: 22, yPercent: 62, scale: 1 }),
      enemy: Object.freeze({ xPercent: 78, yPercent: 62, scale: 1 })
    }),
    effectBounds: Object.freeze({
      player: Object.freeze({ xPercent: 10, yPercent: 22, widthPercent: 30, heightPercent: 50 }),
      enemy: Object.freeze({ xPercent: 60, yPercent: 22, widthPercent: 30, heightPercent: 50 })
    }),
    captionZones: Object.freeze({
      player: Object.freeze({ xPercent: 8, yPercent: 6, widthPercent: 38, heightPercent: 20 }),
      enemy: Object.freeze({ xPercent: 54, yPercent: 6, widthPercent: 38, heightPercent: 20 }),
      global: Object.freeze({ xPercent: 25, yPercent: 2, widthPercent: 50, heightPercent: 14 })
    })
  }),
  overlays: Object.freeze({
    statusBanners: Object.freeze([
      Object.freeze({ id: "poisoned", label: "Poisoned", tone: "danger" }),
      Object.freeze({ id: "stunned", label: "Stunned", tone: "warning" }),
      Object.freeze({ id: "burning", label: "Burning", tone: "accent" })
    ]),
    statusRules: Object.freeze([
      Object.freeze({ source: "player", action: "attack", target: "enemy", status: "poisoned" }),
      Object.freeze({ source: "player", action: "special", target: "enemy", status: "burning" }),
      Object.freeze({ source: "enemy", action: "attack", target: "player", status: "poisoned" }),
      Object.freeze({ source: "enemy", action: "special", target: "player", status: "burning" }),
      Object.freeze({ source: "enemy", action: "focus", target: "player", status: "stunned" })
    ]),
    durationsMs: Object.freeze({
      status: 2600,
      hit: 1400
    })
  }),
  polish: Object.freeze({
    ambientParticles: Object.freeze({ count: 18 }),
    pulsingHighlights: Object.freeze({ opacity: 0.35, speedMs: 2800 }),
    parallaxLayers: Object.freeze([
      Object.freeze({ id: "distant", speed: 0.15 }),
      Object.freeze({ id: "mid", speed: 0.25 }),
      Object.freeze({ id: "near", speed: 0.35 })
    ])
  })
});

function buildRuntimeSystems(systemRegistry, registryEditor) {
  const snapshot = registryEditor.getSnapshot();
  const runtime = systemRegistry.createRuntime({
    context: {
      items: snapshot.items,
      recipes: snapshot.recipes,
      lootTables: NPC_LOOT_TABLES,
      rarityColors: RARITY_COLORS,
      equipmentSlots: EQUIPMENT_SLOTS
    }
  });
  return runtime.systems;
}

function createCombatTimers() {
  return {
    globalCooldownUntil: 0,
    actionCooldowns: Object.fromEntries(Object.keys(ACTION_CONFIG).map((action) => [action, 0])),
    enemyNextActionAt: 0
  };
}

function serializeState(state) {
  return {
    ...state,
    claimedRewards: Array.from(state.claimedRewards)
  };
}

function getVictoryReward(enemy) {
  const base = Math.max(40, Math.round(enemy.maxHealth / 2));
  return {
    xp: base,
    label: `${enemy.name} defeated (+${base} XP)`
  };
}

function getMilestoneForLevel(level, claimedRewards) {
  return (
    REWARD_MILESTONES.find(
      (reward) => reward.level <= level && !claimedRewards.has(reward.level)
    ) || null
  );
}

function formatLootLines(lootDrops, itemRegistry) {
  return lootDrops.map((drop) => {
    const item = itemRegistry.getItem(drop.itemId);
    const itemName = item?.name ?? "Unknown item";
    return `Looted ${itemName} x${drop.quantity}.`;
  });
}

function hydrateState(snapshot) {
  if (!snapshot) {
    return null;
  }
  return {
    ...snapshot,
    claimedRewards: new Set(snapshot.claimedRewards ?? [])
  };
}

function normalizeSpellState(snapshot) {
  const knownSpells = Array.isArray(snapshot?.knownSpells)
    ? snapshot.knownSpells
    : listDefaultSpellIds();
  const equippedSlots = Array.isArray(snapshot?.spellbook?.equippedSlots)
    ? snapshot.spellbook.equippedSlots
    : [];
  return {
    knownSpells,
    consumedItems: Array.isArray(snapshot?.consumedItems) ? snapshot.consumedItems : [],
    spellbook: createSpellbook({ knownSpells, equippedSlots })
  };
}

function buildInitialState(snapshot) {
  const spellState = normalizeSpellState(snapshot);
  const progressionSystem = createProgressionSystem({ thresholds: PROGRESSION_THRESHOLDS });
  const defaultState = {
    player: createCombatant(DEFAULT_PLAYER),
    enemy: createCombatant({ ...getNpcById(NPCS[0]?.id), isEnemy: true }),
    combatEngaged: false,
    inventory: {},
    equipment: {},
    attributes: progressionSystem.createAttributes(),
    progression: progressionSystem.getProgressSnapshot(0),
    pendingReward: null,
    claimedRewards: new Set(),
    hotbar: normalizeHotbarSlots(DEFAULT_HOTBAR),
    ...spellState
  };
  const hydrated = hydrateState(snapshot);
  if (!hydrated) {
    return defaultState;
  }
  const hydratedSpellState = normalizeSpellState(hydrated);
  const hydratedAttributes =
    hydrated.attributes && typeof hydrated.attributes === "object"
      ? hydrated.attributes
      : defaultState.attributes;
  return {
    ...defaultState,
    ...hydrated,
    ...hydratedSpellState,
    attributes: hydratedAttributes,
    claimedRewards: hydrated.claimedRewards,
    hotbar: normalizeHotbarSlots(hydrated.hotbar ?? defaultState.hotbar)
  };
}

export function createGameSession({
  username,
  nowFn = Date.now,
  rng = Math.random,
  initialState,
  initialTimers,
  registrySnapshot,
  systemRegistryFactory = createCoreSystemRegistry
} = {}) {
  const registryEditor = createRegistryEditor({
    items: registrySnapshot?.items ?? ITEMS,
    recipes: registrySnapshot?.recipes ?? RECIPES
  });
  const progressionSystem = createProgressionSystem({ thresholds: PROGRESSION_THRESHOLDS });
  const unlockSystem = createUnlockSystem();
  const systemRegistry = systemRegistryFactory();
  let runtime = buildRuntimeSystems(systemRegistry, registryEditor);
  let state = buildInitialState(initialState);
  if (!state.world) {
    state = { ...state, world: createWorldState({ playerId: username, playerName: username }) };
  }
  if (!state.progression) {
    state = { ...state, progression: progressionSystem.getProgressSnapshot(0) };
  }
  let timers = initialTimers ? { ...createCombatTimers(), ...initialTimers } : createCombatTimers();

  function refreshRuntime() {
    runtime = buildRuntimeSystems(systemRegistry, registryEditor);
  }

  function getSnapshot() {
    return {
      state: serializeState(state),
      timers: { ...timers }
    };
  }

  function getWorldState() {
    return state.world;
  }

  function moveWorldPlayer(target) {
    if (!state.world) {
      return { error: "World state is not initialized." };
    }
    const result = applyWorldMovement({
      worldState: state.world,
      playerId: username,
      target,
      rng
    });
    if (result.error) {
      return { error: result.error };
    }
    state = { ...state, world: result.worldState };
    return {
      world: state.world,
      movement: result.movement,
      otherMovements: result.otherMovements
    };
  }

  function advanceWorldTick() {
    if (!state.world) {
      return { error: "World state is not initialized." };
    }
    const result = moveOtherPlayers({
      worldState: state.world,
      playerId: username,
      rng
    });
    if (result.error) {
      return { error: result.error };
    }
    state = { ...state, world: result.worldState };
    return { world: state.world, otherMovements: result.movements };
  }

  function getRegistrySnapshot() {
    return registryEditor.getSnapshot();
  }

  function getPersistenceSnapshot() {
    return {
      state: serializeState(state),
      timers: { ...timers },
      registry: getRegistrySnapshot()
    };
  }

  function getConfig() {
    return {
      actions: ACTION_CONFIG,
      battleScene: BATTLE_SCENE_CONFIG,
      combatConfig: COMBAT_CONFIG,
      globalCooldownMs: GLOBAL_COOLDOWN_MS,
      hotbarSize: HOTBAR_SIZE,
      npcs: NPCS,
      rarityColors: RARITY_COLORS,
      equipmentSlots: EQUIPMENT_SLOTS,
      rewardMilestones: REWARD_MILESTONES,
      spells: listSpells(),
      spellUnlocks: listSpellUnlocks(),
      spellbookSlots: SPELLBOOK_SLOTS
    };
  }

  function updateHotbar(slots) {
    if (state.combatEngaged) {
      return { error: "Cannot update hotbar during combat." };
    }
    const validation = validateHotbarSlots(slots);
    if (validation.error) {
      return { error: validation.error };
    }
    state = { ...state, hotbar: validation.slots };
    return getSnapshot();
  }

  function applyProgressionGain(amount, sourceLabel) {
    const result = progressionSystem.awardXp(state.progression, amount);
    if (result.error) {
      return { log: [result.error] };
    }
    state = { ...state, progression: result.state };
    const log = [];
    if (sourceLabel) {
      log.push(`${sourceLabel} earned.`);
    }
    if (result.leveledUp) {
      log.push(`Level up! You reached level ${state.progression.level}.`);
      const milestone = getMilestoneForLevel(state.progression.level, state.claimedRewards);
      if (milestone && !state.claimedRewards.has(milestone.level)) {
        state = { ...state, pendingReward: milestone };
      }
    }
    return { log };
  }

  function setActionCooldowns(action, now) {
    const config = ACTION_CONFIG[action];
    timers = {
      ...timers,
      actionCooldowns: {
        ...timers.actionCooldowns,
        [action]: now + config.cooldownMs
      },
      globalCooldownUntil: now + GLOBAL_COOLDOWN_MS
    };
  }

  function scheduleEnemyAction(enemy, now) {
    timers = {
      ...timers,
      enemyNextActionAt: now + getEnemyActionDelay(enemy, rng)
    };
  }

  function resetBattle(npcId) {
    const npc = getNpcById(npcId);
    state = {
      ...state,
      player: createCombatant(DEFAULT_PLAYER),
      enemy: createCombatant({ ...npc, isEnemy: true }),
      combatEngaged: true
    };
    timers = createCombatTimers();
    scheduleEnemyAction(state.enemy, nowFn());
    return {
      log: [
        `A new duel ignites against ${npc.name}. Steel and spell flare as you size up the threat, steady your breath, and choose your opening move with care.`
      ],
      ...getSnapshot()
    };
  }

  function attemptAction(action) {
    if (!ACTION_CONFIG[action]) {
      return { error: "Unknown action." };
    }
    if (isDefeated(state.player) || isDefeated(state.enemy)) {
      state = { ...state, combatEngaged: false };
      return { error: "Combat has concluded." };
    }
    const now = nowFn();
    if ((timers.actionCooldowns[action] ?? 0) > now) {
      return { error: "Action is recharging." };
    }
    if (timers.globalCooldownUntil > now) {
      return { error: "Global cooldown active." };
    }

    const result = performPlayerAction({ player: state.player, enemy: state.enemy, action, rng });
    state = { ...state, player: result.player, enemy: result.enemy };
    const log = [...result.log];
    const battleEvent = {
      source: "player",
      action,
      ...result.actionResult
    };
    let loot = [];

    setActionCooldowns(action, now);

    if (result.victory) {
      timers = { ...timers, enemyNextActionAt: 0 };
      state = { ...state, combatEngaged: false };
      const reward = getVictoryReward(state.enemy);
      log.push(...applyProgressionGain(reward.xp, reward.label).log);
      const lootDrops = runtime.lootSystem.rollLoot(state.enemy.id, rng);
      if (lootDrops.length > 0) {
        lootDrops.forEach((drop) => {
          state = {
            ...state,
            inventory: runtime.inventoryManager.addItem(
              state.inventory,
              drop.itemId,
              drop.quantity
            )
          };
        });
        loot = formatLootLines(lootDrops, runtime.itemRegistry);
      }
      return { log, loot, battleEvent, ...getSnapshot() };
    }

    scheduleEnemyAction(state.enemy, now);
    return { log, loot, battleEvent, ...getSnapshot() };
  }

  function processEnemyTick() {
    const now = nowFn();
    if (!timers.enemyNextActionAt || now < timers.enemyNextActionAt) {
      return { log: [], battleEvent: null, ...getSnapshot() };
    }
    if (isDefeated(state.player) || isDefeated(state.enemy)) {
      timers = { ...timers, enemyNextActionAt: 0 };
      state = { ...state, combatEngaged: false };
      return { log: [], battleEvent: null, ...getSnapshot() };
    }

    const previousPlayerHealth = state.player.health;
    const result = performEnemyAction({ player: state.player, enemy: state.enemy, rng });
    state = { ...state, player: result.player, enemy: result.enemy };
    const log = [...result.log];
    const damage = Math.max(0, previousPlayerHealth - state.player.health);
    const healed = Math.max(0, state.player.health - previousPlayerHealth);
    const battleEvent = { source: "enemy", action: result.action, damage, healed, failed: false };

    if (isDefeated(state.player)) {
      log.push(`${state.player.name} falls. Defeat.`);
      timers = { ...timers, enemyNextActionAt: 0 };
      state = { ...state, combatEngaged: false };
      return { log, battleEvent, ...getSnapshot() };
    }

    scheduleEnemyAction(state.enemy, now);
    return { log, battleEvent, ...getSnapshot() };
  }

  function craftItem(recipeId) {
    if (!recipeId) {
      return { error: "Recipe is required." };
    }
    const result = runtime.craftingSystem.craftItem(state.inventory, recipeId);
    if (result.error) {
      return { error: result.error };
    }
    const craftedItem = runtime.itemRegistry.getItem(result.crafted);
    state = { ...state, inventory: result.inventory };
    const log = [`Crafted ${craftedItem.name}.`];
    log.push(...applyProgressionGain(40, "Crafting mastery").log);
    return { log, ...getSnapshot() };
  }

  function equipItem(itemId) {
    if (!itemId) {
      return { error: "Item id is required." };
    }
    const result = runtime.inventoryManager.equipItem(state.inventory, state.equipment, itemId);
    if (result.error) {
      return { error: result.error };
    }
    const item = runtime.itemRegistry.getItem(itemId);
    state = { ...state, inventory: result.inventory, equipment: result.equipment };
    return { log: [`Equipped ${item.name}.`], ...getSnapshot() };
  }

  function unequipItem(slot) {
    if (!slot) {
      return { error: "Equipment slot is required." };
    }
    const equippedId = state.equipment?.[slot];
    const result = runtime.inventoryManager.unequipItem(state.inventory, state.equipment, slot);
    if (result.error) {
      return { error: result.error };
    }
    const item = runtime.itemRegistry.getItem(equippedId);
    state = { ...state, inventory: result.inventory, equipment: result.equipment };
    return { log: [`Unequipped ${item.name}.`], ...getSnapshot() };
  }

  function claimReward() {
    if (!state.pendingReward) {
      return { error: "No reward available." };
    }
    const { reward, label, level } = state.pendingReward;
    state = {
      ...state,
      inventory: runtime.inventoryManager.addItem(
        state.inventory,
        reward.itemId,
        reward.quantity
      ),
      pendingReward: null,
      claimedRewards: new Set(state.claimedRewards).add(level)
    };
    return { log: [`Reward claimed: ${label}.`], ...getSnapshot() };
  }

  function awardXp(amount) {
    const result = applyProgressionGain(amount);
    return { log: result.log, ...getSnapshot() };
  }

  function learnSpell(spellId) {
    if (!spellId) {
      return { error: "Spell id is required." };
    }
    const spell = getSpellById(spellId);
    if (!spell) {
      return { error: "Spell not found." };
    }
    if (state.knownSpells.includes(spellId)) {
      return { error: "Spell already known." };
    }
    const requirements = unlockSystem.evaluateRequirements(spell.unlockRequirements, {
      attributes: state.attributes ?? {},
      inventory: state.inventory,
      consumedItems: state.consumedItems ?? []
    });
    if (!requirements.ok) {
      return { error: requirements.reason };
    }
    let nextInventory = state.inventory;
    let nextConsumed = [...(state.consumedItems ?? [])];
    requirements.consume.forEach((entry) => {
      const removal = runtime.inventoryManager.removeItem(nextInventory, entry.itemId, entry.quantity);
      nextInventory = removal.inventory;
      if (removal.removed && !nextConsumed.includes(entry.itemId)) {
        nextConsumed.push(entry.itemId);
      }
    });
    const knownSpells = [...state.knownSpells, spellId];
    const spellbook = createSpellbook({
      knownSpells,
      equippedSlots: state.spellbook?.equippedSlots ?? []
    });
    state = {
      ...state,
      inventory: nextInventory,
      consumedItems: nextConsumed,
      knownSpells,
      spellbook
    };
    return { log: [`Learned ${spell.name}.`], ...getSnapshot() };
  }

  function equipSpell(spellId, slotIndex) {
    const updated = equipSpellbook(state.spellbook, spellId, slotIndex);
    if (updated.error) {
      return { error: updated.error };
    }
    state = { ...state, spellbook: updated };
    return { ...getSnapshot() };
  }

  function unequipSpell(slotIndex) {
    const updated = unequipSpellbook(state.spellbook, slotIndex);
    if (updated.error) {
      return { error: updated.error };
    }
    state = { ...state, spellbook: updated };
    return { ...getSnapshot() };
  }

  function updateItem(item) {
    if (!item) {
      return { error: "Item payload is required." };
    }
    const existing = registryEditor.getItem(item.id);
    const result = existing ? registryEditor.updateItem(item.id, item) : registryEditor.addItem(item);
    if (result.error) {
      return { error: result.error };
    }
    refreshRuntime();
    return { item: result.item, registry: getRegistrySnapshot() };
  }

  function updateRecipe(recipe) {
    if (!recipe) {
      return { error: "Recipe payload is required." };
    }
    const existing = registryEditor.getRecipe(recipe.id);
    const result = existing
      ? registryEditor.updateRecipe(recipe.id, recipe)
      : registryEditor.addRecipe(recipe);
    if (result.error) {
      return { error: result.error };
    }
    refreshRuntime();
    return { recipe: result.recipe, registry: getRegistrySnapshot() };
  }

  function grantItem(itemId, quantity) {
    if (!itemId || !Number.isFinite(quantity) || quantity <= 0) {
      return { error: "Invalid grant request." };
    }
    state = {
      ...state,
      inventory: runtime.inventoryManager.addItem(state.inventory, itemId, quantity)
    };
    return { state: serializeState(state) };
  }

  function getInventorySnapshot() {
    return { ...state.inventory };
  }

  function canAffordItems(items = {}) {
    return Object.entries(items).every(([itemId, quantity]) => {
      if (!itemId || !Number.isFinite(quantity) || quantity <= 0) {
        return false;
      }
      return (state.inventory[itemId] ?? 0) >= quantity;
    });
  }

  function previewInventoryTransaction({ removeItems = {}, addItems = {} } = {}) {
    const invalidRemove = Object.entries(removeItems).some(
      ([itemId, quantity]) => !itemId || !Number.isFinite(quantity) || quantity <= 0
    );
    if (invalidRemove) {
      return { error: "Insufficient inventory for trade." };
    }
    const invalidAdd = Object.entries(addItems).some(
      ([itemId, quantity]) => !itemId || !Number.isFinite(quantity) || quantity <= 0
    );
    if (invalidAdd) {
      return { error: "Invalid trade item quantities." };
    }
    if (!canAffordItems(removeItems)) {
      return { error: "Insufficient inventory for trade." };
    }
    let nextInventory = { ...state.inventory };
    Object.entries(removeItems).forEach(([itemId, quantity]) => {
      nextInventory = runtime.inventoryManager.removeItem(nextInventory, itemId, quantity).inventory;
    });
    Object.entries(addItems).forEach(([itemId, quantity]) => {
      nextInventory = runtime.inventoryManager.addItem(nextInventory, itemId, quantity);
    });
    return { inventory: nextInventory };
  }

  function commitInventorySnapshot(inventory) {
    if (!inventory || typeof inventory !== "object") {
      return { error: "Invalid inventory snapshot." };
    }
    state = { ...state, inventory: { ...inventory } };
    return { inventory: getInventorySnapshot() };
  }

  function applyInventoryTransaction(transaction) {
    const preview = previewInventoryTransaction(transaction);
    if (preview.error) {
      return { error: preview.error };
    }
    return commitInventorySnapshot(preview.inventory);
  }

  function removeItems(items = {}) {
    return applyInventoryTransaction({ removeItems: items });
  }

  function addItems(items = {}) {
    return applyInventoryTransaction({ addItems: items });
  }

  function unsafeSetState(nextState) {
    state = { ...state, ...nextState };
  }

  function unsafeSetTimers(nextTimers) {
    timers = { ...timers, ...nextTimers };
  }

  return Object.freeze({
    username,
    getSnapshot,
    getRegistrySnapshot,
    getPersistenceSnapshot,
    getConfig,
    getWorldState,
    moveWorldPlayer,
    advanceWorldTick,
    resetBattle,
    attemptAction,
    processEnemyTick,
    craftItem,
    equipItem,
    unequipItem,
    claimReward,
    awardXp,
    updateHotbar,
    learnSpell,
    equipSpell,
    unequipSpell,
    updateItem,
    updateRecipe,
    grantItem,
    getInventorySnapshot,
    canAffordItems,
    previewInventoryTransaction,
    commitInventorySnapshot,
    applyInventoryTransaction,
    removeItems,
    addItems,
    unsafeSetState,
    unsafeSetTimers
  });
}
