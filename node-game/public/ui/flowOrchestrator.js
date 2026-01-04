export const FlowState = Object.freeze({
  MAP: "map",
  COMBAT: "combat",
  LOOT: "loot",
  INVENTORY: "inventory",
  CRAFTING: "crafting",
  TRADING: "trading",
  REGISTRY: "registry"
});

export const FlowEvent = Object.freeze({
  NAVIGATE: "navigate",
  SESSION_INITIALIZED: "session_initialized",
  COMBAT_STARTED: "combat_started",
  COMBAT_ENDED: "combat_ended",
  LOOT_COLLECTED: "loot_collected"
});

const FLOW_STATES = new Set(Object.values(FlowState));
const NAVIGABLE_STATES = new Set([
  FlowState.MAP,
  FlowState.COMBAT,
  FlowState.INVENTORY,
  FlowState.CRAFTING,
  FlowState.TRADING,
  FlowState.REGISTRY
]);

function isFlowState(value) {
  return FLOW_STATES.has(value);
}

function resolveNavigate(event) {
  if (!event?.targetState) {
    return { error: "Navigation requires a target state." };
  }
  if (!isFlowState(event.targetState)) {
    return { error: `Unknown flow state "${event.targetState}".` };
  }
  if (!NAVIGABLE_STATES.has(event.targetState)) {
    return { error: `State "${event.targetState}" is not directly navigable.` };
  }
  return { nextState: event.targetState };
}

function resolveSessionInitialized(event) {
  if (typeof event?.hasActiveCombat !== "boolean") {
    return { error: "Session initialization requires hasActiveCombat." };
  }
  if (typeof event?.hasLoot !== "boolean") {
    return { error: "Session initialization requires hasLoot." };
  }
  if (event.hasActiveCombat) {
    return { nextState: FlowState.COMBAT };
  }
  if (event.hasLoot) {
    return { nextState: FlowState.LOOT };
  }
  return { nextState: FlowState.MAP };
}

function resolveCombatStarted(currentState, event) {
  if (currentState === FlowState.COMBAT) {
    return { error: "Combat is already active." };
  }
  if (!event?.enemyId) {
    return { error: "Combat start requires an enemyId." };
  }
  return { nextState: FlowState.COMBAT, meta: { enemyId: event.enemyId } };
}

function resolveCombatEnded(currentState, event) {
  if (currentState !== FlowState.COMBAT) {
    return { error: "Combat can only end from the combat state." };
  }
  if (typeof event?.victory !== "boolean") {
    return { error: "Combat end requires victory outcome." };
  }
  if (typeof event?.lootAvailable !== "boolean") {
    return { error: "Combat end requires loot availability." };
  }
  return { nextState: event.lootAvailable ? FlowState.LOOT : FlowState.MAP };
}

function resolveLootCollected(currentState) {
  if (currentState !== FlowState.LOOT) {
    return { error: "Loot can only be collected from the loot state." };
  }
  return { nextState: FlowState.MAP };
}

export function createFlowOrchestrator({
  initialState = FlowState.MAP,
  onTransition,
  onInvalidTransition
} = {}) {
  let currentState = isFlowState(initialState) ? initialState : FlowState.MAP;

  function handleInvalid(error, event) {
    onInvalidTransition?.({
      error,
      event,
      state: currentState
    });
    return { error, state: currentState };
  }

  function applyTransition(nextState, event, meta) {
    const previous = currentState;
    currentState = nextState;
    if (event?.force || previous !== nextState) {
      onTransition?.({
        from: previous,
        to: nextState,
        event,
        meta
      });
    }
    return { state: currentState };
  }

  function requestTransition(event) {
    if (!event?.type) {
      return handleInvalid("Transition event type is required.", event);
    }
    switch (event.type) {
      case FlowEvent.NAVIGATE: {
        const resolved = resolveNavigate(event);
        if (resolved.error) {
          return handleInvalid(resolved.error, event);
        }
        return applyTransition(resolved.nextState, event, resolved.meta);
      }
      case FlowEvent.SESSION_INITIALIZED: {
        const resolved = resolveSessionInitialized(event);
        if (resolved.error) {
          return handleInvalid(resolved.error, event);
        }
        return applyTransition(resolved.nextState, event, resolved.meta);
      }
      case FlowEvent.COMBAT_STARTED: {
        const resolved = resolveCombatStarted(currentState, event);
        if (resolved.error) {
          return handleInvalid(resolved.error, event);
        }
        return applyTransition(resolved.nextState, event, resolved.meta);
      }
      case FlowEvent.COMBAT_ENDED: {
        const resolved = resolveCombatEnded(currentState, event);
        if (resolved.error) {
          return handleInvalid(resolved.error, event);
        }
        return applyTransition(resolved.nextState, event, resolved.meta);
      }
      case FlowEvent.LOOT_COLLECTED: {
        const resolved = resolveLootCollected(currentState);
        if (resolved.error) {
          return handleInvalid(resolved.error, event);
        }
        return applyTransition(resolved.nextState, event, resolved.meta);
      }
      default:
        return handleInvalid(`Unknown transition event "${event.type}".`, event);
    }
  }

  return Object.freeze({
    getState() {
      return currentState;
    },
    requestTransition
  });
}
