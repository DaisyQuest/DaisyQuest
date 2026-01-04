import {
  BLEND_MODES,
  COMPOSITION_RULES,
  LAYERS,
  applyComposition,
  sortEffects
} from "../src/battle/effects/composition.js";
import {
  Effects as EffectsIndex,
  TintEffect as TintEffectIndex
} from "../src/battle/effects/index.js";
import {
  FlashEffect,
  LineArcEffect,
  RadialBurstEffect,
  ScreenShakeEffect,
  TintEffect
} from "../src/battle/effects/primitives.js";
import { Effects } from "../src/battle/effects/builders.js";
import { serializeEffect, serializeEffects } from "../src/battle/effects/serialize.js";

describe("effect primitives", () => {
  test("TintEffect uses defaults and composition rules", () => {
    const effect = TintEffect();
    expect(effect).toMatchObject({
      type: "tint",
      durationMs: 500,
      amplitude: 1,
      color: "#ffffff",
      frequency: 1,
      intensity: 0.6
    });
    expect(effect.layer).toBe(COMPOSITION_RULES.tint.layer);
    expect(effect.blendMode).toBe(COMPOSITION_RULES.tint.blendMode);
  });

  test("index exports mirror primitive builders", () => {
    expect(EffectsIndex).toBe(Effects);
    expect(TintEffectIndex).toBe(TintEffect);
  });

  test("FlashEffect accepts overrides", () => {
    const effect = FlashEffect({
      durationMs: 240,
      amplitude: 0.4,
      color: "#ffeeaa",
      frequency: 2.5,
      fade: "in"
    });
    expect(effect).toMatchObject({
      type: "flash",
      durationMs: 240,
      amplitude: 0.4,
      color: "#ffeeaa",
      frequency: 2.5,
      fade: "in"
    });
  });

  test("LineArcEffect and RadialBurstEffect include extra params", () => {
    const arc = LineArcEffect({ arcCount: 4, thickness: 3 });
    const burst = RadialBurstEffect({ radius: 1.4, spokes: 10 });
    expect(arc.arcCount).toBe(4);
    expect(arc.thickness).toBe(3);
    expect(burst.radius).toBe(1.4);
    expect(burst.spokes).toBe(10);
  });

  test("ScreenShakeEffect keeps axis configuration", () => {
    const effect = ScreenShakeEffect({ axis: "x" });
    expect(effect.axis).toBe("x");
    expect(effect.color).toBe("#ffffff");
  });
});

describe("composition rules", () => {
  test("applyComposition falls back for unknown types", () => {
    const effect = applyComposition({
      type: "mystery",
      durationMs: 100,
      amplitude: 1,
      color: "#fff",
      frequency: 1
    });
    expect(effect.layer).toBe(LAYERS.MIDGROUND);
    expect(effect.blendMode).toBe(BLEND_MODES.NORMAL);
  });

  test("applyComposition preserves effect-provided layer metadata", () => {
    const effect = applyComposition({
      type: "mystery",
      durationMs: 100,
      amplitude: 1,
      color: "#fff",
      frequency: 1,
      layer: LAYERS.FX,
      blendMode: BLEND_MODES.SCREEN
    });
    expect(effect.layer).toBe(LAYERS.FX);
    expect(effect.blendMode).toBe(BLEND_MODES.SCREEN);
  });

  test("applyComposition respects overrides", () => {
    const effect = applyComposition(
      { type: "tint", durationMs: 100, amplitude: 1, color: "#fff", frequency: 1 },
      { layer: LAYERS.SCREEN, blendMode: BLEND_MODES.ADD }
    );
    expect(effect.layer).toBe(LAYERS.SCREEN);
    expect(effect.blendMode).toBe(BLEND_MODES.ADD);
  });

  test("sortEffects orders by layer then type", () => {
    const sorted = sortEffects([
      { type: "b", layer: 2 },
      { type: "a", layer: 2 },
      { type: "c" }
    ]);
    expect(sorted.map((item) => item.type)).toEqual(["c", "a", "b"]);
  });
});

describe("effect serialization", () => {
  test("serializeEffect returns null for empty input", () => {
    expect(serializeEffect(null)).toBeNull();
  });

  test("serializeEffect captures extra fields", () => {
    const effect = TintEffect({ color: "#abc", intensity: 0.9 });
    expect(serializeEffect(effect)).toEqual({
      type: "tint",
      durationMs: 500,
      amplitude: 1,
      color: "#abc",
      frequency: 1,
      layer: COMPOSITION_RULES.tint.layer,
      blendMode: COMPOSITION_RULES.tint.blendMode,
      intensity: 0.9
    });
  });

  test("serializeEffects maps lists", () => {
    const effects = [FlashEffect(), null];
    expect(serializeEffects(effects)).toEqual([serializeEffect(effects[0]), null]);
  });

  test("serializeEffects defaults to empty array", () => {
    expect(serializeEffects()).toEqual([]);
  });
});

describe("effect builders", () => {
  test("Effects.lightning builds layered effects", () => {
    const effects = Effects.lightning({ durationMs: 600, amplitude: 1.2 });
    const serialized = serializeEffects(effects);
    expect(serialized.map((effect) => effect.type)).toEqual([
      "lineArc",
      "flash",
      "screenShake"
    ]);
    expect(serialized).toEqual([
      {
        type: "lineArc",
        durationMs: 600,
        amplitude: 1.2,
        color: "#b3e5ff",
        frequency: 3,
        layer: 2,
        blendMode: "add",
        arcCount: 3,
        thickness: 2
      },
      {
        type: "flash",
        durationMs: 360,
        amplitude: 1.32,
        color: "#ffffff",
        frequency: 3,
        layer: 3,
        blendMode: "screen",
        fade: "out"
      },
      {
        type: "screenShake",
        durationMs: 600,
        amplitude: 4,
        color: "#ffffff",
        frequency: 6,
        layer: 3,
        blendMode: "normal",
        axis: "both"
      }
    ]);
  });

  test("Effects.fireOverlay blends tint and burst", () => {
    const effects = Effects.fireOverlay({ burstColor: "#ff9900" });
    expect(serializeEffects(effects)).toEqual([
      {
        type: "tint",
        durationMs: 900,
        amplitude: 0.7,
        color: "#ff7a33",
        frequency: 1.1,
        layer: 0,
        blendMode: "multiply",
        intensity: 0.7
      },
      {
        type: "radialBurst",
        durationMs: 630,
        amplitude: 0.84,
        color: "#ff9900",
        frequency: 1.54,
        layer: 2,
        blendMode: "add",
        radius: 1.2,
        spokes: 8
      }
    ]);
  });

  test("Effects.poisonPulse keeps defaults", () => {
    const effects = Effects.poisonPulse();
    const serialized = serializeEffects(effects);
    expect(serialized.map((effect) => effect.type)).toEqual([
      "tint",
      "radialBurst",
      "screenShake"
    ]);
    expect(serialized[2].amplitude).toBe(2);
  });
});
