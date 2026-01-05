import { JSDOM } from "jsdom";
import { renderInteractionPanel, resolveInteractionPanelState } from "../public/ui/interactionPanel.js";

describe("interaction panel", () => {
  test("returns default state when no target is selected", () => {
    const state = resolveInteractionPanelState();
    expect(state.summary).toMatch(/No target selected/);
    expect(state.actions.engage.enabled).toBe(false);
    expect(state.actions.interact.enabled).toBe(false);
  });

  test("returns combat-ready state for hostile npc targets", () => {
    const state = resolveInteractionPanelState({
      target: { id: "ember_wyrmling", type: "npc" },
      candidates: [{ id: "ember_wyrmling", type: "npc", label: "Ember Wyrmling", isHostile: true }]
    });
    expect(state.summary).toMatch(/Ember Wyrmling/);
    expect(state.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Threat", value: "Hostile" })
      ])
    );
    expect(state.actions.engage.enabled).toBe(true);
    expect(state.actions.interact.enabled).toBe(false);
  });

  test("disables combat engage actions when a hostile npc is out of range", () => {
    const state = resolveInteractionPanelState({
      target: { id: "ember_wyrmling", type: "npc" },
      candidates: [{ id: "ember_wyrmling", type: "npc", label: "Ember Wyrmling", isHostile: true }],
      engagement: {
        canEngage: false,
        reason: "Move within 2 tiles to engage Ember Wyrmling.",
        range: 2,
        distance: 4
      }
    });

    expect(state.summary).toMatch(/out of reach/);
    expect(state.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Action", value: "Move within 2 tiles to engage Ember Wyrmling." })
      ])
    );
    expect(state.actions.engage.enabled).toBe(false);
  });

  test("returns friendly npc state when the npc is not hostile", () => {
    const state = resolveInteractionPanelState({
      target: { id: "sun-scout", type: "npc" },
      candidates: [{ id: "sun-scout", type: "npc", label: "Sun Scout", isHostile: false }]
    });
    expect(state.summary).toMatch(/Sun Scout/);
    expect(state.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Disposition", value: "Friendly" })
      ])
    );
    expect(state.actions.engage.enabled).toBe(false);
    expect(state.actions.interact.label).toBe("Talk");
    expect(state.actions.interact.enabled).toBe(true);
  });

  test("builds player and object summaries with interact actions", () => {
    const playerState = resolveInteractionPanelState({
      target: { id: "ally", type: "player" },
      candidates: [{ id: "ally", type: "player", label: "Ally" }]
    });
    expect(playerState.summary).toMatch(/Ally/);
    expect(playerState.actions.interact.label).toBe("Trade");

    const objectState = resolveInteractionPanelState({
      target: { id: "sun-altar", type: "object" },
      candidates: [{ id: "sun-altar", type: "object", label: "Sun Altar" }]
    });
    expect(objectState.summary).toMatch(/Sun Altar/);
    expect(objectState.actions.interact.label).toBe("Interact");
  });

  test("handles terrain and unknown target types", () => {
    const terrainState = resolveInteractionPanelState({
      target: { id: "terrain", type: "terrain" }
    });
    expect(terrainState.summary).toMatch(/terrain ahead/);
    expect(terrainState.actions.engage.enabled).toBe(false);

    const fallbackState = resolveInteractionPanelState({
      target: { id: "mystery", type: "portal" }
    });
    expect(fallbackState.summary).toMatch(/mystery/);
    expect(fallbackState.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: "Target", value: "mystery" })])
    );

    const unknownState = resolveInteractionPanelState({
      target: {}
    });
    expect(unknownState.summary).toMatch(/Unknown target/);
  });

  test("renders interaction panel content and action labels", () => {
    const dom = new JSDOM("<div id=\"details\"></div><button id=\"engage\"></button><button id=\"interact\"></button>");
    const details = dom.window.document.getElementById("details");
    const engage = dom.window.document.getElementById("engage");
    const interact = dom.window.document.getElementById("interact");
    const state = resolveInteractionPanelState({
      target: { id: "ember_wyrmling", type: "npc" },
      candidates: [{ id: "ember_wyrmling", type: "npc", label: "Ember Wyrmling", isHostile: true }]
    });

    renderInteractionPanel({ detailsElement: details, engageButton: engage, interactButton: interact, state });

    expect(details.textContent).toMatch(/Engage to start combat/);
    expect(engage.textContent).toBe("Engage");
    expect(engage.disabled).toBe(false);
    expect(interact.disabled).toBe(true);
  });

  test("ignores render requests without a details element", () => {
    const state = resolveInteractionPanelState();
    expect(() => renderInteractionPanel({ state })).not.toThrow();
  });

  test("renders safely when details and buttons are absent", () => {
    const dom = new JSDOM("<div id=\"details\"></div>");
    const details = dom.window.document.getElementById("details");
    const state = {
      summary: "Nothing to show.",
      details: [],
      actions: {
        engage: { enabled: false, label: "Engage" },
        interact: { enabled: false, label: "Interact" }
      }
    };

    renderInteractionPanel({ detailsElement: details, state });

    expect(details.textContent).toMatch(/Nothing to show/);
  });
});
