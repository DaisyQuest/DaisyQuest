export function renderCombatActionList({ container, entries, onAction }) {
  if (!container) {
    return [];
  }
  container.innerHTML = "";
  const actionButtons = [];

  (entries ?? []).forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "action";
    button.textContent = entry.label ?? "Unknown";

    if (entry.action) {
      button.dataset.action = entry.action;
      button.dataset.baseLabel = entry.label ?? "";
      if (onAction) {
        button.addEventListener("click", () => onAction(entry.action));
      }
      actionButtons.push(button);
    } else {
      button.disabled = true;
      button.classList.add("action--placeholder");
    }

    container.appendChild(button);
  });

  return actionButtons;
}
