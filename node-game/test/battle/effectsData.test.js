import { createOverlayOp } from "../../src/battle/animation/overlayOp.js";
import { createScreenTintOp } from "../../src/battle/animation/screenTintOp.js";
import { createSpriteRecolorOp } from "../../src/battle/animation/spriteRecolorOp.js";
import { createParticleOp } from "../../src/battle/animation/particleOp.js";
import { createTimedOverlay, isTimedOverlayActive } from "../../src/battle/effects/TimedOverlay.js";
import { createTintEffect, isTintEffectActive } from "../../src/battle/effects/TintEffect.js";
import { createPaletteSwapEffect, isPaletteSwapActive } from "../../src/battle/effects/PaletteSwapEffect.js";
import { createTimedParticleEffect, isTimedParticleActive } from "../../src/battle/effects/TimedParticleEffect.js";
import { createEffectTimeline } from "../../src/battle/effects/effectTimeline.js";

describe("effect data", () => {
  test("timed effects validate timing and activity", () => {
    const overlay = createTimedOverlay({
      startMs: 0,
      endMs: 10,
      overlayOp: createOverlayOp({ overlayId: "overlay", assetKey: "bolt", priority: 1 })
    });
    expect(isTimedOverlayActive(overlay, 0)).toBe(true);
    expect(isTimedOverlayActive(overlay, 10)).toBe(false);

    const tint = createTintEffect({
      startMs: 5,
      endMs: 6,
      tintOp: createScreenTintOp({ tintId: "tint", colorHex: "#fff", intensity: 0.4 })
    });
    expect(isTintEffectActive(tint, 5)).toBe(true);
    expect(isTintEffectActive(tint, 6)).toBe(false);

    const swap = createPaletteSwapEffect({
      startMs: 2,
      endMs: 3,
      recolorOp: createSpriteRecolorOp({ spriteId: "sprite", paletteKey: "palette" })
    });
    expect(isPaletteSwapActive(swap, 2)).toBe(true);
    expect(isPaletteSwapActive(swap, 3)).toBe(false);

    const particle = createTimedParticleEffect({
      startMs: 1,
      endMs: 2,
      particleOp: createParticleOp({ effectId: "spark", particleCount: 1 })
    });
    expect(isTimedParticleActive(particle, 1)).toBe(true);
    expect(isTimedParticleActive(particle, 2)).toBe(false);
  });

  test("timed effects reject invalid timing", () => {
    const overlayOp = createOverlayOp({ overlayId: "overlay", assetKey: "bolt", priority: 1 });
    expect(() => createTimedOverlay({ startMs: -1, endMs: 1, overlayOp })).toThrow(
      "Overlay timing must be non-negative"
    );
    expect(() => createTimedOverlay({ startMs: 2, endMs: 1, overlayOp })).toThrow(
      "Overlay end time must be after start time"
    );
    expect(() => createTimedOverlay({ startMs: "0", endMs: 1, overlayOp })).toThrow(
      "Overlay timing must be non-negative"
    );
    expect(() => createTimedOverlay({ startMs: 0, endMs: 1, overlayOp: null })).toThrow(
      "Overlay operation is required"
    );
    expect(() => createTintEffect({ startMs: "0", endMs: 1, tintOp: null })).toThrow(
      "Tint timing must be non-negative"
    );
    expect(() => createTintEffect({ startMs: -1, endMs: 1, tintOp: null })).toThrow(
      "Tint timing must be non-negative"
    );
    expect(() => createTintEffect({ startMs: 2, endMs: 1, tintOp: null })).toThrow(
      "Tint end time must be after start time"
    );
    expect(() => createTintEffect({ startMs: 0, endMs: 1, tintOp: null })).toThrow(
      "Tint operation is required"
    );
    expect(() => createPaletteSwapEffect({ startMs: "0", endMs: 1, recolorOp: null })).toThrow(
      "Palette swap timing must be non-negative"
    );
    expect(() => createPaletteSwapEffect({ startMs: -1, endMs: 1, recolorOp: null })).toThrow(
      "Palette swap timing must be non-negative"
    );
    expect(() => createPaletteSwapEffect({ startMs: 2, endMs: 1, recolorOp: null })).toThrow(
      "Palette swap end time must be after start time"
    );
    expect(() => createPaletteSwapEffect({ startMs: 0, endMs: 1, recolorOp: null })).toThrow(
      "Palette swap operation is required"
    );
    expect(() => createTimedParticleEffect({ startMs: "0", endMs: 1, particleOp: null })).toThrow(
      "Particle timing must be non-negative"
    );
    expect(() => createTimedParticleEffect({ startMs: -1, endMs: 1, particleOp: null })).toThrow(
      "Particle timing must be non-negative"
    );
    expect(() => createTimedParticleEffect({ startMs: 2, endMs: 1, particleOp: null })).toThrow(
      "Particle end time must be after start time"
    );
    expect(() => createTimedParticleEffect({ startMs: 0, endMs: 1, particleOp: null })).toThrow(
      "Particle operation is required"
    );
  });

  test("timeline validates collections", () => {
    expect(() => createEffectTimeline({ overlays: null })).toThrow("Effect timeline collections must be arrays");
    expect(() => createEffectTimeline({ tints: null })).toThrow("Effect timeline collections must be arrays");
    expect(() => createEffectTimeline({ paletteSwaps: null })).toThrow("Effect timeline collections must be arrays");
    expect(() => createEffectTimeline({ particles: null })).toThrow("Effect timeline collections must be arrays");
    const timeline = createEffectTimeline();
    expect(timeline.overlays).toHaveLength(0);
    expect(() => timeline.overlays.push("x")).toThrow();
  });
});
