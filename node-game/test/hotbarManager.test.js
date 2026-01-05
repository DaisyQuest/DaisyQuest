import {
  buildHotbarDragPayloadFromElement,
  createHotbarDragHandlers,
  createHotbarState,
  normalizeHotbarSlots,
  parseHotbarDragPayload,
  resolveHotbarDrop
} from "../public/ui/hotbarManager.js";
import { jest } from "@jest/globals";

describe("hotbar manager", () => {
  function createDataTransfer(initial = {}) {
    const store = { ...initial };
    return {
      effectAllowed: "",
      dropEffect: "",
      getData: (type) => store[type] ?? "",
      setData: (type, value) => {
        store[type] = value;
      }
    };
  }

  test("normalizes hotbar slot lists", () => {
    expect(normalizeHotbarSlots(["attack", null], 4)).toEqual([
      "attack",
      null,
      null,
      null
    ]);
    expect(normalizeHotbarSlots(["a", "b", "c", "d", "e"], 4)).toEqual([
      "a",
      "b",
      "c",
      "d"
    ]);
    expect(normalizeHotbarSlots(null, 2)).toEqual([null, null]);
  });

  test("builds hotbar state updates and respects combat lock", () => {
    const state = createHotbarState({ slots: ["attack", null, null, null], size: 4 });
    expect(state.setSlot(1, "heal").slots).toEqual([
      "attack",
      "heal",
      null,
      null
    ]);
    expect(state.moveSlot(0, 2).slots).toEqual([
      null,
      "heal",
      "attack",
      null
    ]);
    state.setCombatLocked(true);
    expect(state.setSlot(0, "special").error).toBe("Combat locked.");
    expect(state.moveSlot(0, 1).error).toBe("Combat locked.");
    expect(state.setSlot(9, "heal").error).toBe("Combat locked.");
    state.setCombatLocked(false);
    expect(state.setSlot(-1, "heal").error).toBe("Invalid slot.");
    expect(state.moveSlot(1, 9).error).toBe("Invalid slot.");
    const sameSlot = state.moveSlot(1, 1);
    expect(sameSlot.slots).toEqual(state.getSlots());
  });

  test("builds drag payloads from elements", () => {
    expect(buildHotbarDragPayloadFromElement(null)).toBeNull();
    expect(buildHotbarDragPayloadFromElement({ dataset: {} })).toBeNull();
    expect(
      buildHotbarDragPayloadFromElement({
        dataset: { spellId: "heal", spellbook: "spells" }
      })
    ).toEqual({ source: "spellbook", actionId: "heal", book: "spells" });
    expect(
      buildHotbarDragPayloadFromElement({ dataset: { hotbarSlot: "2" } })
    ).toEqual({ source: "hotbar", slotIndex: 2 });
    expect(
      buildHotbarDragPayloadFromElement({ dataset: { hotbarSlot: "bad" } })
    ).toBeNull();
  });

  test("parses drag payloads", () => {
    expect(parseHotbarDragPayload(null)).toBeNull();
    const invalidTransfer = createDataTransfer({ "text/plain": "not-json" });
    expect(parseHotbarDragPayload(invalidTransfer)).toBeNull();
    const nullTransfer = createDataTransfer({ "application/json": "null" });
    expect(parseHotbarDragPayload(nullTransfer)).toBeNull();
    const unknownTransfer = createDataTransfer({
      "application/json": JSON.stringify({ source: "unknown" })
    });
    expect(parseHotbarDragPayload(unknownTransfer)).toBeNull();
    const spellTransfer = createDataTransfer({
      "application/json": JSON.stringify({ source: "spellbook", actionId: "heal" })
    });
    expect(parseHotbarDragPayload(spellTransfer)).toEqual({
      source: "spellbook",
      actionId: "heal"
    });
    const hotbarTransfer = createDataTransfer({
      "application/json": JSON.stringify({ source: "hotbar", slotIndex: 1 })
    });
    expect(parseHotbarDragPayload(hotbarTransfer)).toEqual({
      source: "hotbar",
      slotIndex: 1
    });
  });

  test("resolves drop actions", () => {
    const lockedState = createHotbarState({
      slots: ["attack", null, null, null],
      size: 4,
      isCombatLocked: () => true
    });
    expect(
      resolveHotbarDrop({
        state: lockedState,
        payload: { source: "spellbook", actionId: "heal" },
        targetIndex: 0
      }).error
    ).toBe("Combat locked.");
    const state = createHotbarState({ slots: ["attack", null, null, null], size: 4 });
    expect(resolveHotbarDrop({ state, payload: null, targetIndex: 0 }).error).toBe(
      "Missing drag payload."
    );
    expect(
      resolveHotbarDrop({ state, payload: { source: "spellbook", actionId: "heal" } })
        .error
    ).toBe("Invalid slot.");
    expect(
      resolveHotbarDrop({
        state,
        payload: { source: "spellbook", actionId: "heal" },
        targetIndex: 1
      }).slots
    ).toEqual(["attack", "heal", null, null]);
    expect(
      resolveHotbarDrop({
        state,
        payload: { source: "hotbar", slotIndex: 0 },
        targetIndex: 2
      }).slots
    ).toEqual([null, "heal", "attack", null]);
    expect(
      resolveHotbarDrop({
        state,
        payload: { source: "mystery" },
        targetIndex: 0
      }).error
    ).toBe("Unknown drag source.");
  });

  test("handles drag events for success and rejection cases", () => {
    const state = createHotbarState({ slots: ["attack", null, null, null], size: 4 });
    const onUpdate = jest.fn();
    const onReject = jest.fn();
    const handlers = createHotbarDragHandlers({ state, onUpdate, onReject });

    const spellItem = { dataset: { spellId: "heal", spellbook: "spells" } };
    const startEvent = { currentTarget: spellItem, dataTransfer: createDataTransfer() };
    handlers.handleDragStart(startEvent);
    expect(startEvent.dataTransfer.getData("application/json")).toContain("spellbook");

    const target = { dataset: { hotbarSlot: "1" } };
    const overEvent = { currentTarget: target, dataTransfer: createDataTransfer() };
    overEvent.preventDefault = jest.fn();
    handlers.handleDragOver(overEvent);
    expect(overEvent.preventDefault).toHaveBeenCalled();

    const dropEvent = {
      currentTarget: target,
      dataTransfer: createDataTransfer({
        "application/json": JSON.stringify({ source: "spellbook", actionId: "heal" })
      }),
      preventDefault: jest.fn()
    };
    handlers.handleDrop(dropEvent);
    expect(onUpdate).toHaveBeenCalledWith(["attack", "heal", null, null]);

    state.setCombatLocked(true);
    const lockedDropEvent = {
      currentTarget: target,
      dataTransfer: createDataTransfer({
        "application/json": JSON.stringify({ source: "spellbook", actionId: "special" })
      }),
      preventDefault: jest.fn()
    };
    handlers.handleDrop(lockedDropEvent);
    expect(onReject).toHaveBeenCalledWith({ error: "Combat locked." });

    state.setCombatLocked(false);
    const emptyDropEvent = {
      currentTarget: target,
      dataTransfer: createDataTransfer(),
      preventDefault: jest.fn()
    };
    handlers.handleDrop(emptyDropEvent);
    expect(onReject).toHaveBeenCalledWith({ error: "Missing drag payload." });

    state.setCombatLocked(true);
    const lockedOverEvent = { currentTarget: target, dataTransfer: createDataTransfer() };
    lockedOverEvent.preventDefault = jest.fn();
    handlers.handleDragOver(lockedOverEvent);
    expect(lockedOverEvent.preventDefault).not.toHaveBeenCalled();

    state.setCombatLocked(false);
    const invalidOverEvent = { currentTarget: { dataset: {} } };
    invalidOverEvent.preventDefault = jest.fn();
    handlers.handleDragOver(invalidOverEvent);
    expect(invalidOverEvent.preventDefault).not.toHaveBeenCalled();

    const badStartEvent = { currentTarget: null };
    handlers.handleDragStart(badStartEvent);
  });
});
