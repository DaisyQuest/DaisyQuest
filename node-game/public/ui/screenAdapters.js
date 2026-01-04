import { FLOW_SCREENS, getFlowEntryPoint } from "./flowState.js";

function createScreenAdapter({ flowState, tabController, screen }) {
  const entryPoint = getFlowEntryPoint(screen);
  if (!flowState || !tabController || !entryPoint) {
    return Object.freeze({
      destroy() {},
      sync() {}
    });
  }

  function sync(nextState) {
    if (nextState?.screen !== screen) {
      return;
    }
    tabController.setActive(entryPoint.tabKey);
  }

  const unsubscribe = flowState.subscribe(sync);
  sync(flowState.getState());

  return Object.freeze({
    destroy() {
      unsubscribe?.();
    },
    sync() {
      sync(flowState.getState());
    }
  });
}

export function createCombatScreenAdapter({ flowState, tabController } = {}) {
  return createScreenAdapter({ flowState, tabController, screen: FLOW_SCREENS.COMBAT });
}

export function createMapScreenAdapter({ flowState, tabController } = {}) {
  return createScreenAdapter({ flowState, tabController, screen: FLOW_SCREENS.MAP });
}

export function createLootScreenAdapter({ flowState, tabController } = {}) {
  return createScreenAdapter({ flowState, tabController, screen: FLOW_SCREENS.LOOT });
}
