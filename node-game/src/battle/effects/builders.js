import {
  FlashEffect,
  LineArcEffect,
  RadialBurstEffect,
  ScreenShakeEffect,
  TintEffect
} from "./primitives.js";
import { sortEffects } from "./composition.js";

export const Effects = Object.freeze({
  lightning({
    durationMs = 450,
    amplitude = 1,
    color = "#b3e5ff",
    frequency = 3,
    flashColor = "#ffffff",
    shakeAmplitude = 4
  } = {}) {
    const effects = [
      LineArcEffect({ durationMs, amplitude, color, frequency, arcCount: 3 }),
      FlashEffect({
        durationMs: Math.round(durationMs * 0.6),
        amplitude: amplitude * 1.1,
        color: flashColor,
        frequency
      }),
      ScreenShakeEffect({
        durationMs,
        amplitude: shakeAmplitude,
        color: flashColor,
        frequency: frequency * 2
      })
    ];
    return sortEffects(effects);
  },
  fireOverlay({
    durationMs = 900,
    amplitude = 0.7,
    color = "#ff7a33",
    frequency = 1.1,
    burstColor = "#ffcf5a"
  } = {}) {
    const effects = [
      TintEffect({ durationMs, amplitude, color, frequency, intensity: 0.7 }),
      RadialBurstEffect({
        durationMs: Math.round(durationMs * 0.7),
        amplitude: amplitude * 1.2,
        color: burstColor,
        frequency: frequency * 1.4,
        radius: 1.2
      })
    ];
    return sortEffects(effects);
  },
  poisonPulse({
    durationMs = 800,
    amplitude = 0.6,
    color = "#5ad36a",
    frequency = 1.6,
    shakeAmplitude = 2
  } = {}) {
    const effects = [
      TintEffect({ durationMs, amplitude, color, frequency, intensity: 0.5 }),
      RadialBurstEffect({
        durationMs: Math.round(durationMs * 0.5),
        amplitude,
        color,
        frequency: frequency * 2,
        radius: 0.8
      }),
      ScreenShakeEffect({
        durationMs: Math.round(durationMs * 0.4),
        amplitude: shakeAmplitude,
        color,
        frequency: frequency * 2
      })
    ];
    return sortEffects(effects);
  }
});
