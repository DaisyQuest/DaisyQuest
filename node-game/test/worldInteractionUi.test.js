import { JSDOM } from "jsdom";
import { jest } from "@jest/globals";
import {
  collectInteractionTargets,
  createWorldInteractionClient,
  resolveInteractionCandidates
} from "../public/ui/worldInteraction.js";

describe("world interaction client", () => {
  let dom;
  let surface;

  beforeEach(() => {
    dom = new JSDOM(`
      <div id="surface">
        <div id="player" data-interaction-type="player" data-interaction-id="hero" data-interaction-layer="10">
          Hero
        </div>
        <div id="npc" data-interaction-type="npc" data-interaction-id="foe" data-interaction-layer="20" data-interaction-hostile="true">
          Foe
        </div>
      </div>
    `);
    global.window = dom.window;
    global.document = dom.window.document;
    surface = document.getElementById("surface");

    const player = document.getElementById("player");
    const npc = document.getElementById("npc");
    player.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 50,
      bottom: 50,
      width: 50,
      height: 50
    });
    npc.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 50,
      bottom: 50,
      width: 50,
      height: 50
    });
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  test("resolves candidates by layer priority", () => {
    const targets = collectInteractionTargets([surface]);
    const candidates = resolveInteractionCandidates({
      point: { x: 10, y: 10 },
      targets
    });

    expect(candidates[0]).toMatchObject({ id: "foe", type: "npc", layer: 20, isHostile: true });
    expect(candidates[1]).toMatchObject({ id: "hero", type: "player", layer: 10 });
    expect(candidates[candidates.length - 1]).toMatchObject({ type: "terrain" });
  });

  test("includes hostile metadata when collecting targets", () => {
    const targets = collectInteractionTargets([surface]);
    const npcTarget = targets.find((target) => target.id === "foe");
    expect(npcTarget).toMatchObject({ isHostile: true, type: "npc" });
  });

  test("skips terrain candidates when disabled", () => {
    const targets = collectInteractionTargets([surface]);
    const candidates = resolveInteractionCandidates({
      point: { x: 10, y: 10 },
      targets,
      includeTerrain: false
    });

    expect(candidates.find((candidate) => candidate.type === "terrain")).toBeUndefined();
  });

  test("collectInteractionTargets ignores elements missing interaction metadata", () => {
    surface.insertAdjacentHTML(
      "beforeend",
      "<div id=\"ignored\" data-interaction-id=\"skip\">Ignored</div>"
    );
    const targets = collectInteractionTargets([surface]);
    expect(targets.find((target) => target.id === "skip")).toBeUndefined();
  });

  test("dispatches primary click action requests", async () => {
    const apiRequest = jest.fn().mockResolvedValue({ action: "move" });
    const client = createWorldInteractionClient({
      surfaces: [surface],
      apiRequest
    });

    const event = new dom.window.MouseEvent("click", { clientX: 10, clientY: 10, bubbles: true });
    surface.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(apiRequest).toHaveBeenCalledWith(
      "/api/world-interactions/action",
      expect.objectContaining({
        method: "POST",
        body: expect.objectContaining({ clickType: "primary" })
      })
    );

    client.destroy();
  });

  test("renders context menu options and sends context actions", async () => {
    const apiRequest = jest
      .fn()
      .mockResolvedValueOnce({ options: ["inspect", "combat"] })
      .mockResolvedValueOnce({ selectedOption: "inspect", resolvedTarget: { id: "foe" } });
    const onContextAction = jest.fn();
    const client = createWorldInteractionClient({
      surfaces: [surface],
      apiRequest,
      onContextAction
    });

    const event = new dom.window.MouseEvent("contextmenu", {
      clientX: 10,
      clientY: 10,
      bubbles: true
    });
    surface.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const menu = client.getContextMenu();
    const options = Array.from(menu.querySelectorAll("button")).map((button) => button.textContent);
    expect(options).toEqual(["Inspect", "Combat"]);

    menu.querySelector("button").click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onContextAction).toHaveBeenCalledWith(
      expect.objectContaining({ selectedOption: "inspect" })
    );

    client.destroy();
  });
});
