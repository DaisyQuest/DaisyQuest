import { JSDOM } from "jsdom";
import { jest } from "@jest/globals";
import {
  buildWorldMarkers,
  createWorldMapView,
  getWorldBoundsForLocation,
  getSurfacePercentFromEvent,
  projectToPercent,
  renderWorldMap
} from "../public/ui/worldMapView.js";

const worldFixture = {
  worldMap: { id: "ember-realm", width: 10, height: 8 },
  submaps: [{ id: "glimmer-cavern", parentMapId: "ember-realm", width: 4, height: 4 }],
  players: [
    {
      id: "hero",
      name: "Hero",
      isNpc: false,
      location: { mapId: "ember-realm", submapId: null },
      position: { x: 2, y: 3 }
    },
    {
      id: "ally",
      name: "Ally",
      isNpc: false,
      location: { mapId: "ember-realm", submapId: null },
      position: { x: 5, y: 6 }
    },
    {
      id: "cavern-npc",
      name: "Cavern Mystic",
      isNpc: true,
      location: { mapId: "ember-realm", submapId: "glimmer-cavern" },
      position: { x: 1, y: 1 }
    }
  ],
  worldObjects: [
    {
      id: "sun-altar",
      name: "Sun Altar",
      location: { mapId: "ember-realm", submapId: null },
      position: { x: 8, y: 1 }
    }
  ]
};

describe("world map view", () => {
  test("resolves bounds for world maps and submaps", () => {
    const bounds = getWorldBoundsForLocation(worldFixture, {
      mapId: "ember-realm",
      submapId: null
    });
    expect(bounds).toMatchObject({ maxX: 9, maxY: 7, width: 10, height: 8 });

    const submapBounds = getWorldBoundsForLocation(worldFixture, {
      mapId: "ember-realm",
      submapId: "glimmer-cavern"
    });
    expect(submapBounds).toMatchObject({ maxX: 3, maxY: 3, width: 4, height: 4 });

    const error = getWorldBoundsForLocation(worldFixture, {
      mapId: "ember-realm",
      submapId: "missing"
    });
    expect(error.error).toBe("Submap not found.");

    expect(getWorldBoundsForLocation(null, null).error).toBe("World map is required.");
    expect(getWorldBoundsForLocation(worldFixture, null).error).toBe("Location is required.");
  });

  test("projects coordinates to percent values", () => {
    expect(projectToPercent(5, 9)).toBeCloseTo(55.555, 2);
    expect(projectToPercent(0, 0)).toBe(50);
    expect(projectToPercent("bad", 9)).toBe(50);
  });

  test("normalizes click positions against surface bounds", () => {
    const dom = new JSDOM("<div id=\"surface\"></div>");
    const surface = dom.window.document.getElementById("surface");
    surface.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 });
    const event = { clientX: 100, clientY: 50 };
    expect(getSurfacePercentFromEvent({ event, surface })).toEqual({ xPercent: 0.5, yPercent: 0.5 });

    const zeroRect = { left: 0, top: 0, width: 0, height: 0 };
    surface.getBoundingClientRect = () => zeroRect;
    expect(getSurfacePercentFromEvent({ event, surface })).toBeNull();
    expect(getSurfacePercentFromEvent({ event })).toBeNull();
  });

  test("builds markers for entities in the current location", () => {
    const dom = new JSDOM("<div></div>");
    const markers = buildWorldMarkers({
      world: worldFixture,
      playerId: "hero",
      doc: dom.window.document
    });

    const ids = markers.map((marker) => marker.dataset.interactionId);
    expect(ids).toEqual(expect.arrayContaining(["hero", "ally", "sun-altar"]));
    expect(ids).not.toContain("cavern-npc");

    const heroMarker = markers.find((marker) => marker.dataset.interactionId === "hero");
    expect(heroMarker.dataset.self).toBe("true");
    expect(heroMarker.dataset.interactionType).toBe("player");
  });

  test("returns no markers when world data is missing", () => {
    const dom = new JSDOM("<div></div>");
    expect(buildWorldMarkers({ doc: dom.window.document })).toEqual([]);
  });

  test("skips markers when bounds cannot be resolved", () => {
    const dom = new JSDOM("<div></div>");
    const brokenWorld = {
      ...worldFixture,
      players: [
        {
          id: "hero",
          name: "Hero",
          isNpc: false,
          location: { mapId: "ember-realm", submapId: "missing" },
          position: { x: 1, y: 1 }
        }
      ],
      worldObjects: [
        {
          id: "lost-object",
          name: "Lost Object",
          location: { mapId: "ember-realm", submapId: "missing" },
          position: { x: 1, y: 1 }
        }
      ]
    };

    const markers = buildWorldMarkers({
      world: brokenWorld,
      playerId: "hero",
      doc: dom.window.document
    });
    expect(markers.length).toBe(0);
  });

  test("filters out objects from other locations", () => {
    const dom = new JSDOM("<div></div>");
    const world = {
      ...worldFixture,
      worldObjects: [
        {
          id: "remote-object",
          name: "Remote Object",
          location: { mapId: "ember-realm", submapId: "glimmer-cavern" },
          position: { x: 1, y: 1 }
        }
      ]
    };
    const markers = buildWorldMarkers({
      world,
      playerId: "hero",
      doc: dom.window.document
    });
    expect(markers.some((marker) => marker.dataset.interactionId === "remote-object")).toBe(
      false
    );
  });

  test("renders safely without world data", () => {
    const dom = new JSDOM("<div id=\"entities\"></div>");
    const entities = dom.window.document.getElementById("entities");
    renderWorldMap({ entitiesContainer: entities });
    expect(entities.children.length).toBe(0);
  });

  test("renders without HUD updates when the player is missing", () => {
    const dom = new JSDOM(
      "<div id=\"entities\"></div><div id=\"coords\"></div><div id=\"region\"></div>"
    );
    const entities = dom.window.document.getElementById("entities");
    const coords = dom.window.document.getElementById("coords");
    const region = dom.window.document.getElementById("region");
    renderWorldMap({
      world: worldFixture,
      playerId: "missing",
      entitiesContainer: entities,
      coordinatesLabel: null,
      regionLabel: null
    });

    expect(coords.textContent).toBe("");
    expect(region.textContent).toBe("");
  });

  test("renders markers and refreshes via the view", async () => {
    const dom = new JSDOM(
      "<div id=\"surface\"></div><div id=\"entities\"></div><div id=\"coords\"></div><div id=\"region\"></div>"
    );
    const surface = dom.window.document.getElementById("surface");
    const entities = dom.window.document.getElementById("entities");
    const coords = dom.window.document.getElementById("coords");
    const region = dom.window.document.getElementById("region");
    const apiRequest = jest
      .fn()
      .mockResolvedValueOnce({ playerId: "hero", world: worldFixture })
      .mockResolvedValueOnce({
        playerId: "hero",
        world: {
          ...worldFixture,
          players: worldFixture.players.map((player) =>
            player.id === "hero" ? { ...player, position: { x: 3, y: 4 } } : player
          )
        },
        movement: { moved: true }
      });

    const view = createWorldMapView({
      surface,
      entitiesContainer: entities,
      coordinatesLabel: coords,
      regionLabel: region,
      apiRequest,
      pollIntervalMs: 999999,
      setIntervalFn: () => 1,
      clearIntervalFn: () => {}
    });

    await view.refresh();
    expect(entities.querySelectorAll(".world-panel__target").length).toBeGreaterThan(0);
    expect(coords.textContent).toMatch(/Coordinates: 02, 03/);

    await view.moveToPercent({ xPercent: 0.4, yPercent: 0.5 });
    expect(coords.textContent).toMatch(/Coordinates: 03, 04/);
    expect(apiRequest).toHaveBeenCalledWith(
      "/api/world/move",
      expect.objectContaining({ method: "POST" })
    );
  });

  test("returns safe no-op view when dependencies are missing", async () => {
    const view = createWorldMapView({ apiRequest: () => ({}) });
    expect(view.state).toBeDefined();
    expect(await view.refresh()).toBeNull();
    expect(await view.moveToPercent({ xPercent: 0.2, yPercent: 0.2 })).toBeNull();
    view.start();
    view.stop();
  });

  test("handles null payloads and start/stop idempotency", async () => {
    const dom = new JSDOM(
      "<div id=\"surface\"></div><div id=\"entities\"></div><div id=\"coords\"></div><div id=\"region\"></div>"
    );
    const surface = dom.window.document.getElementById("surface");
    const entities = dom.window.document.getElementById("entities");
    const coords = dom.window.document.getElementById("coords");
    const region = dom.window.document.getElementById("region");
    const apiRequest = jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    const setIntervalFn = jest.fn(() => 123);
    const clearIntervalFn = jest.fn();

    const view = createWorldMapView({
      surface,
      entitiesContainer: entities,
      coordinatesLabel: coords,
      regionLabel: region,
      apiRequest,
      pollIntervalMs: 10,
      setIntervalFn,
      clearIntervalFn
    });

    expect(await view.refresh()).toBeNull();
    expect(await view.moveToPercent({ xPercent: 0.1, yPercent: 0.1 })).toBeNull();

    view.start();
    view.start();
    expect(setIntervalFn).toHaveBeenCalledTimes(1);
    view.stop();
    view.stop();
    expect(clearIntervalFn).toHaveBeenCalledTimes(1);
  });
});
