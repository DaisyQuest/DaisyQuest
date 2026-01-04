const DEFAULT_DETAILS = Object.freeze([
  Object.freeze({ label: "Mode", value: "Travel" }),
  Object.freeze({ label: "Engage", value: "Select a hostile target, then choose Engage." }),
  Object.freeze({ label: "Interact", value: "Gather, trade, or speak when in range." })
]);

const DEFAULT_ACTIONS = Object.freeze({
  engage: Object.freeze({ enabled: false, label: "Engage" }),
  interact: Object.freeze({ enabled: false, label: "Interact" })
});

export function resolveInteractionPanelState({ target, candidates = [] } = {}) {
  if (!target) {
    return {
      summary: "No target selected. Highlight a player, NPC, or object.",
      details: DEFAULT_DETAILS,
      actions: DEFAULT_ACTIONS
    };
  }

  const match = candidates.find(
    (candidate) => candidate.id === target.id && candidate.type === target.type
  );
  const label = match?.label || target.id || target.type || "Unknown target";
  const isHostile = Boolean(match?.isHostile ?? target.isHostile);

  switch (target.type) {
    case "npc":
      if (isHostile) {
        return {
          summary: `${label} is looking for a fight.`,
          details: [
            { label: "Target", value: label },
            { label: "Threat", value: "Hostile" },
            { label: "Action", value: "Engage to start combat." }
          ],
          actions: {
            engage: { enabled: true, label: "Engage" },
            interact: { enabled: false, label: "Interact" }
          }
        };
      }
      return {
        summary: `${label} awaits your approach.`,
        details: [
          { label: "Target", value: label },
          { label: "Disposition", value: "Friendly" },
          { label: "Action", value: "Talk or trade when ready." }
        ],
        actions: {
          engage: { enabled: false, label: "Engage" },
          interact: { enabled: true, label: "Talk" }
        }
      };
    case "player":
      return {
        summary: `${label} is traveling nearby.`,
        details: [
          { label: "Player", value: label },
          { label: "Action", value: "Inspect or trade." }
        ],
        actions: {
          engage: { enabled: false, label: "Engage" },
          interact: { enabled: true, label: "Trade" }
        }
      };
    case "object":
      return {
        summary: `${label} is within reach.`,
        details: [
          { label: "Object", value: label },
          { label: "Action", value: "Interact with the object." }
        ],
        actions: {
          engage: { enabled: false, label: "Engage" },
          interact: { enabled: true, label: "Interact" }
        }
      };
    case "terrain":
      return {
        summary: `The terrain ahead is open.`,
        details: [
          { label: "Travel", value: "Click a tile to move." },
          { label: "Map", value: "Right-click for actions." }
        ],
        actions: DEFAULT_ACTIONS
      };
    default:
      return {
        summary: `${label} is selected.`,
        details: [{ label: "Target", value: label }],
        actions: DEFAULT_ACTIONS
      };
  }
}

export function renderInteractionPanel({
  detailsElement,
  engageButton,
  interactButton,
  state
} = {}) {
  if (!detailsElement || !state) {
    return;
  }
  const doc = detailsElement.ownerDocument;
  detailsElement.innerHTML = "";

  const summary = doc.createElement("p");
  summary.className = "caption";
  summary.textContent = state.summary;
  detailsElement.appendChild(summary);

  if (Array.isArray(state.details) && state.details.length) {
    const list = doc.createElement("ul");
    list.className = "interaction-list";
    state.details.forEach((detail) => {
      const item = doc.createElement("li");
      const label = doc.createElement("strong");
      label.textContent = `${detail.label}: `;
      item.appendChild(label);
      item.append(detail.value);
      list.appendChild(item);
    });
    detailsElement.appendChild(list);
  }

  if (engageButton) {
    engageButton.textContent = state.actions.engage.label;
    engageButton.disabled = !state.actions.engage.enabled;
  }

  if (interactButton) {
    interactButton.textContent = state.actions.interact.label;
    interactButton.disabled = !state.actions.interact.enabled;
  }
}
