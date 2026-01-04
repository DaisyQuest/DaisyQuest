import {
  createApplyTint,
  createDrawArc,
  createDrawGradient,
  createDrawLine,
  createDrawRect,
  createDrawSprite,
  createSpriteBitmap
} from '../../src/rendering/drawOps.js';
import { createBitmap, rasterize } from '../../src/rendering/rasterizer.js';

const readPixel = (bitmap, x, y) => {
  const idx = (y * bitmap.width + x) * 4;
  return Array.from(bitmap.pixels.slice(idx, idx + 4));
};

describe('rasterizer', () => {
  test('createBitmap validation', () => {
    expect(() => createBitmap({ width: 0, height: 1 })).toThrow(
      'Bitmap width must be a positive integer.'
    );
    expect(() => createBitmap({ width: 1, height: 0 })).toThrow(
      'Bitmap height must be a positive integer.'
    );
  });

  test('rasterize validates inputs', () => {
    expect(() => rasterize({ bitmap: null, ops: [] })).toThrow(
      'A bitmap is required for rasterization.'
    );
    expect(() => rasterize({ bitmap: createBitmap({ width: 1, height: 1 }), ops: 'nope' })).toThrow(
      'Draw ops must be provided as an array.'
    );
    expect(() =>
      rasterize({ bitmap: createBitmap({ width: 1, height: 1 }), ops: [{ type: 'Unknown' }] })
    ).toThrow('Unsupported draw op: Unknown');
    expect(() =>
      rasterize({ bitmap: createBitmap({ width: 1, height: 1 }), ops: [null] })
    ).toThrow('Unsupported draw op: unknown');
  });

  test('rasterize rejects invalid colors', () => {
    const bitmap = createBitmap({ width: 1, height: 1 });
    const op = createDrawRect({ x: 0, y: 0, width: 1, height: 1, color: null });
    expect(() => rasterize({ bitmap, ops: [op] })).toThrow('Color must be an object.');
  });

  test('normalizeColor clamps and defaults channels', () => {
    const bitmap = createBitmap({ width: 1, height: 1 });
    const op = createDrawRect({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      color: { r: 999, g: -5 }
    });
    rasterize({ bitmap, ops: [op] });

    expect(readPixel(bitmap, 0, 0)).toEqual([255, 0, 0, 255]);
  });

  test('normalizeColor uses fallback for missing channels', () => {
    const bitmap = createBitmap({ width: 1, height: 1 });
    const op = createDrawRect({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      color: { b: 50 }
    });
    rasterize({ bitmap, ops: [op] });

    expect(readPixel(bitmap, 0, 0)).toEqual([0, 0, 50, 255]);
  });

  test('drawRect fills pixels with blending', () => {
    const bitmap = createBitmap({ width: 2, height: 2 });
    const op = createDrawRect({
      x: 0,
      y: 0,
      width: 2,
      height: 2,
      color: { r: 255, g: 0, b: 0, a: 128 }
    });
    rasterize({ bitmap, ops: [op] });

    expect(readPixel(bitmap, 0, 0)).toEqual([255, 0, 0, 128]);
  });

  test('drawRect respects transparent blending edge case', () => {
    const bitmap = createBitmap({ width: 1, height: 1 });
    const op = createDrawRect({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      color: { r: 20, g: 40, b: 60, a: 0 }
    });
    rasterize({ bitmap, ops: [op] });

    expect(readPixel(bitmap, 0, 0)).toEqual([0, 0, 0, 0]);
  });

  test('drawRect ignores out-of-bounds pixels', () => {
    const bitmap = createBitmap({ width: 1, height: 1 });
    const op = createDrawRect({
      x: -1,
      y: -1,
      width: 2,
      height: 2,
      color: { r: 10, g: 20, b: 30, a: 255 }
    });
    rasterize({ bitmap, ops: [op] });

    expect(readPixel(bitmap, 0, 0)).toEqual([10, 20, 30, 255]);
  });

  test('drawLine draws a diagonal', () => {
    const bitmap = createBitmap({ width: 3, height: 3 });
    const op = createDrawLine({
      x1: 0,
      y1: 0,
      x2: 2,
      y2: 2,
      color: { r: 0, g: 255, b: 0, a: 255 }
    });
    rasterize({ bitmap, ops: [op] });

    expect(readPixel(bitmap, 0, 0)[1]).toBe(255);
    expect(readPixel(bitmap, 1, 1)[1]).toBe(255);
    expect(readPixel(bitmap, 2, 2)[1]).toBe(255);
  });

  test('drawLine handles horizontal and vertical lines', () => {
    const bitmap = createBitmap({ width: 3, height: 3 });
    const horizontal = createDrawLine({
      x1: 0,
      y1: 1,
      x2: 2,
      y2: 1,
      color: { r: 0, g: 255, b: 0, a: 255 }
    });
    const vertical = createDrawLine({
      x1: 1,
      y1: 0,
      x2: 1,
      y2: 2,
      color: { r: 0, g: 255, b: 0, a: 255 }
    });
    rasterize({ bitmap, ops: [horizontal, vertical] });

    expect(readPixel(bitmap, 0, 1)[1]).toBe(255);
    expect(readPixel(bitmap, 1, 0)[1]).toBe(255);
  });

  test('drawArc renders points along the arc', () => {
    const bitmap = createBitmap({ width: 3, height: 3 });
    const op = createDrawArc({
      cx: 1,
      cy: 1,
      radius: 1,
      startAngle: 0,
      endAngle: Math.PI / 2,
      color: { r: 0, g: 0, b: 255, a: 255 }
    });
    rasterize({ bitmap, ops: [op] });

    const right = readPixel(bitmap, 2, 1)[2];
    const down = readPixel(bitmap, 1, 2)[2];
    expect(right + down).toBeGreaterThan(0);
  });

  test('drawGradient interpolates colors', () => {
    const bitmap = createBitmap({ width: 2, height: 1 });
    const op = createDrawGradient({
      x: 0,
      y: 0,
      width: 2,
      height: 1,
      startColor: { r: 0, g: 0, b: 0, a: 255 },
      endColor: { r: 255, g: 255, b: 255, a: 255 },
      direction: 'horizontal'
    });
    rasterize({ bitmap, ops: [op] });

    expect(readPixel(bitmap, 0, 0)).toEqual([0, 0, 0, 255]);
    expect(readPixel(bitmap, 1, 0)).toEqual([255, 255, 255, 255]);
  });

  test('drawGradient defaults to vertical interpolation', () => {
    const bitmap = createBitmap({ width: 1, height: 2 });
    const op = createDrawGradient({
      x: 0,
      y: 0,
      width: 1,
      height: 2,
      startColor: { r: 10, g: 10, b: 10, a: 255 },
      endColor: { r: 200, g: 200, b: 200, a: 255 },
      direction: 'vertical'
    });
    rasterize({ bitmap, ops: [op] });

    expect(readPixel(bitmap, 0, 0)).toEqual([10, 10, 10, 255]);
    expect(readPixel(bitmap, 0, 1)).toEqual([200, 200, 200, 255]);
  });

  test('drawSprite respects opacity', () => {
    const bitmap = createBitmap({ width: 1, height: 1 });
    const sprite = createSpriteBitmap({ width: 1, height: 1, pixels: [100, 0, 0, 200] });
    const op = createDrawSprite({ sprite, x: 0, y: 0, opacity: 0.5 });
    rasterize({ bitmap, ops: [op] });

    expect(readPixel(bitmap, 0, 0)).toEqual([100, 0, 0, 100]);
  });

  test('drawSprite defaults opacity to full', () => {
    const bitmap = createBitmap({ width: 1, height: 1 });
    const sprite = createSpriteBitmap({ width: 1, height: 1, pixels: [10, 20, 30, 255] });
    const op = { type: 'DrawSprite', sprite, x: 0, y: 0 };
    rasterize({ bitmap, ops: [op] });

    expect(readPixel(bitmap, 0, 0)).toEqual([10, 20, 30, 255]);
  });

  test('applyTint multiplies colors in region', () => {
    const bitmap = createBitmap({ width: 1, height: 1 });
    const rect = createDrawRect({ x: 0, y: 0, width: 1, height: 1, color: { r: 200, g: 200, b: 200, a: 255 } });
    const tint = createApplyTint({ x: -1, y: 0, width: 2, height: 1, color: { r: 255, g: 0, b: 0, a: 128 } });
    rasterize({ bitmap, ops: [rect, tint] });

    const [r, g, b, a] = readPixel(bitmap, 0, 0);
    expect(r).toBeGreaterThan(100);
    expect(g).toBeLessThan(r);
    expect(b).toBeLessThan(r);
    expect(a).toBe(255);
  });
});
