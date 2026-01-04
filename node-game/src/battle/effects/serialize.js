const SERIALIZED_KEYS = [
  "type",
  "durationMs",
  "amplitude",
  "color",
  "frequency",
  "layer",
  "blendMode"
];

export function serializeEffect(effect) {
  if (!effect) {
    return null;
  }
  const serialized = {};
  SERIALIZED_KEYS.forEach((key) => {
    if (effect[key] !== undefined) {
      serialized[key] = effect[key];
    }
  });
  const extras = Object.keys(effect).filter((key) => !SERIALIZED_KEYS.includes(key)).sort();
  extras.forEach((key) => {
    serialized[key] = effect[key];
  });
  return serialized;
}

export function serializeEffects(effects = []) {
  return effects.map((effect) => serializeEffect(effect));
}
