export const FLOW_SCREENS = Object.freeze({
  COMBAT: "combat",
  MAP: "map",
  LOOT: "loot"
});

export const FLOW_SCREEN_ENTRY_POINTS = Object.freeze({
  [FLOW_SCREENS.COMBAT]: { tabKey: "battle", panelId: "tab-panel-battle" },
  [FLOW_SCREENS.MAP]: { tabKey: "map", panelId: "tab-panel-map" },
  [FLOW_SCREENS.LOOT]: { tabKey: "inventory", panelId: "tab-panel-inventory" }
});

export function isFlowScreen(value) {
  return Object.values(FLOW_SCREENS).includes(value);
}

export function getFlowEntryPoint(screen) {
  return FLOW_SCREEN_ENTRY_POINTS[screen] ?? null;
}

export function getFlowScreenFromTab(tabKey) {
  if (!tabKey) {
    return null;
  }
  const match = Object.entries(FLOW_SCREEN_ENTRY_POINTS).find(
    ([, entry]) => entry.tabKey === tabKey
  );
  return match ? match[0] : null;
}

export function createFlowState({ initialScreen = FLOW_SCREENS.COMBAT } = {}) {
  const normalized = isFlowScreen(initialScreen) ? initialScreen : FLOW_SCREENS.COMBAT;
  let state = { screen: normalized, meta: null };
  const listeners = new Set();

  function notify() {
    listeners.forEach((listener) => listener(state));
  }

  function getState() {
    return state;
  }

  function setScreen(nextScreen, meta = null) {
    if (!isFlowScreen(nextScreen)) {
      return false;
    }
    const nextMeta = meta && Object.keys(meta).length ? { ...meta } : null;
    if (state.screen === nextScreen && state.meta === nextMeta) {
      return true;
    }
    state = { screen: nextScreen, meta: nextMeta };
    notify();
    return true;
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      return () => {};
    }
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return Object.freeze({
    getState,
    setScreen,
    subscribe
  });
}
