import {
  applyComposition,
  BLEND_MODES,
  LAYERS,
  sortEffects
} from "../src/battle/effects/composition.js";
import {
  FlashEffect,
  LineArcEffect,
  RadialBurstEffect,
  ScreenShakeEffect,
  TintEffect,
  __test as primitivesTest
} from "../src/battle/effects/primitives.js";
import { serializeEffect } from "../src/battle/effects/serialize.js";
import { Effects } from "../src/battle/effects/builders.js";
import * as effectsIndex from "../src/battle/effects/index.js";

describe("effects coverage helpers", () => {
  test("applyComposition honors overrides and fallbacks", () => {
    const custom = applyComposition({ type: "mystery" }, { layer: 5, blendMode: "screen" });
    expect(custom.layer).toBe(5);
    expect(custom.blendMode).toBe("screen");

    const fromEffect = applyComposition({ type: "tint", layer: 2, blendMode: "add" });
    expect(fromEffect.layer).toBe(2);
    expect(fromEffect.blendMode).toBe("add");

    const fallback = applyComposition({ type: "unknown" });
    expect(fallback.layer).toBe(LAYERS.MIDGROUND);
    expect(fallback.blendMode).toBe(BLEND_MODES.NORMAL);
  });

  test("sortEffects handles missing layers and types", () => {
    const sorted = sortEffects([
      { type: "b", layer: 2 },
      { type: null },
      { type: "a", layer: 2 },
      { type: "c", layer: 0 }
    ]);
    expect(sorted[0].type).toBe("c");
    expect(sorted[1].type).toBeNull();
    expect(sorted[2].type).toBe("a");
    expect(sorted[3].type).toBe("b");

    expect(sortEffects()).toEqual([]);

    const nullRight = sortEffects([{ type: "a", layer: 1 }, { layer: 1 }]);
    expect(nullRight[0].type).toBeUndefined();
    expect(nullRight[1].type).toBe("a");

    const bothNull = sortEffects([{ layer: 1 }, { layer: 1 }]);
    expect(bothNull).toHaveLength(2);
  });

  test("primitive effects normalize defaults and explicit values", () => {
    const defaultTint = TintEffect();
    expect(defaultTint.durationMs).toBe(500);
    expect(defaultTint.amplitude).toBe(1);

    const customFlash = FlashEffect({
      durationMs: 700,
      amplitude: 2,
      color: "#123",
      frequency: 2,
      fade: "in"
    });
    expect(customFlash.durationMs).toBe(700);
    expect(customFlash.amplitude).toBe(2);
    expect(customFlash.color).toBe("#123");
    expect(customFlash.frequency).toBe(2);
    expect(customFlash.fade).toBe("in");

    const lineArc = LineArcEffect({ arcCount: 4, thickness: 3 });
    expect(lineArc.arcCount).toBe(4);
    expect(lineArc.thickness).toBe(3);

    const defaultLineArc = LineArcEffect();
    expect(defaultLineArc.arcCount).toBe(2);
    expect(defaultLineArc.thickness).toBe(2);

    const defaultBurst = RadialBurstEffect();
    expect(defaultBurst.radius).toBe(1);
    expect(defaultBurst.spokes).toBe(8);

    const shake = ScreenShakeEffect({ axis: "x" });
    expect(shake.axis).toBe("x");

    const defaultShake = ScreenShakeEffect();
    expect(defaultShake.axis).toBe("both");
  });

  test("serializeEffect handles null and extras", () => {
    expect(serializeEffect(null)).toBeNull();
    const serialized = serializeEffect({ type: "flash", durationMs: 100, zeta: 2, alpha: 1 });
    expect(serialized).toEqual({
      type: "flash",
      durationMs: 100,
      alpha: 1,
      zeta: 2
    });
  });

  test("effect builders use defaults", () => {
    const effects = Effects.lightning();
    expect(effects).toHaveLength(3);

    const fire = Effects.fireOverlay();
    expect(fire).toHaveLength(2);
  });

  test("effects index re-exports primitives", () => {
    expect(effectsIndex.TintEffect).toBe(TintEffect);
    expect(effectsIndex.serializeEffect).toBe(serializeEffect);
    expect(effectsIndex.effectsIndexLoaded).toBe(true);
  });

  test("primitives internals handle undefined params", () => {
    const normalized = primitivesTest.normalizeParams();
    expect(normalized).toEqual({
      durationMs: 500,
      amplitude: 1,
      color: "#ffffff",
      frequency: 1
    });

    const built = primitivesTest.buildEffect("flash", undefined, undefined);
    expect(built.type).toBe("flash");
  });
});
