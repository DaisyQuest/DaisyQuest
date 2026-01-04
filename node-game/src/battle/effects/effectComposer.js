import { createAnimationFrame } from "../animation/animationFrame.js";
import { isTimedOverlayActive } from "./TimedOverlay.js";
import { isTintEffectActive } from "./TintEffect.js";
import { isPaletteSwapActive } from "./PaletteSwapEffect.js";
import { isTimedParticleActive } from "./TimedParticleEffect.js";

export function composeEffectFrame({ timeMs, durationMs, timeline }) {
  if (typeof timeMs !== "number" || timeMs < 0) {
    throw new Error("Time must be non-negative.");
  }
  if (!Number.isInteger(durationMs) || durationMs <= 0) {
    throw new Error("Duration must be positive.");
  }
  if (!timeline) {
    throw new Error("Effect timeline is required.");
  }
  const overlayOps = timeline.overlays.filter((overlay) => isTimedOverlayActive(overlay, timeMs));
  const screenTintOps = timeline.tints.filter((tint) => isTintEffectActive(tint, timeMs));
  const spriteRecolorOps = timeline.paletteSwaps.filter((swap) => isPaletteSwapActive(swap, timeMs));
  const particleOps = timeline.particles.filter((particle) => isTimedParticleActive(particle, timeMs));
  return createAnimationFrame({
    durationMs,
    overlayOps: overlayOps.map((overlay) => overlay.overlayOp),
    spriteRecolorOps: spriteRecolorOps.map((swap) => swap.recolorOp),
    screenTintOps: screenTintOps.map((tint) => tint.tintOp),
    particleOps: particleOps.map((particle) => particle.particleOp)
  });
}
