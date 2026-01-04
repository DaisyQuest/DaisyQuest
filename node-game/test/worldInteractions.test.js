import {
  buildContextMenuOptions,
  resolveContextAction,
  resolveContextMenu,
  resolveInteractionAction,
  resolveTopCandidate,
  sanitizeCandidates
} from "../src/server/worldInteractions.js";

describe("world interaction service", () => {
  test("sanitizes candidates to supported types and numeric layers", () => {
    const sanitized = sanitizeCandidates([
      { id: "a", type: "npc", layer: 5 },
      { id: 42, type: "player", layer: "bad" },
      { id: "ignored", type: "unknown", layer: 9 }
    ]);

    expect(sanitized).toEqual([
      { id: "a", type: "npc", layer: 5 },
      { id: null, type: "player", layer: 0 }
    ]);
  });

  test("resolves top candidate by layer", () => {
    const top = resolveTopCandidate([
      { id: "low", type: "object", layer: 1 },
      { id: "high", type: "npc", layer: 8 }
    ]);
    expect(top).toEqual({ id: "high", type: "npc", layer: 8 });
    expect(resolveTopCandidate([])).toBeNull();
  });

  test("builds context menu options for all target combinations", () => {
    const cases = [
      { player: false, npc: false, object: false, expected: [] },
      { player: true, npc: false, object: false, expected: ["inspect", "trade", "combat"] },
      { player: false, npc: true, object: false, expected: ["inspect", "combat"] },
      { player: false, npc: false, object: true, expected: ["inspect", "interact"] },
      {
        player: true,
        npc: true,
        object: false,
        expected: ["inspect", "trade", "combat"]
      },
      {
        player: true,
        npc: false,
        object: true,
        expected: ["inspect", "trade", "combat", "interact"]
      },
      {
        player: false,
        npc: true,
        object: true,
        expected: ["inspect", "combat", "interact"]
      },
      {
        player: true,
        npc: true,
        object: true,
        expected: ["inspect", "trade", "combat", "interact"]
      }
    ];

    cases.forEach(({ player, npc, object, expected }) => {
      const candidates = [];
      if (player) {
        candidates.push({ id: "player", type: "player", layer: 3 });
      }
      if (npc) {
        candidates.push({ id: "npc", type: "npc", layer: 3 });
      }
      if (object) {
        candidates.push({ id: "object", type: "object", layer: 2 });
      }
      expect(buildContextMenuOptions(candidates)).toEqual(expected);
    });
  });

  test("resolves interaction action for terrain and targets", () => {
    const moveResult = resolveInteractionAction({
      clickType: "primary",
      candidates: [{ id: "terrain", type: "terrain", layer: 0 }]
    });
    expect(moveResult).toEqual({
      action: "move",
      resolvedTarget: { id: "terrain", type: "terrain", layer: 0 }
    });

    const interactResult = resolveInteractionAction({
      clickType: "primary",
      candidates: [{ id: "enemy", type: "npc", layer: 3 }]
    });
    expect(interactResult).toEqual({
      action: "interact",
      resolvedTarget: { id: "enemy", type: "npc", layer: 3 }
    });
  });

  test("rejects unsupported click types", () => {
    expect(() => resolveInteractionAction({ clickType: "secondary", candidates: [] })).toThrow(
      "Unsupported click type."
    );
  });

  test("rejects invalid context menu options", () => {
    expect(() => resolveContextAction({ option: "invalid", candidates: [] })).toThrow(
      "Unknown context menu option."
    );
  });

  test("rejects options that are not valid for current targets", () => {
    expect(() =>
      resolveContextAction({
        option: "trade",
        candidates: [{ id: "npc", type: "npc", layer: 2 }]
      })
    ).toThrow("Invalid context menu option for current targets.");
  });

  test("resolves context menu and action for valid options", () => {
    const menu = resolveContextMenu({
      candidates: [{ id: "player", type: "player", layer: 4 }]
    });
    expect(menu).toEqual({
      resolvedTarget: { id: "player", type: "player", layer: 4 },
      options: ["inspect", "trade", "combat"]
    });

    const action = resolveContextAction({
      option: "inspect",
      candidates: [{ id: "player", type: "player", layer: 4 }]
    });
    expect(action).toEqual({
      selectedOption: "inspect",
      resolvedTarget: { id: "player", type: "player", layer: 4 }
    });
  });
});
