import {
  createDrawRect
} from '../../src/rendering/drawOps.js';
import { DrawOpType } from '../../src/rendering/drawOps.js';
import { BitmapRenderer, OpsCollectorRenderer, orderDrawOps } from '../../src/rendering/renderers.js';

const readPixel = (bitmap, x, y) => {
  const idx = (y * bitmap.width + x) * 4;
  return Array.from(bitmap.pixels.slice(idx, idx + 4));
};

describe('renderers', () => {
  test('orderDrawOps sorts by zIndex and preserves insertion order', () => {
    const first = createDrawRect({ x: 0, y: 0, width: 1, height: 1, color: { r: 1, g: 0, b: 0 }, zIndex: 2 });
    const second = createDrawRect({ x: 0, y: 0, width: 1, height: 1, color: { r: 2, g: 0, b: 0 }, zIndex: 1 });
    const third = createDrawRect({ x: 0, y: 0, width: 1, height: 1, color: { r: 3, g: 0, b: 0 }, zIndex: 2 });

    const ordered = orderDrawOps([first, second, third]).map(({ op }) => op);
    expect(ordered).toEqual([second, first, third]);
  });

  test('orderDrawOps defaults zIndex when missing', () => {
    const op = { type: DrawOpType.DrawRect, x: 0, y: 0, width: 1, height: 1, color: { r: 0, g: 0, b: 0 } };
    const ordered = orderDrawOps([op]);

    expect(ordered[0].zIndex).toBe(0);
  });

  test('orderDrawOps rejects invalid inputs', () => {
    expect(() => orderDrawOps('nope')).toThrow('Draw ops must be an array.');
    expect(() => orderDrawOps([{ type: 'Unknown' }])).toThrow('Invalid draw op at index 0.');
  });

  test('OpsCollectorRenderer returns ordered ops without side effects', () => {
    const rectA = createDrawRect({ x: 0, y: 0, width: 1, height: 1, color: { r: 10, g: 0, b: 0 }, zIndex: 1 });
    const rectB = createDrawRect({ x: 0, y: 0, width: 1, height: 1, color: { r: 20, g: 0, b: 0 }, zIndex: 0 });

    const renderer = new OpsCollectorRenderer();
    const result = renderer.render([rectA, rectB]);

    expect(result.orderedOps).toEqual([rectB, rectA]);
  });

  test('BitmapRenderer respects zIndex ordering', () => {
    const rectBack = createDrawRect({ x: 0, y: 0, width: 1, height: 1, color: { r: 0, g: 0, b: 255, a: 255 }, zIndex: 0 });
    const rectFront = createDrawRect({ x: 0, y: 0, width: 1, height: 1, color: { r: 255, g: 0, b: 0, a: 255 }, zIndex: 5 });

    const renderer = new BitmapRenderer({ width: 1, height: 1 });
    const bitmap = renderer.render([rectFront, rectBack]);

    expect(readPixel(bitmap, 0, 0)).toEqual([255, 0, 0, 255]);
  });

  test('BitmapRenderer uses default constructor values', () => {
    const renderer = new BitmapRenderer();
    const rect = createDrawRect({ x: 0, y: 0, width: 1, height: 1, color: { r: 0, g: 0, b: 0 } });

    expect(() => renderer.render([rect])).toThrow('Bitmap width must be a positive integer.');
  });
});
