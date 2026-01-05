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
        <div id="player" data-interaction-type="player" data-interaction-id="hero" data-interaction-layer="10" data-interaction-x-percent="0.1" data-interaction-y-percent="0.1">
          Hero
        </div>
        <div id="npc" data-interaction-type="npc" data-interaction-id="foe" data-interaction-layer="20" data-interaction-hostile="true" data-interaction-x-percent="0.1" data-interaction-y-percent="0.1">
          Foe
        </div>
      </div>
    `);
    global.window = dom.window;
    global.document = dom.window.document;
    surface = document.getElementById("surface");
    surface.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100
    });

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
      targets,
      surface
    });

    expect(candidates[0]).toMatchObject({ id: "foe", type: "npc", layer: 20, isHostile: true });
    expect(candidates[1]).toMatchObject({ id: "hero", type: "player", layer: 10 });
    expect(candidates[candidates.length - 1]).toMatchObject({ type: "terrain" });
  });

  test("includes hostile metadata when collecting targets", () => {
    const targets = collectInteractionTargets([surface]);
    const npcTarget = targets.find((target) => target.id === "foe");
    expect(npcTarget).toMatchObject({ isHostile: true, type: "npc", xPercent: 0.1, yPercent: 0.1 });
  });

  test("skips terrain candidates when disabled", () => {
    const targets = collectInteractionTargets([surface]);
    const candidates = resolveInteractionCandidates({
      point: { x: 10, y: 10 },
      targets,
      surface,
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

  test("filters proximity candidates when outside the interaction radius", () => {
    const targets = collectInteractionTargets([surface]);
    const candidates = resolveInteractionCandidates({
      point: { x: 90, y: 90 },
      targets,
      surface,
      maxDistance: 0.05
    });

    expect(candidates.some((candidate) => candidate.type === "npc")).toBe(false);
    expect(candidates[candidates.length - 1]).toMatchObject({ type: "terrain" });
  });

  test("orders candidates by distance when layers are equal", () => {
    const closer = document.createElement("div");
    closer.dataset.interactionType = "object";
    closer.dataset.interactionId = "near";
    closer.dataset.interactionLayer = "5";
    closer.dataset.interactionXPercent = "0.1";
    closer.dataset.interactionYPercent = "0.1";
    surface.appendChild(closer);

    const farther = document.createElement("div");
    farther.dataset.interactionType = "object";
    farther.dataset.interactionId = "far";
    farther.dataset.interactionLayer = "5";
    farther.dataset.interactionXPercent = "0.16";
    farther.dataset.interactionYPercent = "0.16";
    surface.appendChild(farther);

    const targets = collectInteractionTargets([surface]);
    const candidates = resolveInteractionCandidates({
      point: { x: 10, y: 10 },
      targets,
      surface
    });

    const objectCandidates = candidates.filter((candidate) => candidate.type === "object");
    expect(objectCandidates[0].id).toBe("near");
  });

  test("sorts by distance when candidates are prebuilt", () => {
    const customTargets = [
      {
        id: "a",
        type: "object",
        layer: 1,
        label: "A",
        xPercent: 0.1,
        yPercent: 0.1,
        isHostile: false
      },
      {
        id: "b",
        type: "object",
        layer: 1,
        label: "B",
        xPercent: 0.12,
        yPercent: 0.12,
        isHostile: false
      }
    ];

    const candidates = resolveInteractionCandidates({
      point: { x: 10, y: 10 },
      targets: customTargets,
      surface,
      includeTerrain: false
    });

    expect(candidates.map((candidate) => candidate.id)).toEqual(["a", "b"]);
  });

  test("uses fallback distance ordering when targets have no distance data", () => {
    const a = document.createElement("div");
    a.dataset.interactionType = "object";
    a.dataset.interactionId = "alpha";
    a.dataset.interactionLayer = "4";
    a.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 20,
      bottom: 20,
      width: 20,
      height: 20
    });

    const b = document.createElement("div");
    b.dataset.interactionType = "object";
    b.dataset.interactionId = "beta";
    b.dataset.interactionLayer = "4";
    b.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 20,
      bottom: 20,
      width: 20,
      height: 20
    });

    surface.appendChild(a);
    surface.appendChild(b);
    const targets = collectInteractionTargets([surface]);
    const candidates = resolveInteractionCandidates({
      point: { x: 10, y: 10 },
      targets,
      surface,
      includeTerrain: false
    });

    const objectCandidates = candidates.filter((candidate) => candidate.type === "object");
    expect(objectCandidates.map((candidate) => candidate.id)).toEqual(["alpha", "beta"]);
  });

  test("falls back to bounding box checks when percent data is missing", () => {
    const unlabeled = document.createElement("div");
    unlabeled.dataset.interactionType = "object";
    unlabeled.dataset.interactionId = "crate";
    surface.appendChild(unlabeled);
    unlabeled.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 20,
      bottom: 20,
      width: 20,
      height: 20
    });

    const targets = collectInteractionTargets([surface]);
    const candidates = resolveInteractionCandidates({
      point: { x: 10, y: 10 },
      targets,
      surface
    });

    expect(candidates.some((candidate) => candidate.id === "crate")).toBe(true);
  });

  test("filters candidates using explicit interaction ranges", () => {
    const ranged = document.createElement("div");
    ranged.dataset.interactionType = "npc";
    ranged.dataset.interactionId = "sniper";
    ranged.dataset.interactionLayer = "15";
    ranged.dataset.interactionXPercent = "0.3";
    ranged.dataset.interactionYPercent = "0.3";
    ranged.dataset.interactionRadius = "0.05";
    surface.appendChild(ranged);

    const targets = collectInteractionTargets([surface]);
    const candidates = resolveInteractionCandidates({
      point: { x: 40, y: 40 },
      targets,
      surface
    });

    expect(candidates.some((candidate) => candidate.id === "sniper")).toBe(false);
  });

  test("parses invalid percent metadata as null values", () => {
    const invalid = document.createElement("div");
    invalid.dataset.interactionType = "object";
    invalid.dataset.interactionId = "glitch";
    invalid.dataset.interactionXPercent = "bad";
    invalid.dataset.interactionYPercent = "nope";
    surface.appendChild(invalid);

    const targets = collectInteractionTargets([surface]);
    const target = targets.find((entry) => entry.id === "glitch");
    expect(target.xPercent).toBeNull();
    expect(target.yPercent).toBeNull();
  });

  test("ignores null targets and handles zero-sized surfaces", () => {
    surface.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0
    });

    const candidates = resolveInteractionCandidates({
      point: { x: 5, y: 5 },
      targets: [null],
      surface
    });

    expect(candidates).toEqual([{ id: "terrain", type: "terrain", layer: 0, label: "terrain", distance: null }]);
  });

  test("returns terrain-only candidates when the point is missing", () => {
    const targets = collectInteractionTargets([surface]);
    const candidates = resolveInteractionCandidates({
      point: null,
      targets,
      surface
    });

    expect(candidates).toEqual([{ id: "terrain", type: "terrain", layer: 0, label: "terrain", distance: null }]);
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
