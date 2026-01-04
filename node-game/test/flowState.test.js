import {
  createFlowState,
  FLOW_SCREENS,
  getFlowEntryPoint,
  getFlowScreenFromTab,
  isFlowScreen
} from "../public/ui/flowState.js";

describe("flow state", () => {
  it("recognizes valid flow screens", () => {
    expect(isFlowScreen(FLOW_SCREENS.COMBAT)).toBe(true);
    expect(isFlowScreen(FLOW_SCREENS.MAP)).toBe(true);
    expect(isFlowScreen("unknown")).toBe(false);
  });

  it("returns entry points for known screens", () => {
    expect(getFlowEntryPoint(FLOW_SCREENS.COMBAT)).toEqual({
      tabKey: "map",
      panelId: "tab-panel-map"
    });
    expect(getFlowEntryPoint("missing")).toBeNull();
  });

  it("resolves flow screens from tab keys", () => {
    expect(getFlowScreenFromTab("battle")).toBeNull();
    expect(getFlowScreenFromTab("map")).toBe(FLOW_SCREENS.MAP);
    expect(getFlowScreenFromTab("inventory")).toBe(FLOW_SCREENS.LOOT);
    expect(getFlowScreenFromTab()).toBeNull();
    expect(getFlowScreenFromTab("unknown")).toBeNull();
  });

  it("defaults to map when provided with an invalid initial screen", () => {
    const flowState = createFlowState({ initialScreen: "invalid" });

    expect(flowState.getState().screen).toBe(FLOW_SCREENS.MAP);
  });

  it("defaults to map when no initial screen is provided", () => {
    const flowState = createFlowState();

    expect(flowState.getState().screen).toBe(FLOW_SCREENS.MAP);
  });

  it("notifies subscribers when the screen changes", () => {
    const flowState = createFlowState({ initialScreen: FLOW_SCREENS.MAP });
    const calls = [];
    const listener = (nextState) => {
      calls.push(nextState);
    };
    const unsubscribe = flowState.subscribe(listener);

    flowState.setScreen(FLOW_SCREENS.MAP);
    flowState.setScreen(FLOW_SCREENS.LOOT, { source: "loot" });

    expect(calls).toHaveLength(1);
    expect(flowState.getState().screen).toBe(FLOW_SCREENS.LOOT);
    expect(flowState.getState().meta).toEqual({ source: "loot" });

    unsubscribe();
    flowState.setScreen(FLOW_SCREENS.COMBAT, { source: "next" });

    expect(calls).toHaveLength(1);
  });

  it("ignores invalid screen updates and non-function subscribers", () => {
    const flowState = createFlowState({ initialScreen: FLOW_SCREENS.MAP });
    const unsubscribe = flowState.subscribe();

    expect(flowState.setScreen("invalid")).toBe(false);
    expect(flowState.getState().screen).toBe(FLOW_SCREENS.MAP);

    unsubscribe();
  });
});
