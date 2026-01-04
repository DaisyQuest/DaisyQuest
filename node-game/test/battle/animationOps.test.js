import { createOverlayOp } from "../../src/battle/animation/overlayOp.js";
import { createSpriteRecolorOp } from "../../src/battle/animation/spriteRecolorOp.js";
import { createScreenTintOp } from "../../src/battle/animation/screenTintOp.js";
import { createParticleOp } from "../../src/battle/animation/particleOp.js";

describe("animation ops", () => {
  test("overlay op validates inputs", () => {
    expect(() => createOverlayOp({ overlayId: "", assetKey: "bolt", priority: 1 })).toThrow(
      "Overlay id is required"
    );
    expect(() => createOverlayOp({ overlayId: "   ", assetKey: "bolt", priority: 1 })).toThrow(
      "Overlay id is required"
    );
    expect(() => createOverlayOp({ overlayId: "overlay", assetKey: "", priority: 1 })).toThrow(
      "Overlay asset key is required"
    );
    expect(() => createOverlayOp({ overlayId: "overlay", assetKey: "   ", priority: 1 })).toThrow(
      "Overlay asset key is required"
    );
    expect(() => createOverlayOp({ overlayId: "overlay", assetKey: "bolt", priority: -1 })).toThrow(
      "Overlay priority cannot be negative"
    );
    expect(() => createOverlayOp({ overlayId: "overlay", assetKey: "bolt", priority: 1.2 })).toThrow(
      "Overlay priority cannot be negative"
    );
  });

  test("sprite recolor validates inputs", () => {
    expect(() => createSpriteRecolorOp({ spriteId: "", paletteKey: "hot" })).toThrow(
      "Sprite id is required"
    );
    expect(() => createSpriteRecolorOp({ spriteId: "sprite", paletteKey: "" })).toThrow(
      "Palette key is required"
    );
  });

  test("screen tint validates inputs", () => {
    expect(() => createScreenTintOp({ tintId: "", colorHex: "#fff", intensity: 0.5 })).toThrow(
      "Tint id is required"
    );
    expect(() => createScreenTintOp({ tintId: "tint", colorHex: "", intensity: 0.5 })).toThrow(
      "Tint color is required"
    );
    expect(() => createScreenTintOp({ tintId: "tint", colorHex: "#fff", intensity: -0.1 })).toThrow(
      "Tint intensity must be between 0 and 1"
    );
    expect(() => createScreenTintOp({ tintId: "tint", colorHex: "#fff", intensity: 1.2 })).toThrow(
      "Tint intensity must be between 0 and 1"
    );
  });

  test("particle op validates inputs", () => {
    expect(() => createParticleOp({ effectId: "", particleCount: 1 })).toThrow("Effect id is required");
    expect(() => createParticleOp({ effectId: "spark", particleCount: -1 })).toThrow(
      "Particle count cannot be negative"
    );
  });

  test("metadata is immutable", () => {
    const overlay = createOverlayOp({
      overlayId: "overlay",
      assetKey: "bolt",
      priority: 1,
      metadata: { intensity: "high" }
    });
    expect(() => {
      overlay.metadata.extra = "value";
    }).toThrow();
  });

  test("metadata defaults to empty object", () => {
    const overlay = createOverlayOp({ overlayId: "overlay", assetKey: "bolt", priority: 1 });
    expect(overlay.metadata).toEqual({});
  });

  test("defaults priority to zero", () => {
    const overlay = createOverlayOp({ overlayId: "overlay", assetKey: "bolt" });
    expect(overlay.priority).toBe(0);
  });
});
