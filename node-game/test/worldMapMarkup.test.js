import fs from "fs";
import { JSDOM } from "jsdom";

describe("world map markup", () => {
  const html = fs.readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  const dom = new JSDOM(html);
  const { document } = dom.window;
  const mapPanel = document.querySelector('[data-tab-panel="map"]');

  test("includes a visible interaction hint and hud elements", () => {
    expect(mapPanel).not.toBeNull();
    const hint = mapPanel.querySelector("[data-world-map-hint]");
    const hud = mapPanel.querySelector("[data-world-map-hud]");

    expect(hint).not.toBeNull();
    expect(hint.textContent).toMatch(/Right-click/i);
    expect(hud).not.toBeNull();
  });

  test("positions world targets using map coordinates", () => {
    const surface = mapPanel.querySelector("[data-world-map-surface]");
    const entities = mapPanel.querySelector("[data-world-map-entities]");

    expect(surface).not.toBeNull();
    expect(entities).not.toBeNull();
  });

  test("includes cohesive interaction, chat, and combat regions", () => {
    const interactionPanel = mapPanel.querySelector("#interaction-panel");
    const overlayLayer = document.querySelector(".app-layer--overlay");
    const chatPanel = overlayLayer?.querySelector(".chat-panel");
    const combatDock = mapPanel.querySelector(".combat-dock");
    const combatPanel = document.querySelector('[data-tab-panel="combat"]');

    expect(interactionPanel).not.toBeNull();
    expect(chatPanel).not.toBeNull();
    expect(mapPanel.querySelector(".chat-panel")).toBeNull();
    expect(combatDock).toBeNull();
    expect(combatPanel?.querySelector(".combat-dock")).not.toBeNull();
  });
});
