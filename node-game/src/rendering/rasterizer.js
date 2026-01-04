import { DrawOpType, isDrawOp } from './drawOps.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeColor = (color, opacity = 1) => {
  if (!color || typeof color !== 'object') {
    throw new Error('Color must be an object.');
  }
  const r = clamp(color.r ?? 0, 0, 255);
  const g = clamp(color.g ?? 0, 0, 255);
  const b = clamp(color.b ?? 0, 0, 255);
  const a = clamp(color.a ?? 255, 0, 255);
  const alpha = clamp(a * opacity, 0, 255);
  return { r, g, b, a: alpha };
};

export const createBitmap = ({ width, height, backgroundColor }) => {
  if (!Number.isInteger(width) || width <= 0) {
    throw new Error('Bitmap width must be a positive integer.');
  }
  if (!Number.isInteger(height) || height <= 0) {
    throw new Error('Bitmap height must be a positive integer.');
  }
  const pixels = new Uint8ClampedArray(width * height * 4);
  const color = normalizeColor(backgroundColor ?? { r: 0, g: 0, b: 0, a: 0 });
  for (let i = 0; i < width * height; i += 1) {
    const offset = i * 4;
    pixels[offset] = color.r;
    pixels[offset + 1] = color.g;
    pixels[offset + 2] = color.b;
    pixels[offset + 3] = color.a;
  }
  return { width, height, pixels };
};

const blendPixel = (dst, src) => {
  const srcA = src.a / 255;
  const dstA = dst.a / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA === 0) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  const r = (src.r * srcA + dst.r * dstA * (1 - srcA)) / outA;
  const g = (src.g * srcA + dst.g * dstA * (1 - srcA)) / outA;
  const b = (src.b * srcA + dst.b * dstA * (1 - srcA)) / outA;
  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
    a: Math.round(outA * 255)
  };
};

const readPixel = (bitmap, x, y) => {
  const idx = (y * bitmap.width + x) * 4;
  return {
    r: bitmap.pixels[idx],
    g: bitmap.pixels[idx + 1],
    b: bitmap.pixels[idx + 2],
    a: bitmap.pixels[idx + 3]
  };
};

const writePixel = (bitmap, x, y, color) => {
  const idx = (y * bitmap.width + x) * 4;
  bitmap.pixels[idx] = color.r;
  bitmap.pixels[idx + 1] = color.g;
  bitmap.pixels[idx + 2] = color.b;
  bitmap.pixels[idx + 3] = color.a;
};

const drawPoint = (bitmap, x, y, color) => {
  if (x < 0 || y < 0 || x >= bitmap.width || y >= bitmap.height) {
    return;
  }
  const dst = readPixel(bitmap, x, y);
  const blended = blendPixel(dst, color);
  writePixel(bitmap, x, y, blended);
};

const drawRect = (bitmap, op) => {
  const color = normalizeColor(op.color, op.opacity);
  const x0 = Math.floor(op.x);
  const y0 = Math.floor(op.y);
  const x1 = Math.floor(op.x + op.width);
  const y1 = Math.floor(op.y + op.height);
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      drawPoint(bitmap, x, y, color);
    }
  }
};

const drawLine = (bitmap, op) => {
  const color = normalizeColor(op.color, op.opacity);
  let x0 = Math.round(op.x1);
  let y0 = Math.round(op.y1);
  const x1 = Math.round(op.x2);
  const y1 = Math.round(op.y2);
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    drawPoint(bitmap, x0, y0, color);
    if (x0 === x1 && y0 === y1) {
      break;
    }
    const e2 = err * 2;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
};

const drawArc = (bitmap, op) => {
  const color = normalizeColor(op.color, op.opacity);
  const radius = Math.max(0, op.radius);
  const span = op.endAngle - op.startAngle;
  const segments = Math.max(1, Math.ceil(Math.abs(span) * radius * 2));
  const step = span / segments;
  for (let i = 0; i <= segments; i += 1) {
    const angle = op.startAngle + step * i;
    const x = Math.round(op.cx + Math.cos(angle) * radius);
    const y = Math.round(op.cy + Math.sin(angle) * radius);
    drawPoint(bitmap, x, y, color);
  }
};

const drawGradient = (bitmap, op) => {
  const x0 = Math.floor(op.x);
  const y0 = Math.floor(op.y);
  const x1 = Math.floor(op.x + op.width);
  const y1 = Math.floor(op.y + op.height);
  const start = normalizeColor(op.startColor, op.opacity);
  const end = normalizeColor(op.endColor, op.opacity);
  const horizontal = op.direction === 'horizontal';
  const span = horizontal ? Math.max(1, x1 - x0 - 1) : Math.max(1, y1 - y0 - 1);
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const t = horizontal ? (x - x0) / span : (y - y0) / span;
      const color = {
        r: Math.round(start.r + (end.r - start.r) * t),
        g: Math.round(start.g + (end.g - start.g) * t),
        b: Math.round(start.b + (end.b - start.b) * t),
        a: Math.round(start.a + (end.a - start.a) * t)
      };
      drawPoint(bitmap, x, y, color);
    }
  }
};

const drawSprite = (bitmap, op) => {
  const sprite = op.sprite;
  const opacity = op.opacity ?? 1;
  for (let sy = 0; sy < sprite.height; sy += 1) {
    for (let sx = 0; sx < sprite.width; sx += 1) {
      const idx = (sy * sprite.width + sx) * 4;
      const color = {
        r: sprite.pixels[idx],
        g: sprite.pixels[idx + 1],
        b: sprite.pixels[idx + 2],
        a: sprite.pixels[idx + 3] * opacity
      };
      drawPoint(bitmap, Math.round(op.x + sx), Math.round(op.y + sy), color);
    }
  }
};

const applyTint = (bitmap, op) => {
  const tint = normalizeColor(op.color, op.opacity);
  const x0 = Math.floor(op.x);
  const y0 = Math.floor(op.y);
  const x1 = Math.floor(op.x + op.width);
  const y1 = Math.floor(op.y + op.height);
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      if (x < 0 || y < 0 || x >= bitmap.width || y >= bitmap.height) {
        continue;
      }
      const dst = readPixel(bitmap, x, y);
      const tinted = {
        r: Math.round((dst.r * tint.r) / 255),
        g: Math.round((dst.g * tint.g) / 255),
        b: Math.round((dst.b * tint.b) / 255),
        a: dst.a
      };
      const blended = blendPixel(dst, { ...tinted, a: tint.a });
      writePixel(bitmap, x, y, blended);
    }
  }
};

export const rasterize = ({ bitmap, ops }) => {
  if (!bitmap) {
    throw new Error('A bitmap is required for rasterization.');
  }
  if (!Array.isArray(ops)) {
    throw new Error('Draw ops must be provided as an array.');
  }
  for (const op of ops) {
    if (!isDrawOp(op)) {
      throw new Error(`Unsupported draw op: ${op?.type ?? 'unknown'}`);
    }
    switch (op.type) {
      case DrawOpType.DrawRect:
        drawRect(bitmap, op);
        break;
      case DrawOpType.DrawLine:
        drawLine(bitmap, op);
        break;
      case DrawOpType.DrawArc:
        drawArc(bitmap, op);
        break;
      case DrawOpType.DrawGradient:
        drawGradient(bitmap, op);
        break;
      case DrawOpType.DrawSprite:
        drawSprite(bitmap, op);
        break;
      case DrawOpType.ApplyTint:
        applyTint(bitmap, op);
        break;
    }
  }
  return bitmap;
};
