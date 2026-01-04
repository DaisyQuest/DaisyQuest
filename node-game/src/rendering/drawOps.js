export const DrawOpType = Object.freeze({
  DrawSprite: 'DrawSprite',
  DrawRect: 'DrawRect',
  DrawLine: 'DrawLine',
  DrawArc: 'DrawArc',
  DrawGradient: 'DrawGradient',
  ApplyTint: 'ApplyTint'
});

const freezeOp = (op) => Object.freeze({ ...op });

const normalizeOpacity = (opacity) => {
  if (opacity === undefined) {
    return 1;
  }
  if (typeof opacity !== 'number' || Number.isNaN(opacity)) {
    throw new Error('Opacity must be a number.');
  }
  return Math.min(1, Math.max(0, opacity));
};

const normalizeZIndex = (zIndex) => {
  if (zIndex === undefined) {
    return 0;
  }
  if (typeof zIndex !== 'number' || Number.isNaN(zIndex)) {
    throw new Error('zIndex must be a number.');
  }
  return zIndex;
};

export const createSpriteBitmap = ({ width, height, pixels }) => {
  if (!Number.isInteger(width) || width <= 0) {
    throw new Error('Sprite width must be a positive integer.');
  }
  if (!Number.isInteger(height) || height <= 0) {
    throw new Error('Sprite height must be a positive integer.');
  }
  const expected = width * height * 4;
  if (!pixels || pixels.length !== expected) {
    throw new Error('Sprite pixel data has an unexpected length.');
  }
  return Object.freeze({
    width,
    height,
    pixels: Uint8ClampedArray.from(pixels)
  });
};

export const createDrawSprite = ({ sprite, x, y, opacity, zIndex }) => {
  if (!sprite || typeof sprite.width !== 'number') {
    throw new Error('DrawSprite requires a sprite bitmap.');
  }
  return freezeOp({
    type: DrawOpType.DrawSprite,
    sprite,
    x,
    y,
    opacity: normalizeOpacity(opacity),
    zIndex: normalizeZIndex(zIndex)
  });
};

export const createDrawRect = ({ x, y, width, height, color, opacity, zIndex }) => {
  return freezeOp({
    type: DrawOpType.DrawRect,
    x,
    y,
    width,
    height,
    color,
    opacity: normalizeOpacity(opacity),
    zIndex: normalizeZIndex(zIndex)
  });
};

export const createDrawLine = ({ x1, y1, x2, y2, color, opacity, zIndex }) => {
  return freezeOp({
    type: DrawOpType.DrawLine,
    x1,
    y1,
    x2,
    y2,
    color,
    opacity: normalizeOpacity(opacity),
    zIndex: normalizeZIndex(zIndex)
  });
};

export const createDrawArc = ({ cx, cy, radius, startAngle, endAngle, color, opacity, zIndex }) => {
  return freezeOp({
    type: DrawOpType.DrawArc,
    cx,
    cy,
    radius,
    startAngle,
    endAngle,
    color,
    opacity: normalizeOpacity(opacity),
    zIndex: normalizeZIndex(zIndex)
  });
};

export const createDrawGradient = ({
  x,
  y,
  width,
  height,
  startColor,
  endColor,
  direction,
  opacity,
  zIndex
}) => {
  return freezeOp({
    type: DrawOpType.DrawGradient,
    x,
    y,
    width,
    height,
    startColor,
    endColor,
    direction,
    opacity: normalizeOpacity(opacity),
    zIndex: normalizeZIndex(zIndex)
  });
};

export const createApplyTint = ({ x, y, width, height, color, opacity, zIndex }) => {
  return freezeOp({
    type: DrawOpType.ApplyTint,
    x,
    y,
    width,
    height,
    color,
    opacity: normalizeOpacity(opacity),
    zIndex: normalizeZIndex(zIndex)
  });
};

export const isDrawOp = (op) =>
  Boolean(op && typeof op === 'object' && Object.values(DrawOpType).includes(op.type));
