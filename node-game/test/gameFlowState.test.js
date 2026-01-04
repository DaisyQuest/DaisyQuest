import {
  GameFlowEvent,
  GameFlowState,
  canTransition,
  transition
} from "../public/state/gameFlow.js";

describe("game flow state machine", () => {
  const transitions = {
    [GameFlowState.MAP]: {
      [GameFlowEvent.SHOW_MAP]: GameFlowState.MAP,
      [GameFlowEvent.SHOW_COMBAT]: GameFlowState.COMBAT
    },
    [GameFlowState.COMBAT]: {
      [GameFlowEvent.SHOW_COMBAT]: GameFlowState.COMBAT,
      [GameFlowEvent.SHOW_MAP]: GameFlowState.MAP,
      [GameFlowEvent.SHOW_LOOT]: GameFlowState.LOOT
    },
    [GameFlowState.LOOT]: {
      [GameFlowEvent.SHOW_LOOT]: GameFlowState.LOOT,
      [GameFlowEvent.SHOW_MAP]: GameFlowState.MAP,
      [GameFlowEvent.SHOW_COMBAT]: GameFlowState.COMBAT
    }
  };

  const states = Object.values(GameFlowState);
  const events = Object.values(GameFlowEvent);

  test("canTransition reports all allowed transitions", () => {
    states.forEach((state) => {
      events.forEach((event) => {
        const expected = transitions[state]?.[event] ?? null;
        expect(canTransition(state, event)).toBe(Boolean(expected));
      });
    });
  });

  test("transition resolves allowed transitions and rejects invalid paths", () => {
    states.forEach((state) => {
      events.forEach((event) => {
        const expected = transitions[state]?.[event] ?? null;
        if (expected) {
          expect(transition(state, event)).toBe(expected);
        } else {
          expect(() => transition(state, event)).toThrow(
            `Invalid game flow transition: ${state} -> ${event}.`
          );
        }
      });
    });
  });

  test("transition reports unknown inputs when state or event is missing", () => {
    expect(() => transition(null, GameFlowEvent.SHOW_MAP)).toThrow(
      "Invalid game flow transition: unknown -> show_map."
    );
    expect(() => transition(GameFlowState.MAP, null)).toThrow(
      "Invalid game flow transition: map -> unknown."
    );
    expect(canTransition(null, GameFlowEvent.SHOW_MAP)).toBe(false);
    expect(canTransition(GameFlowState.MAP, null)).toBe(false);
  });
});
