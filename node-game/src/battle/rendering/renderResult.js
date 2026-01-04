export function createRenderResult({ renderOps = [], pixelBuffer = null }) {
  if (!Array.isArray(renderOps)) {
    throw new Error("Render ops must be an array.");
  }
  return Object.freeze({
    renderOps: Object.freeze([...renderOps]),
    pixelBuffer
  });
}
