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
      <div id="menu-anchor"></div>
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

    const anchor = document.getElementById("menu-anchor");
    anchor.getBoundingClientRect = () => ({
      left: 100,
      top: 200,
      right: 300,
      bottom: 400,
      width: 200,
      height: 200
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
      "<div id=\"ignored\" data-interaction-type=\"\" data-interaction-id=\"skip\">Ignored</div>"
    );
    const targets = collectInteractionTargets([surface]);
    expect(targets.find((target) => target.id === "skip")).toBeUndefined();
  });

  test("collectInteractionTargets skips null surfaces", () => {
    const targets = collectInteractionTargets([null, surface]);
    expect(targets.length).toBeGreaterThan(0);
    expect(targets.every((target) => target.element)).toBe(true);
  });

  test("collectInteractionTargets applies fallback metadata defaults", () => {
    const labeled = document.createElement("div");
    labeled.dataset.interactionType = "object";
    labeled.dataset.interactionLabel = "Treasure";
    surface.appendChild(labeled);

    const blank = document.createElement("div");
    blank.dataset.interactionType = "object";
    Object.defineProperty(blank, "textContent", { value: undefined });
    surface.appendChild(blank);

    const targets = collectInteractionTargets([surface]);
    const labeledTarget = targets.find((target) => target.element === labeled);
    const blankTarget = targets.find((target) => target.element === blank);

    expect(labeledTarget).toMatchObject({ id: "", label: "Treasure", layer: 0 });
    expect(blankTarget).toMatchObject({ id: "", label: "", layer: 0 });
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
    expect(client.getLastCandidates()).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "hero" })])
    );

    client.destroy();
  });

  test("skips click handlers when the target is outside the surface", () => {
    const handlers = {};
    const fakeSurface = {
      addEventListener: jest.fn((eventName, handler) => {
        handlers[eventName] = handler;
      }),
      removeEventListener: jest.fn(),
      contains: jest.fn(() => false),
      querySelectorAll: jest.fn(() => [])
    };
    const apiRequest = jest.fn();
    const client = createWorldInteractionClient({
      surfaces: [fakeSurface],
      apiRequest
    });

    handlers.click?.({ target: document.body, clientX: 5, clientY: 5 });
    handlers.contextmenu?.({
      target: document.body,
      clientX: 5,
      clientY: 5,
      preventDefault: jest.fn()
    });

    expect(apiRequest).not.toHaveBeenCalled();

    client.destroy();
  });

  test("renders context menu options inside the provided container and sends context actions", async () => {
    const apiRequest = jest
      .fn()
      .mockResolvedValueOnce({ options: ["inspect", "combat"] })
      .mockResolvedValueOnce({ selectedOption: "inspect", resolvedTarget: { id: "foe" } });
    const onContextAction = jest.fn();
    const contextMenuContainer = document.getElementById("menu-anchor");
    const client = createWorldInteractionClient({
      surfaces: [surface],
      apiRequest,
      onContextAction,
      contextMenuContainer
    });

    const event = new dom.window.MouseEvent("contextmenu", {
      clientX: 140,
      clientY: 230,
      bubbles: true
    });
    surface.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const menu = client.getContextMenu();
    expect(menu.parentElement).toBe(contextMenuContainer);
    const options = Array.from(menu.querySelectorAll("button")).map((button) => button.textContent);
    expect(options).toEqual(["Inspect", "Combat"]);
    expect(menu.style.left).toBe("40px");
    expect(menu.style.top).toBe("30px");

    menu.querySelector("button").click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onContextAction).toHaveBeenCalledWith(
      expect.objectContaining({ selectedOption: "inspect" })
    );

    client.destroy();
  });

  test("supports a single surface reference and null context menu payloads", async () => {
    const apiRequest = jest.fn().mockResolvedValueOnce(null);
    const container = document.getElementById("menu-anchor");
    const client = createWorldInteractionClient({
      surfaces: surface,
      apiRequest,
      contextMenuContainer: container
    });

    const event = new dom.window.MouseEvent("contextmenu", {
      clientX: 140,
      clientY: 240,
      bubbles: true
    });
    surface.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const menu = client.getContextMenu();
    expect(menu.parentElement).toBe(container);
    expect(menu.style.display).toBe("none");

    client.destroy();
  });

  test("reuses the existing context menu element when opening twice", async () => {
    const apiRequest = jest.fn().mockResolvedValue({ options: ["inspect"] });
    const client = createWorldInteractionClient({
      surfaces: [surface],
      apiRequest,
      contextMenuContainer: document.getElementById("menu-anchor")
    });

    const event = new dom.window.MouseEvent("contextmenu", {
      clientX: 135,
      clientY: 245,
      bubbles: true
    });
    surface.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const firstMenu = client.getContextMenu();

    surface.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const secondMenu = client.getContextMenu();

    expect(secondMenu).toBe(firstMenu);

    client.destroy();
  });

  test("falls back to a zero rect when the container lacks layout metrics", async () => {
    const apiRequest = jest.fn().mockResolvedValueOnce({ options: ["inspect"] });
    const container = document.getElementById("menu-anchor");
    container.getBoundingClientRect = undefined;

    const client = createWorldInteractionClient({
      surfaces: [surface],
      apiRequest,
      contextMenuContainer: container
    });

    const event = new dom.window.MouseEvent("contextmenu", {
      clientX: 155,
      clientY: 265,
      bubbles: true
    });
    surface.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const menu = client.getContextMenu();
    expect(menu.style.left).toBe("155px");
    expect(menu.style.top).toBe("265px");

    client.destroy();
  });

  test("does not send a context action when the option is empty", async () => {
    const apiRequest = jest.fn().mockResolvedValueOnce({ options: [""] });
    const client = createWorldInteractionClient({
      surfaces: [surface],
      apiRequest,
      contextMenuContainer: document.getElementById("menu-anchor")
    });

    const event = new dom.window.MouseEvent("contextmenu", {
      clientX: 110,
      clientY: 210,
      bubbles: true
    });
    surface.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const menu = client.getContextMenu();
    const button = menu.querySelector("button");
    expect(button.textContent).toBe("");
    button.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(apiRequest).toHaveBeenCalledTimes(1);

    client.destroy();
  });

  test("keeps the context menu hidden when no options are returned", async () => {
    const apiRequest = jest.fn().mockResolvedValueOnce({ options: [] });
    const client = createWorldInteractionClient({
      surfaces: [surface],
      apiRequest,
      contextMenuContainer: document.getElementById("menu-anchor")
    });

    const event = new dom.window.MouseEvent("contextmenu", {
      clientX: 130,
      clientY: 240,
      bubbles: true
    });
    surface.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const menu = client.getContextMenu();
    expect(menu.style.display).toBe("none");

    client.destroy();
  });

  test("hides the context menu when clicking outside of it", async () => {
    const apiRequest = jest.fn().mockResolvedValueOnce({ options: ["inspect"] });
    const client = createWorldInteractionClient({
      surfaces: [surface],
      apiRequest,
      contextMenuContainer: document.getElementById("menu-anchor")
    });

    const event = new dom.window.MouseEvent("contextmenu", {
      clientX: 120,
      clientY: 230,
      bubbles: true
    });
    surface.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const menu = client.getContextMenu();
    expect(menu.style.display).toBe("block");

    document.body.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

    expect(menu.style.display).toBe("none");
    expect(menu.innerHTML).toBe("");

    client.destroy();
  });

  test("destroys the context menu even when some surfaces are missing", async () => {
    const apiRequest = jest.fn().mockResolvedValueOnce({ options: ["inspect"] });
    const client = createWorldInteractionClient({
      surfaces: [null, surface],
      apiRequest,
      contextMenuContainer: document.getElementById("menu-anchor")
    });

    const event = new dom.window.MouseEvent("contextmenu", {
      clientX: 125,
      clientY: 235,
      bubbles: true
    });
    surface.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(client.getContextMenu()).not.toBeNull();

    client.destroy();

    expect(client.getContextMenu()).toBeNull();
  });

  test("allows destroy to run without an open context menu", () => {
    const apiRequest = jest.fn();
    const client = createWorldInteractionClient({
      surfaces: [surface],
      apiRequest,
      contextMenuContainer: document.getElementById("menu-anchor")
    });

    expect(client.getContextMenu()).toBeNull();
    client.destroy();
  });

  test("falls back to the document body when no context menu container is provided", async () => {
    const apiRequest = jest.fn().mockResolvedValueOnce({ options: ["inspect"] });
    const client = createWorldInteractionClient({
      surfaces: [surface],
      apiRequest,
      contextMenuContainer: null
    });

    const event = new dom.window.MouseEvent("contextmenu", {
      clientX: 15,
      clientY: 25,
      bubbles: true
    });
    surface.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const menu = client.getContextMenu();
    expect(menu.parentElement).toBe(document.body);
    expect(menu.style.left).toBe("15px");
    expect(menu.style.top).toBe("25px");

    client.destroy();
  });
});
