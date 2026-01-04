import { JSDOM } from "jsdom";
import {
  applySpriteToImage,
  BATTLE_SPRITES,
  getBattleSpriteSet
} from "../public/ui/battleSceneAssets.js";

describe("battle scene assets", () => {
  it("returns player sprites when the role is player", () => {
    const sprites = getBattleSpriteSet({ role: "player", combatant: { id: "enemy" } });

    expect(sprites).toBe(BATTLE_SPRITES.player);
  });

  it("falls back to the default player sprites when the map is missing data", () => {
    const sprites = getBattleSpriteSet({ role: "player", spriteMap: {} });

    expect(sprites.label).toBe("Hero");
  });

  it("returns mapped enemy sprites for known combatants", () => {
    const sprites = getBattleSpriteSet({
      role: "enemy",
      combatant: { id: "moonlit_duelist" }
    });

    expect(sprites).toBe(BATTLE_SPRITES.enemies.moonlit_duelist);
  });

  it("falls back to the default enemy sprites for unknown combatants", () => {
    const sprites = getBattleSpriteSet({
      role: "enemy",
      combatant: { id: "unknown" }
    });

    expect(sprites).toBe(BATTLE_SPRITES.enemies.default);
  });

  it("uses default options when no arguments are provided", () => {
    const sprites = getBattleSpriteSet();

    expect(sprites).toBe(BATTLE_SPRITES.enemies.default);
  });

  it("handles sprite maps that omit enemy collections", () => {
    const sprites = getBattleSpriteSet({
      role: "enemy",
      spriteMap: { player: BATTLE_SPRITES.player }
    });

    expect(sprites).toBe(BATTLE_SPRITES.enemies.default);
  });

  it("falls back to built-in defaults when sprite maps are incomplete", () => {
    const sprites = getBattleSpriteSet({
      role: "enemy",
      combatant: { id: "unknown" },
      spriteMap: { enemies: {} }
    });

    expect(sprites.scene).toContain("otherworldly_beast");
  });

  it("applies a sprite to an image element", () => {
    const dom = new JSDOM("<img id=\"sprite\" alt=\"\" />");
    const image = dom.window.document.getElementById("sprite");

    const applied = applySpriteToImage(image, "assets/battle/test.png", "Battle sprite");

    expect(applied).toBe(true);
    expect(image.src).toContain("assets/battle/test.png");
    expect(image.alt).toBe("Battle sprite");
    expect(image.dataset.spriteSrc).toBe("assets/battle/test.png");
  });

  it("keeps existing alt text when none is provided", () => {
    const dom = new JSDOM("<img id=\"sprite\" alt=\"Existing\" />");
    const image = dom.window.document.getElementById("sprite");

    applySpriteToImage(image, "assets/battle/altless.png");

    expect(image.alt).toBe("Existing");
  });

  it("returns false when the sprite cannot be applied", () => {
    expect(applySpriteToImage(null, "sprite.png")).toBe(false);
    expect(applySpriteToImage({}, "")).toBe(false);
  });
});
