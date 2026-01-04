export const GameFlowState = Object.freeze({
  MAP: "map",
  COMBAT: "combat",
  LOOT: "loot"
});

export const GameFlowEvent = Object.freeze({
  SHOW_MAP: "show_map",
  SHOW_COMBAT: "show_combat",
  SHOW_LOOT: "show_loot"
});

// Allowed transitions:
// MAP -> MAP, COMBAT
// COMBAT -> COMBAT, MAP, LOOT
// LOOT -> LOOT, MAP, COMBAT
const GAME_FLOW_TRANSITIONS = Object.freeze({
  [GameFlowState.MAP]: Object.freeze({
    [GameFlowEvent.SHOW_MAP]: GameFlowState.MAP,
    [GameFlowEvent.SHOW_COMBAT]: GameFlowState.COMBAT
  }),
  [GameFlowState.COMBAT]: Object.freeze({
    [GameFlowEvent.SHOW_COMBAT]: GameFlowState.COMBAT,
    [GameFlowEvent.SHOW_MAP]: GameFlowState.MAP,
    [GameFlowEvent.SHOW_LOOT]: GameFlowState.LOOT
  }),
  [GameFlowState.LOOT]: Object.freeze({
    [GameFlowEvent.SHOW_LOOT]: GameFlowState.LOOT,
    [GameFlowEvent.SHOW_MAP]: GameFlowState.MAP,
    [GameFlowEvent.SHOW_COMBAT]: GameFlowState.COMBAT
  })
});

export function canTransition(current, event) {
  return Boolean(GAME_FLOW_TRANSITIONS[current]?.[event]);
}

export function transition(current, event) {
  const next = GAME_FLOW_TRANSITIONS[current]?.[event];
  if (!next) {
    throw new Error(`Invalid game flow transition: ${current ?? "unknown"} -> ${event ?? "unknown"}.`);
  }
  return next;
}
