export function createEffectTimeline({ overlays = [], tints = [], paletteSwaps = [], particles = [] } = {}) {
  if (!Array.isArray(overlays) || !Array.isArray(tints)) {
    throw new Error("Effect timeline collections must be arrays.");
  }
  if (!Array.isArray(paletteSwaps) || !Array.isArray(particles)) {
    throw new Error("Effect timeline collections must be arrays.");
  }
  return Object.freeze({
    overlays: Object.freeze([...overlays]),
    tints: Object.freeze([...tints]),
    paletteSwaps: Object.freeze([...paletteSwaps]),
    particles: Object.freeze([...particles])
  });
}
