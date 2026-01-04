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

  test("LineArcEffect uses default extras when omitted", () => {
    const arc = LineArcEffect();
    expect(arc.arcCount).toBe(2);
    expect(arc.thickness).toBe(2);
  });

  test("RadialBurstEffect uses default extras when omitted", () => {
    const burst = RadialBurstEffect();
    expect(burst.radius).toBe(1);
    expect(burst.spokes).toBe(8);
  });

  test("ScreenShakeEffect keeps axis configuration", () => {
    const effect = ScreenShakeEffect({ axis: "x" });
    expect(effect.axis).toBe("x");
    expect(effect.color).toBe("#ffffff");
  });

  test("ScreenShakeEffect defaults to a dual-axis shake", () => {
    const effect = ScreenShakeEffect();
    expect(effect.axis).toBe("both");
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

  test("applyComposition respects effect-provided metadata when rules exist", () => {
    const effect = applyComposition({
      type: "flash",
      durationMs: 100,
      amplitude: 1,
      color: "#fff",
      frequency: 1,
      layer: LAYERS.BACKGROUND,
      blendMode: BLEND_MODES.ADD
    });
    expect(effect.layer).toBe(LAYERS.BACKGROUND);
    expect(effect.blendMode).toBe(BLEND_MODES.ADD);
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

  test("sortEffects defaults to an empty list", () => {
    expect(sortEffects()).toEqual([]);
  });

  test("sortEffects falls back to empty types for ordering", () => {
    const sorted = sortEffects([{ layer: 1 }, { type: "alpha", layer: 1 }]);
    expect(sorted.map((item) => item.type ?? "")).toEqual(["", "alpha"]);
  });

  test("sortEffects defaults to midground layers when undefined", () => {
    const sorted = sortEffects([{ type: "beta" }, {}]);
    expect(sorted.map((item) => item.type ?? "")).toEqual(["", "beta"]);
  });

  test("sortEffects compares empty types when both are missing", () => {
    const sorted = sortEffects([{}, {}]);
    expect(sorted.map((item) => item.type ?? "")).toEqual(["", ""]);
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

  test("serializeEffect skips undefined keys", () => {
    expect(serializeEffect({ type: "mystery", durationMs: 250 })).toEqual({
      type: "mystery",
      durationMs: 250
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
    expect(serialized).toMatchInlineSnapshot(`
[
  {
    "amplitude": 1.2,
    "arcCount": 3,
    "blendMode": "add",
    "color": "#b3e5ff",
    "durationMs": 600,
    "frequency": 3,
    "layer": 2,
    "thickness": 2,
    "type": "lineArc",
  },
  {
    "amplitude": 1.32,
    "blendMode": "screen",
    "color": "#ffffff",
    "durationMs": 360,
    "fade": "out",
    "frequency": 3,
    "layer": 3,
    "type": "flash",
  },
  {
    "amplitude": 4,
    "axis": "both",
    "blendMode": "normal",
    "color": "#ffffff",
    "durationMs": 600,
    "frequency": 6,
    "layer": 3,
    "type": "screenShake",
  },
]
`);
  });

  test("Effects.lightning uses default values when omitted", () => {
    const effects = Effects.lightning();
    const serialized = serializeEffects(effects);
    expect(serialized[0].durationMs).toBe(450);
    expect(serialized[0].amplitude).toBe(1);
  });

  test("Effects.fireOverlay blends tint and burst", () => {
    const effects = Effects.fireOverlay({ burstColor: "#ff9900" });
    expect(serializeEffects(effects)).toMatchInlineSnapshot(`
[
  {
    "amplitude": 0.7,
    "blendMode": "multiply",
    "color": "#ff7a33",
    "durationMs": 900,
    "frequency": 1.1,
    "intensity": 0.7,
    "layer": 0,
    "type": "tint",
  },
  {
    "amplitude": 0.84,
    "blendMode": "add",
    "color": "#ff9900",
    "durationMs": 630,
    "frequency": 1.54,
    "layer": 2,
    "radius": 1.2,
    "spokes": 8,
    "type": "radialBurst",
  },
]
`);
  });

  test("Effects.fireOverlay uses its default burst color", () => {
    const effects = Effects.fireOverlay();
    const serialized = serializeEffects(effects);
    expect(serialized[1].color).toBe("#ffcf5a");
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
