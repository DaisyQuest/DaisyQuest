export function createTabController({
  buttons,
  panels,
  buttonKey,
  panelKey,
  activeClass = "is-active",
  onSelect
}) {
  const buttonList = Array.from(buttons ?? []);
  const panelList = Array.from(panels ?? []);

  function getActiveValue() {
    const activeButton = buttonList.find((button) => button.classList.contains(activeClass));
    if (activeButton) {
      return activeButton.dataset[buttonKey];
    }
    return buttonList[0]?.dataset?.[buttonKey] ?? null;
  }

  function setButtonState(button, value) {
    const isActive = button.dataset[buttonKey] === value;
    button.classList.toggle(activeClass, isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    return isActive;
  }

  function setPanelState(panel, value) {
    const isActive = panel.dataset[panelKey] === value;
    panel.classList.toggle(activeClass, isActive);
    panel.hidden = !isActive;
    panel.setAttribute("aria-hidden", isActive ? "false" : "true");
    return isActive;
  }

  function setActive(value) {
    const hasMatch = buttonList.some((button) => button.dataset[buttonKey] === value);
    if (!hasMatch) {
      return;
    }
    buttonList.forEach((button) => setButtonState(button, value));
    panelList.forEach((panel) => setPanelState(panel, value));
  }

  function wire() {
    const initialValue = getActiveValue();
    if (initialValue) {
      if (typeof onSelect === "function") {
        onSelect(initialValue, { source: "init" });
      } else {
        setActive(initialValue);
      }
    }

    buttonList.forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.dataset[buttonKey];
        if (typeof onSelect === "function") {
          onSelect(value, { source: "click" });
        } else {
          setActive(value);
        }
      });
    });
  }

  return Object.freeze({
    setActive,
    getActiveValue,
    wire
  });
}
