import { composeEffectFrame } from "../../src/battle/effects/effectComposer.js";
import { createEffectTimeline } from "../../src/battle/effects/effectTimeline.js";
import { createTimedOverlay } from "../../src/battle/effects/TimedOverlay.js";
import { createTintEffect } from "../../src/battle/effects/TintEffect.js";
import { createPaletteSwapEffect } from "../../src/battle/effects/PaletteSwapEffect.js";
import { createTimedParticleEffect } from "../../src/battle/effects/TimedParticleEffect.js";
import { createOverlayOp } from "../../src/battle/animation/overlayOp.js";
import { createScreenTintOp } from "../../src/battle/animation/screenTintOp.js";
import { createSpriteRecolorOp } from "../../src/battle/animation/spriteRecolorOp.js";
import { createParticleOp } from "../../src/battle/animation/particleOp.js";

describe("effect composer", () => {
  test("composes active effects", () => {
    const timeline = createEffectTimeline({
      overlays: [
        createTimedOverlay({
          startMs: 0,
          endMs: 100,
          overlayOp: createOverlayOp({ overlayId: "overlay", assetKey: "bolt", priority: 1 })
        })
      ],
      tints: [
        createTintEffect({
          startMs: 50,
          endMs: 150,
          tintOp: createScreenTintOp({ tintId: "tint", colorHex: "#fff", intensity: 0.5 })
        })
      ],
      paletteSwaps: [
        createPaletteSwapEffect({
          startMs: 0,
          endMs: 75,
          recolorOp: createSpriteRecolorOp({ spriteId: "sprite", paletteKey: "hot" })
        })
      ],
      particles: [
        createTimedParticleEffect({
          startMs: 20,
          endMs: 60,
          particleOp: createParticleOp({ effectId: "sparks", particleCount: 10 })
        })
      ]
    });

    const frame = composeEffectFrame({ timeMs: 50, durationMs: 33, timeline });

    expect(frame.overlayOps).toHaveLength(1);
    expect(frame.screenTintOps).toHaveLength(1);
    expect(frame.spriteRecolorOps).toHaveLength(1);
    expect(frame.particleOps).toHaveLength(1);
  });

  test("excludes expired effects", () => {
    const timeline = createEffectTimeline({
      overlays: [
        createTimedOverlay({
          startMs: 0,
          endMs: 100,
          overlayOp: createOverlayOp({ overlayId: "overlay", assetKey: "bolt", priority: 1 })
        })
      ]
    });

    const frame = composeEffectFrame({ timeMs: 100, durationMs: 33, timeline });

    expect(frame.overlayOps).toHaveLength(0);
  });

  test("rejects invalid inputs", () => {
    const timeline = createEffectTimeline();
    expect(() => composeEffectFrame({ timeMs: -1, durationMs: 16, timeline })).toThrow(
      "Time must be non-negative"
    );
    expect(() => composeEffectFrame({ timeMs: 0, durationMs: 0, timeline })).toThrow(
      "Duration must be positive"
    );
    expect(() => composeEffectFrame({ timeMs: 0, durationMs: 16, timeline: null })).toThrow(
      "Effect timeline is required"
    );
  });
});
