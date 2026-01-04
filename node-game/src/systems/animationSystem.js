const DEFAULT_FRAME_DURATION_MS = 100;

function normalizeArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function normalizeDuration(durationMs) {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return DEFAULT_FRAME_DURATION_MS;
  }
  return durationMs;
}

function normalizeSpriteFrame(frame = {}) {
  return Object.freeze({
    durationMs: normalizeDuration(frame.durationMs),
    overlayOps: normalizeArray(frame.overlayOps),
    tintOps: normalizeArray(frame.tintOps),
    recolorOps: normalizeArray(frame.recolorOps)
  });
}

function normalizeEffectFrame(frame = {}) {
  return Object.freeze({
    durationMs: normalizeDuration(frame.durationMs),
    globalOverlays: normalizeArray(frame.globalOverlays),
    cameraOps: normalizeArray(frame.cameraOps)
  });
}

function normalizeFrameSequence(frames, mapper, label) {
  if (!Array.isArray(frames) || frames.length === 0) {
    throw new Error(`${label} track requires a non-empty frameSequence.`);
  }
  return frames.map(mapper);
}

function buildFrameTimeline(frames) {
  const offsets = [];
  let totalDurationMs = 0;
  frames.forEach((frame) => {
    offsets.push(totalDurationMs);
    totalDurationMs += frame.durationMs;
  });
  return { offsets, totalDurationMs };
}

function resolveTimeIndex(timeMs) {
  if (!Number.isFinite(timeMs)) {
    return 0;
  }
  return timeMs < 0 ? 0 : timeMs;
}

function resolveFrameIndex(frames, offsets, timeMs) {
  let resolvedIndex = frames.length - 1;
  for (let index = 0; index < frames.length; index += 1) {
    if (timeMs < offsets[index] + frames[index].durationMs) {
      resolvedIndex = index;
      break;
    }
  }
  return resolvedIndex;
}

/**
 * @typedef {Object} AnimationFrame
 * @property {number} durationMs
 */

/**
 * @typedef {Object} AnimationTrack
 * @property {string} trackType
 * @property {boolean} loop
 * @property {AnimationFrame[]} frameSequence
 */

/**
 * @typedef {AnimationFrame & {
 *   overlayOps: Array,
 *   tintOps: Array,
 *   recolorOps: Array
 * }} SpriteAnimationFrame
 */

/**
 * @typedef {AnimationFrame & {
 *   globalOverlays: Array,
 *   cameraOps: Array
 * }} EffectAnimationFrame
 */

export function createSpriteTrack({ baseSpriteId, frameSequence, loop = true } = {}) {
  const trimmedSpriteId = typeof baseSpriteId === "string" ? baseSpriteId.trim() : "";
  if (trimmedSpriteId.length === 0) {
    throw new Error("Sprite track requires a baseSpriteId.");
  }
  const frames = normalizeFrameSequence(frameSequence, normalizeSpriteFrame, "Sprite");
  return Object.freeze({
    trackType: "sprite",
    baseSpriteId: trimmedSpriteId,
    loop: Boolean(loop),
    frameSequence: frames
  });
}

export function createEffectTrack({ frameSequence, loop = true } = {}) {
  const frames = normalizeFrameSequence(frameSequence, normalizeEffectFrame, "Effect");
  return Object.freeze({
    trackType: "effect",
    loop: Boolean(loop),
    frameSequence: frames
  });
}

export function createFrameCursor(track) {
  if (!track || !Array.isArray(track.frameSequence) || track.frameSequence.length === 0) {
    throw new Error("FrameCursor requires a track with frames.");
  }

  const frames = track.frameSequence;
  const { offsets, totalDurationMs } = buildFrameTimeline(frames);

  function resolveFrameAt(timeMs) {
    const resolvedTime = resolveTimeIndex(timeMs);
    const normalizedTime = track.loop && totalDurationMs > 0
      ? resolvedTime % totalDurationMs
      : resolvedTime;
    const frameIndex = resolveFrameIndex(frames, offsets, normalizedTime);
    const startMs = offsets[frameIndex];
    return {
      frameIndex,
      frame: frames[frameIndex],
      startMs,
      endMs: startMs + frames[frameIndex].durationMs,
      elapsedMs: normalizedTime - startMs,
      totalDurationMs
    };
  }

  return Object.freeze({
    trackType: track.trackType ?? "unknown",
    totalDurationMs,
    frameSequence: frames,
    resolveFrameAt
  });
}
