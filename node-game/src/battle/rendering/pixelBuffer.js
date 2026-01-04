export function createPixelBuffer({ width, height, argbPixels }) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error("Pixel buffer dimensions must be positive.");
  }
  if (!Array.isArray(argbPixels)) {
    throw new Error("Pixel buffer data is required.");
  }
  if (argbPixels.length !== width * height) {
    throw new Error("Pixel buffer length must match width * height.");
  }
  return Object.freeze({
    width,
    height,
    argbPixels: Object.freeze([...argbPixels])
  });
}
