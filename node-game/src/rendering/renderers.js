import { createBitmap, rasterize } from './rasterizer.js';
import { isDrawOp } from './drawOps.js';

export const orderDrawOps = (ops) => {
  if (!Array.isArray(ops)) {
    throw new Error('Draw ops must be an array.');
  }
  return ops
    .map((op, index) => {
      if (!isDrawOp(op)) {
        throw new Error(`Invalid draw op at index ${index}.`);
      }
      return { op, index, zIndex: op.zIndex ?? 0 };
    })
    .sort((a, b) => {
      if (a.zIndex === b.zIndex) {
        return a.index - b.index;
      }
      return a.zIndex - b.zIndex;
    });
};

export class OpsCollectorRenderer {
  render(ops) {
    return {
      orderedOps: orderDrawOps(ops).map(({ op }) => op)
    };
  }
}

export class BitmapRenderer {
  constructor({ width, height, backgroundColor } = {}) {
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
  }

  render(ops) {
    const ordered = orderDrawOps(ops).map(({ op }) => op);
    const bitmap = createBitmap({
      width: this.width,
      height: this.height,
      backgroundColor: this.backgroundColor
    });
    return rasterize({ bitmap, ops: ordered });
  }
}
