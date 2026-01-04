import { jest } from "@jest/globals";
import { createFlowOrchestrator, FlowEvent, FlowState } from "../public/ui/flowOrchestrator.js";

describe("flow orchestrator", () => {
  it("navigates to a valid UI state", () => {
    const transitions = [];
    const orchestrator = createFlowOrchestrator({
      initialState: FlowState.MAP,
      onTransition: (payload) => transitions.push(payload)
    });

    const result = orchestrator.requestTransition({
      type: FlowEvent.NAVIGATE,
      targetState: FlowState.INVENTORY
    });

    expect(result.state).toBe(FlowState.INVENTORY);
    expect(orchestrator.getState()).toBe(FlowState.INVENTORY);
    expect(transitions).toHaveLength(1);
    expect(transitions[0].from).toBe(FlowState.MAP);
    expect(transitions[0].to).toBe(FlowState.INVENTORY);
  });

  it("rejects navigation without a target", () => {
    const invalid = jest.fn();
    const orchestrator = createFlowOrchestrator({
      onInvalidTransition: invalid
    });

    const result = orchestrator.requestTransition({
      type: FlowEvent.NAVIGATE
    });

    expect(result.error).toBe("Navigation requires a target state.");
    expect(result.state).toBe(FlowState.MAP);
    expect(invalid).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Navigation requires a target state." })
    );
  });

  it("rejects navigation to unknown or non-navigable states", () => {
    const orchestrator = createFlowOrchestrator();

    const unknown = orchestrator.requestTransition({
      type: FlowEvent.NAVIGATE,
      targetState: "unknown"
    });
    const loot = orchestrator.requestTransition({
      type: FlowEvent.NAVIGATE,
      targetState: FlowState.LOOT
    });

    expect(unknown.error).toBe('Unknown flow state "unknown".');
    expect(loot.error).toBe('State "loot" is not directly navigable.');
  });

  it("requires enemy details to start combat", () => {
    const orchestrator = createFlowOrchestrator();

    const result = orchestrator.requestTransition({
      type: FlowEvent.COMBAT_STARTED
    });

    expect(result.error).toBe("Combat start requires an enemyId.");
    expect(orchestrator.getState()).toBe(FlowState.MAP);
  });

  it("moves into combat when combat starts from another state", () => {
    const orchestrator = createFlowOrchestrator({
      initialState: FlowState.INVENTORY
    });

    const result = orchestrator.requestTransition({
      type: FlowEvent.COMBAT_STARTED,
      enemyId: "slime"
    });

    expect(result.state).toBe(FlowState.COMBAT);
  });

  it("rejects combat start when already in combat", () => {
    const orchestrator = createFlowOrchestrator({
      initialState: FlowState.COMBAT
    });

    const result = orchestrator.requestTransition({
      type: FlowEvent.COMBAT_STARTED,
      enemyId: "slime"
    });

    expect(result.error).toBe("Combat is already active.");
  });

  it("moves from combat to loot or map after combat ends", () => {
    const orchestrator = createFlowOrchestrator({
      initialState: FlowState.COMBAT
    });

    const lootResult = orchestrator.requestTransition({
      type: FlowEvent.COMBAT_ENDED,
      victory: true,
      lootAvailable: true
    });
    const mapResult = orchestrator.requestTransition({
      type: FlowEvent.COMBAT_STARTED,
      enemyId: "slime"
    });
    const endResult = orchestrator.requestTransition({
      type: FlowEvent.COMBAT_ENDED,
      victory: false,
      lootAvailable: false
    });

    expect(lootResult.state).toBe(FlowState.LOOT);
    expect(mapResult.state).toBe(FlowState.COMBAT);
    expect(endResult.state).toBe(FlowState.MAP);
  });

  it("rejects combat end events without required data", () => {
    const orchestrator = createFlowOrchestrator({
      initialState: FlowState.COMBAT
    });

    const missingVictory = orchestrator.requestTransition({
      type: FlowEvent.COMBAT_ENDED,
      lootAvailable: true
    });
    const missingLoot = orchestrator.requestTransition({
      type: FlowEvent.COMBAT_ENDED,
      victory: true
    });

    expect(missingVictory.error).toBe("Combat end requires victory outcome.");
    expect(missingLoot.error).toBe("Combat end requires loot availability.");
  });

  it("rejects combat end when not in combat", () => {
    const orchestrator = createFlowOrchestrator({
      initialState: FlowState.MAP
    });

    const result = orchestrator.requestTransition({
      type: FlowEvent.COMBAT_ENDED,
      victory: true,
      lootAvailable: false
    });

    expect(result.error).toBe("Combat can only end from the combat state.");
  });

  it("moves from loot to map when loot is collected", () => {
    const orchestrator = createFlowOrchestrator({
      initialState: FlowState.LOOT
    });

    const result = orchestrator.requestTransition({
      type: FlowEvent.LOOT_COLLECTED
    });

    expect(result.state).toBe(FlowState.MAP);
  });

  it("rejects loot collection outside of loot state", () => {
    const orchestrator = createFlowOrchestrator({
      initialState: FlowState.MAP
    });

    const result = orchestrator.requestTransition({
      type: FlowEvent.LOOT_COLLECTED
    });

    expect(result.error).toBe("Loot can only be collected from the loot state.");
  });

  it("resolves session initialization based on combat/loot flags", () => {
    const orchestrator = createFlowOrchestrator({
      initialState: FlowState.MAP
    });

    const combatResult = orchestrator.requestTransition({
      type: FlowEvent.SESSION_INITIALIZED,
      hasActiveCombat: true,
      hasLoot: false
    });
    const lootResult = orchestrator.requestTransition({
      type: FlowEvent.SESSION_INITIALIZED,
      hasActiveCombat: false,
      hasLoot: true
    });
    const mapResult = orchestrator.requestTransition({
      type: FlowEvent.SESSION_INITIALIZED,
      hasActiveCombat: false,
      hasLoot: false
    });

    expect(combatResult.state).toBe(FlowState.COMBAT);
    expect(lootResult.state).toBe(FlowState.LOOT);
    expect(mapResult.state).toBe(FlowState.MAP);
  });

  it("requires explicit session initialization flags", () => {
    const orchestrator = createFlowOrchestrator();

    const missingCombatFlag = orchestrator.requestTransition({
      type: FlowEvent.SESSION_INITIALIZED,
      hasLoot: false
    });
    const missingLootFlag = orchestrator.requestTransition({
      type: FlowEvent.SESSION_INITIALIZED,
      hasActiveCombat: false
    });

    expect(missingCombatFlag.error).toBe(
      "Session initialization requires hasActiveCombat."
    );
    expect(missingLootFlag.error).toBe("Session initialization requires hasLoot.");
  });

  it("fires transitions on forced events even without state changes", () => {
    const transitions = [];
    const orchestrator = createFlowOrchestrator({
      initialState: FlowState.MAP,
      onTransition: (payload) => transitions.push(payload)
    });

    const result = orchestrator.requestTransition({
      type: FlowEvent.NAVIGATE,
      targetState: FlowState.MAP,
      force: true
    });

    expect(result.state).toBe(FlowState.MAP);
    expect(transitions).toHaveLength(1);
    expect(transitions[0].from).toBe(FlowState.MAP);
    expect(transitions[0].to).toBe(FlowState.MAP);
  });

  it("rejects unknown events", () => {
    const orchestrator = createFlowOrchestrator();

    const result = orchestrator.requestTransition({ type: "mystery" });

    expect(result.error).toBe('Unknown transition event "mystery".');
  });

  it("rejects missing event types", () => {
    const orchestrator = createFlowOrchestrator();

    const result = orchestrator.requestTransition(null);

    expect(result.error).toBe("Transition event type is required.");
  });

  it("defaults unknown initial states to map", () => {
    const orchestrator = createFlowOrchestrator({
      initialState: "mystery"
    });

    expect(orchestrator.getState()).toBe(FlowState.MAP);
  });

  it("does not fire transitions when staying in the same state without force", () => {
    const transitions = [];
    const orchestrator = createFlowOrchestrator({
      initialState: FlowState.MAP,
      onTransition: (payload) => transitions.push(payload)
    });

    orchestrator.requestTransition({
      type: FlowEvent.NAVIGATE,
      targetState: FlowState.MAP
    });

    expect(transitions).toHaveLength(0);
  });
});
