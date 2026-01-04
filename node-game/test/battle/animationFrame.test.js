import { createAnimationFrame, createEmptyAnimationFrame } from "../../src/battle/animation/animationFrame.js";
import { createOverlayOp } from "../../src/battle/animation/overlayOp.js";
import { createSpriteRecolorOp } from "../../src/battle/animation/spriteRecolorOp.js";
import { createScreenTintOp } from "../../src/battle/animation/screenTintOp.js";
import { createParticleOp } from "../../src/battle/animation/particleOp.js";

describe("animation frame", () => {
  test("creates immutable frame", () => {
    const frame = createAnimationFrame({
      durationMs: 120,
      overlayOps: [createOverlayOp({ overlayId: "overlay-1", assetKey: "bolt", priority: 1 })],
      spriteRecolorOps: [createSpriteRecolorOp({ spriteId: "sprite-1", paletteKey: "hot" })],
      screenTintOps: [createScreenTintOp({ tintId: "tint-1", colorHex: "#fff", intensity: 0.4 })],
      particleOps: [createParticleOp({ effectId: "sparks", particleCount: 2 })]
    });

    expect(frame.durationMs).toBe(120);
    expect(() => frame.overlayOps.push("x")).toThrow();
  });

  test("creates empty frame", () => {
    const frame = createEmptyAnimationFrame(60);
    expect(frame.overlayOps).toHaveLength(0);
  });

  test("rejects invalid input", () => {
    expect(() => createAnimationFrame({ durationMs: 0 })).toThrow("Frame duration must be positive");
    expect(() => createAnimationFrame({ durationMs: 10, overlayOps: null })).toThrow(
      "Frame operations cannot be null"
    );
    expect(() => createAnimationFrame({ durationMs: 10, spriteRecolorOps: null })).toThrow(
      "Frame operations cannot be null"
    );
    expect(() => createAnimationFrame({ durationMs: 10, screenTintOps: null })).toThrow(
      "Frame operations cannot be null"
    );
    expect(() => createAnimationFrame({ durationMs: 10, particleOps: null })).toThrow(
      "Frame operations cannot be null"
    );
  });
});
