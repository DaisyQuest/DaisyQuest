import { jest } from "@jest/globals";
import { JSDOM } from "jsdom";
import {
  GameFlowEvent,
  createGameFlowActions,
  createGameFlowEmitter,
  createGameFlowNavigator
} from "../public/ui/gameFlow.js";
import { createTabController } from "../public/ui/tabController.js";

describe("game flow emitter", () => {
  it("emits events to listeners and supports unsubscribe", () => {
    const emitter = createGameFlowEmitter();
    const handler = jest.fn();
    const unsubscribe = emitter.on(GameFlowEvent.MapMoved, handler);

    emitter.emit(GameFlowEvent.MapMoved, { movement: { moved: true } });

    expect(handler).toHaveBeenCalledTimes(1);

    unsubscribe();
    emitter.emit(GameFlowEvent.MapMoved, { movement: { moved: false } });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("ignores emits when no listeners are registered", () => {
    const emitter = createGameFlowEmitter();

    expect(() => emitter.emit(GameFlowEvent.CombatStarted, { npcId: "npc-1" })).not.toThrow();
  });

  it("returns a noop unsubscribe when the handler is invalid", () => {
    const emitter = createGameFlowEmitter();

    const unsubscribe = emitter.on(GameFlowEvent.LootGranted, null);

    expect(typeof unsubscribe).toBe("function");
    expect(() => unsubscribe()).not.toThrow();
  });

  it("ignores removals for unknown listeners", () => {
    const emitter = createGameFlowEmitter();

    expect(() =>
      emitter.off(GameFlowEvent.PlayerActionResolved, () => {})
    ).not.toThrow();
  });

  it("drops listeners when the last handler is removed", () => {
    const emitter = createGameFlowEmitter();
    const handler = jest.fn();

    emitter.on(GameFlowEvent.CombatStarted, handler);
    emitter.off(GameFlowEvent.CombatStarted, handler);
    emitter.emit(GameFlowEvent.CombatStarted, { npcId: "npc-1" });

    expect(handler).not.toHaveBeenCalled();
  });

  it("clears event buckets after removing all handlers", () => {
    const emitter = createGameFlowEmitter();
    const handlerA = jest.fn();
    const handlerB = jest.fn();

    emitter.on(GameFlowEvent.MapMoved, handlerA);
    emitter.on(GameFlowEvent.MapMoved, handlerB);
    emitter.off(GameFlowEvent.MapMoved, handlerA);
    emitter.off(GameFlowEvent.MapMoved, handlerB);
    emitter.emit(GameFlowEvent.MapMoved, { movement: { moved: true } });

    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).not.toHaveBeenCalled();
  });
});

describe("game flow actions", () => {
  it("dispatches combat, player, enemy, loot, and map events", () => {
    const emitter = createGameFlowEmitter();
    const actions = createGameFlowActions({ emitter });
    const events = [];

    Object.values(GameFlowEvent).forEach((event) => {
      emitter.on(event, (payload) => events.push({ event, payload }));
    });

    actions.combatStarted({ npcId: "npc-1", reason: "player" });
    actions.playerActionResolved({ battleEvent: { action: "attack" } });
    actions.enemyActionResolved({ action: "attack", damage: 5 });
    actions.lootGranted(["Looted Ember"]);
    actions.mapMoved({ moved: true, to: { x: 2, y: 3 } });

    expect(events).toEqual([
      {
        event: GameFlowEvent.CombatStarted,
        payload: { npcId: "npc-1", reason: "player" }
      },
      {
        event: GameFlowEvent.PlayerActionResolved,
        payload: { payload: { battleEvent: { action: "attack" } } }
      },
      {
        event: GameFlowEvent.EnemyActionResolved,
        payload: { battleEvent: { action: "attack", damage: 5 } }
      },
      {
        event: GameFlowEvent.LootGranted,
        payload: { loot: ["Looted Ember"] }
      },
      {
        event: GameFlowEvent.MapMoved,
        payload: { movement: { moved: true, to: { x: 2, y: 3 } } }
      }
    ]);
  });

  it("skips enemy and loot events when there is nothing to report", () => {
    const emitter = createGameFlowEmitter();
    const actions = createGameFlowActions({ emitter });
    const enemyHandler = jest.fn();
    const lootHandler = jest.fn();

    emitter.on(GameFlowEvent.EnemyActionResolved, enemyHandler);
    emitter.on(GameFlowEvent.LootGranted, lootHandler);

    actions.enemyActionResolved(null);
    actions.lootGranted(null);
    actions.lootGranted([]);

    expect(enemyHandler).not.toHaveBeenCalled();
    expect(lootHandler).not.toHaveBeenCalled();
  });

  it("uses default combat metadata when no payload is provided", () => {
    const emitter = createGameFlowEmitter();
    const actions = createGameFlowActions({ emitter });
    const handler = jest.fn();

    emitter.on(GameFlowEvent.CombatStarted, handler);

    actions.combatStarted();

    expect(handler).toHaveBeenCalledWith({ npcId: null, reason: "player" });
  });
});

describe("game flow navigation", () => {
  function setupDom() {
    const dom = new JSDOM(
      `
        <button class="layout-tab-button is-active" data-tab-target="map"></button>
        <button class="layout-tab-button" data-tab-target="combat"></button>
        <button class="layout-tab-button" data-tab-target="inventory"></button>
        <section data-tab-panel="map"></section>
        <section data-tab-panel="combat"></section>
        <section data-tab-panel="inventory"></section>
      `
    );
    const doc = dom.window.document;
    const buttons = doc.querySelectorAll(".layout-tab-button");
    const panels = doc.querySelectorAll("[data-tab-panel]");
    const layoutTabs = createTabController({
      buttons,
      panels,
      buttonKey: "tabTarget",
      panelKey: "tabPanel"
    });

    layoutTabs.wire();

    return { doc, layoutTabs };
  }

  function expectActive(doc, value) {
    const button = doc.querySelector(`[data-tab-target="${value}"]`);
    const panel = doc.querySelector(`[data-tab-panel="${value}"]`);

    expect(button.classList.contains("is-active")).toBe(true);
    expect(panel.classList.contains("is-active")).toBe(true);
    expect(panel.hidden).toBe(false);
  }

  it("keeps the Map → Combat → Loot → Map flow consistent", () => {
    const { doc, layoutTabs } = setupDom();
    const emitter = createGameFlowEmitter();

    createGameFlowNavigator({ emitter, layoutTabs });

    emitter.emit(GameFlowEvent.MapMoved, { movement: { moved: true } });
    expectActive(doc, "map");

    emitter.emit(GameFlowEvent.CombatStarted, { npcId: "npc-2" });
    expectActive(doc, "combat");

    emitter.emit(GameFlowEvent.LootGranted, { loot: ["Looted Ember"] });
    expectActive(doc, "inventory");

    emitter.emit(GameFlowEvent.MapMoved, { movement: { moved: true } });
    expectActive(doc, "map");
  });

  it("stops responding after the navigator is destroyed", () => {
    const { doc, layoutTabs } = setupDom();
    const emitter = createGameFlowEmitter();
    const navigator = createGameFlowNavigator({ emitter, layoutTabs });

    emitter.emit(GameFlowEvent.MapMoved, { movement: { moved: true } });
    expectActive(doc, "map");

    navigator.destroy();
    emitter.emit(GameFlowEvent.CombatStarted, { npcId: "npc-3" });

    expectActive(doc, "map");
  });

  it("ignores navigation events when no tab controller is provided", () => {
    const emitter = createGameFlowEmitter();

    expect(() => createGameFlowNavigator({ emitter, layoutTabs: null })).not.toThrow();
    expect(() => emitter.emit(GameFlowEvent.MapMoved, { movement: { moved: true } })).not.toThrow();
  });
});
