export const BLEND_MODES = Object.freeze({
  NORMAL: "normal",
  ADD: "add",
  MULTIPLY: "multiply",
  SCREEN: "screen"
});

export const LAYERS = Object.freeze({
  BACKGROUND: 0,
  MIDGROUND: 1,
  FX: 2,
  SCREEN: 3
});

export const COMPOSITION_RULES = Object.freeze({
  tint: Object.freeze({
    layer: LAYERS.BACKGROUND,
    blendMode: BLEND_MODES.MULTIPLY
  }),
  flash: Object.freeze({
    layer: LAYERS.SCREEN,
    blendMode: BLEND_MODES.SCREEN
  }),
  lineArc: Object.freeze({
    layer: LAYERS.FX,
    blendMode: BLEND_MODES.ADD
  }),
  radialBurst: Object.freeze({
    layer: LAYERS.FX,
    blendMode: BLEND_MODES.ADD
  }),
  screenShake: Object.freeze({
    layer: LAYERS.SCREEN,
    blendMode: BLEND_MODES.NORMAL
  })
});

export function applyComposition(effect, overrides = {}) {
  const rule = COMPOSITION_RULES[effect.type];
  const layer = overrides.layer ?? effect.layer ?? rule?.layer ?? LAYERS.MIDGROUND;
  const blendMode = overrides.blendMode ?? effect.blendMode ?? rule?.blendMode ?? BLEND_MODES.NORMAL;
  return {
    ...effect,
    layer,
    blendMode
  };
}

export function sortEffects(effects = []) {
  return [...effects].sort((left, right) => {
    const leftLayer = left.layer ?? LAYERS.MIDGROUND;
    const rightLayer = right.layer ?? LAYERS.MIDGROUND;
    if (leftLayer !== rightLayer) {
      return leftLayer - rightLayer;
    }
    return (left.type ?? "").localeCompare(right.type ?? "");
  });
}
