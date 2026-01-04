import {
  DrawOpType,
  createApplyTint,
  createDrawArc,
  createDrawGradient,
  createDrawLine,
  createDrawRect,
  createDrawSprite,
  createSpriteBitmap,
  isDrawOp
} from '../../src/rendering/drawOps.js';

describe('draw ops', () => {
  test('creates sprite bitmap with validation', () => {
    const sprite = createSpriteBitmap({
      width: 1,
      height: 1,
      pixels: [255, 0, 0, 255]
    });

    expect(sprite.width).toBe(1);
    expect(sprite.height).toBe(1);
    expect(sprite.pixels).toBeInstanceOf(Uint8ClampedArray);
    expect(Object.isFrozen(sprite)).toBe(true);
  });

  test('sprite bitmap validation errors', () => {
    expect(() =>
      createSpriteBitmap({ width: 0, height: 1, pixels: [] })
    ).toThrow('Sprite width must be a positive integer.');
    expect(() =>
      createSpriteBitmap({ width: 1, height: 0, pixels: [] })
    ).toThrow('Sprite height must be a positive integer.');
    expect(() =>
      createSpriteBitmap({ width: 1, height: 1, pixels: [] })
    ).toThrow('Sprite pixel data has an unexpected length.');
  });

  test('creates draw ops with defaults', () => {
    const sprite = createSpriteBitmap({
      width: 1,
      height: 1,
      pixels: [0, 0, 0, 255]
    });
    const drawSprite = createDrawSprite({ sprite, x: 1, y: 2 });
    const drawRect = createDrawRect({ x: 0, y: 0, width: 2, height: 2, color: { r: 1, g: 2, b: 3 } });
    const drawLine = createDrawLine({ x1: 0, y1: 0, x2: 1, y2: 1, color: { r: 1, g: 2, b: 3 } });
    const drawArc = createDrawArc({ cx: 0, cy: 0, radius: 1, startAngle: 0, endAngle: 1, color: { r: 1, g: 2, b: 3 } });
    const drawGradient = createDrawGradient({
      x: 0,
      y: 0,
      width: 2,
      height: 1,
      startColor: { r: 0, g: 0, b: 0 },
      endColor: { r: 255, g: 255, b: 255 },
      direction: 'horizontal'
    });
    const applyTint = createApplyTint({ x: 0, y: 0, width: 1, height: 1, color: { r: 255, g: 0, b: 0 } });

    expect(drawSprite.opacity).toBe(1);
    expect(drawSprite.zIndex).toBe(0);
    expect(drawRect.type).toBe(DrawOpType.DrawRect);
    expect(drawLine.type).toBe(DrawOpType.DrawLine);
    expect(drawArc.type).toBe(DrawOpType.DrawArc);
    expect(drawGradient.type).toBe(DrawOpType.DrawGradient);
    expect(applyTint.type).toBe(DrawOpType.ApplyTint);
    expect(Object.isFrozen(drawRect)).toBe(true);
  });

  test('clamps opacity to valid range', () => {
    const drawRect = createDrawRect({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      color: { r: 0, g: 0, b: 0 },
      opacity: 2
    });
    const drawLine = createDrawLine({
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 1,
      color: { r: 0, g: 0, b: 0 },
      opacity: -1
    });

    expect(drawRect.opacity).toBe(1);
    expect(drawLine.opacity).toBe(0);
  });

  test('rejects invalid draw sprite input', () => {
    expect(() => createDrawSprite({ x: 0, y: 0 })).toThrow(
      'DrawSprite requires a sprite bitmap.'
    );
  });

  test('validates opacity and zIndex', () => {
    const sprite = createSpriteBitmap({
      width: 1,
      height: 1,
      pixels: [0, 0, 0, 255]
    });
    expect(() =>
      createDrawSprite({ sprite, x: 0, y: 0, opacity: 'nope' })
    ).toThrow('Opacity must be a number.');
    expect(() =>
      createDrawSprite({ sprite, x: 0, y: 0, zIndex: 'bad' })
    ).toThrow('zIndex must be a number.');
  });

  test('isDrawOp identifies draw ops', () => {
    const drawRect = createDrawRect({ x: 0, y: 0, width: 1, height: 1, color: { r: 0, g: 0, b: 0 } });
    expect(isDrawOp(drawRect)).toBe(true);
    expect(isDrawOp({ type: 'Unknown' })).toBe(false);
    expect(isDrawOp(null)).toBe(false);
  });
});
