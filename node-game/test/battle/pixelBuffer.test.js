import { createPixelBuffer } from "../../src/battle/rendering/pixelBuffer.js";

describe("pixel buffer", () => {
  test("validates dimensions and length", () => {
    expect(() => createPixelBuffer({ width: 0, height: 1, argbPixels: [0] })).toThrow(
      "Pixel buffer dimensions must be positive"
    );
    expect(() => createPixelBuffer({ width: 1.2, height: 1, argbPixels: [0] })).toThrow(
      "Pixel buffer dimensions must be positive"
    );
    expect(() => createPixelBuffer({ width: 1, height: 1, argbPixels: [0, 1] })).toThrow(
      "Pixel buffer length must match width * height"
    );
    expect(() => createPixelBuffer({ width: 1, height: 1, argbPixels: null })).toThrow(
      "Pixel buffer data is required"
    );
  });

  test("creates immutable buffer", () => {
    const buffer = createPixelBuffer({ width: 1, height: 2, argbPixels: [0, 1] });
    expect(buffer.argbPixels).toHaveLength(2);
    expect(() => buffer.argbPixels.push(2)).toThrow();
  });
});
