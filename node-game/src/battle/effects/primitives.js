import { applyComposition } from "./composition.js";

const DEFAULT_PARAMS = Object.freeze({
  durationMs: 500,
  amplitude: 1,
  color: "#ffffff",
  frequency: 1
});

function normalizeParams({ durationMs, amplitude, color, frequency } = {}) {
  return {
    durationMs: durationMs ?? DEFAULT_PARAMS.durationMs,
    amplitude: amplitude ?? DEFAULT_PARAMS.amplitude,
    color: color ?? DEFAULT_PARAMS.color,
    frequency: frequency ?? DEFAULT_PARAMS.frequency
  };
}

function buildEffect(type, params, extras) {
  const base = {
    type,
    ...normalizeParams(params),
    ...extras
  };
  return applyComposition(base);
}

export function TintEffect({ durationMs, amplitude, color, frequency, intensity = 0.6 } = {}) {
  return buildEffect("tint", { durationMs, amplitude, color, frequency }, { intensity });
}

export function FlashEffect({ durationMs, amplitude, color, frequency, fade = "out" } = {}) {
  return buildEffect("flash", { durationMs, amplitude, color, frequency }, { fade });
}

export function LineArcEffect({
  durationMs,
  amplitude,
  color,
  frequency,
  arcCount = 2,
  thickness = 2
} = {}) {
  return buildEffect(
    "lineArc",
    { durationMs, amplitude, color, frequency },
    { arcCount, thickness }
  );
}

export function RadialBurstEffect({
  durationMs,
  amplitude,
  color,
  frequency,
  radius = 1,
  spokes = 8
} = {}) {
  return buildEffect(
    "radialBurst",
    { durationMs, amplitude, color, frequency },
    { radius, spokes }
  );
}

export function ScreenShakeEffect({
  durationMs,
  amplitude,
  color,
  frequency,
  axis = "both"
} = {}) {
  return buildEffect(
    "screenShake",
    { durationMs, amplitude, color, frequency },
    { axis }
  );
}

export const __test = { normalizeParams, buildEffect };
