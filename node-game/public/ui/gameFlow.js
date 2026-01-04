export const GameFlowEvent = Object.freeze({
  CombatStarted: "combat-started",
  PlayerActionResolved: "player-action-resolved",
  EnemyActionResolved: "enemy-action-resolved",
  LootGranted: "loot-granted",
  MapMoved: "map-moved"
});

export function createGameFlowEmitter() {
  const listeners = new Map();

  function on(event, handler) {
    if (typeof handler !== "function") {
      return () => {};
    }
    const set = listeners.get(event) ?? new Set();
    set.add(handler);
    listeners.set(event, set);
    return () => off(event, handler);
  }

  function off(event, handler) {
    const set = listeners.get(event);
    if (!set) {
      return;
    }
    set.delete(handler);
    if (set.size === 0) {
      listeners.delete(event);
    }
  }

  function emit(event, payload) {
    const set = listeners.get(event);
    if (!set) {
      return;
    }
    Array.from(set).forEach((handler) => {
      handler(payload);
    });
  }

  return Object.freeze({
    on,
    off,
    emit
  });
}

export function createGameFlowActions({ emitter }) {
  function dispatch(event, payload) {
    emitter.emit(event, payload);
  }

  function combatStarted({ npcId = null, reason = "player" } = {}) {
    dispatch(GameFlowEvent.CombatStarted, { npcId, reason });
  }

  function playerActionResolved(payload) {
    dispatch(GameFlowEvent.PlayerActionResolved, { payload });
  }

  function enemyActionResolved(battleEvent) {
    if (!battleEvent) {
      return;
    }
    dispatch(GameFlowEvent.EnemyActionResolved, { battleEvent });
  }

  function lootGranted(loot) {
    if (!Array.isArray(loot) || loot.length === 0) {
      return;
    }
    dispatch(GameFlowEvent.LootGranted, { loot });
  }

  function mapMoved(movement) {
    dispatch(GameFlowEvent.MapMoved, { movement });
  }

  return Object.freeze({
    dispatch,
    combatStarted,
    playerActionResolved,
    enemyActionResolved,
    lootGranted,
    mapMoved
  });
}

export function createGameFlowNavigator({ emitter, layoutTabs }) {
  const setActive = (value) => {
    if (layoutTabs?.setActive) {
      layoutTabs.setActive(value);
    }
  };

  const unsubscribeHandlers = [
    emitter.on(GameFlowEvent.CombatStarted, () => setActive("battle")),
    emitter.on(GameFlowEvent.LootGranted, () => setActive("inventory")),
    emitter.on(GameFlowEvent.MapMoved, () => setActive("map"))
  ];

  function destroy() {
    unsubscribeHandlers.forEach((unsubscribe) => unsubscribe());
  }

  return Object.freeze({
    destroy
  });
}
