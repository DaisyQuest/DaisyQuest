const VALID_TARGET_TYPES = new Set(["player", "npc", "object", "terrain"]);
const VALID_CLICK_TYPES = new Set(["primary"]);
const VALID_MENU_OPTIONS = new Set(["inspect", "trade", "combat", "interact"]);

export function sanitizeCandidates(candidates = []) {
  return candidates
    .filter((candidate) => VALID_TARGET_TYPES.has(candidate?.type))
    .map((candidate) => ({
      id: typeof candidate.id === "string" ? candidate.id : null,
      type: candidate.type,
      layer: Number.isFinite(candidate.layer) ? candidate.layer : 0
    }));
}

export function resolveTopCandidate(candidates = []) {
  if (!candidates.length) {
    return null;
  }
  return candidates.reduce((top, candidate) => {
    if (!top || candidate.layer > top.layer) {
      return candidate;
    }
    return top;
  }, null);
}

export function buildContextMenuOptions(candidates = []) {
  const hasPlayer = candidates.some((candidate) => candidate.type === "player");
  const hasNpc = candidates.some((candidate) => candidate.type === "npc");
  const hasObject = candidates.some((candidate) => candidate.type === "object");

  const options = [];
  if (hasPlayer || hasNpc || hasObject) {
    options.push("inspect");
  }
  if (hasPlayer) {
    options.push("trade");
  }
  if (hasPlayer || hasNpc) {
    options.push("combat");
  }
  if (hasObject) {
    options.push("interact");
  }
  return options;
}

export function resolveInteractionAction({ clickType, candidates }) {
  if (!VALID_CLICK_TYPES.has(clickType)) {
    throw new Error("Unsupported click type.");
  }
  const sanitized = sanitizeCandidates(candidates);
  const resolvedTarget = resolveTopCandidate(sanitized);
  const action =
    !resolvedTarget || resolvedTarget.type === "terrain" ? "move" : "interact";
  return { action, resolvedTarget };
}

export function resolveContextMenu({ candidates }) {
  const sanitized = sanitizeCandidates(candidates);
  return {
    resolvedTarget: resolveTopCandidate(sanitized),
    options: buildContextMenuOptions(sanitized)
  };
}

export function resolveContextAction({ option, candidates }) {
  if (!VALID_MENU_OPTIONS.has(option)) {
    throw new Error("Unknown context menu option.");
  }
  const sanitized = sanitizeCandidates(candidates);
  const options = buildContextMenuOptions(sanitized);
  if (!options.includes(option)) {
    throw new Error("Invalid context menu option for current targets.");
  }
  return {
    selectedOption: option,
    resolvedTarget: resolveTopCandidate(sanitized)
  };
}
