export function renderCombatActionList({ container, entries, onAction }) {
  if (!container) {
    return [];
  }
  container.innerHTML = "";
  const actionButtons = [];

  (entries ?? []).forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "combat-action";

    const label = document.createElement("span");
    label.className = "combat-action__label";
    label.textContent = entry.label ?? "Unknown";
    button.appendChild(label);

    const meta = document.createElement("span");
    meta.className = "combat-action__meta";
    if (Number.isFinite(entry?.cooldown)) {
      meta.textContent = `${entry.cooldown}s cooldown`;
    } else if (entry?.detail) {
      meta.textContent = entry.detail;
    } else {
      meta.textContent = entry?.action ? "Ready" : "Unavailable";
    }
    button.appendChild(meta);

    if (entry.action) {
      button.dataset.action = entry.action;
      button.dataset.baseLabel = entry.label ?? "";
      if (onAction) {
        button.addEventListener("click", () => onAction(entry.action));
      }
      actionButtons.push(button);
    } else {
      button.disabled = true;
      button.classList.add("combat-action--placeholder");
    }

    container.appendChild(button);
  });

  return actionButtons;
}
