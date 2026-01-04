function freezeList(list) {
  return Object.freeze([...list]);
}

export function createAnimationFrame({
  durationMs,
  overlayOps = [],
  spriteRecolorOps = [],
  screenTintOps = [],
  particleOps = []
}) {
  if (!Number.isInteger(durationMs) || durationMs <= 0) {
    throw new Error("Frame duration must be positive.");
  }
  if (!Array.isArray(overlayOps) || !Array.isArray(spriteRecolorOps)) {
    throw new Error("Frame operations cannot be null.");
  }
  if (!Array.isArray(screenTintOps) || !Array.isArray(particleOps)) {
    throw new Error("Frame operations cannot be null.");
  }
  return Object.freeze({
    durationMs,
    overlayOps: freezeList(overlayOps),
    spriteRecolorOps: freezeList(spriteRecolorOps),
    screenTintOps: freezeList(screenTintOps),
    particleOps: freezeList(particleOps)
  });
}

export function createEmptyAnimationFrame(durationMs) {
  return createAnimationFrame({ durationMs });
}
