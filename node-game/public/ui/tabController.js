export function createTabController({
  buttons,
  panels,
  buttonKey,
  panelKey,
  activeClass = "is-active"
}) {
  function setActive(value) {
    buttons.forEach((button) => {
      button.classList.toggle(activeClass, button.dataset[buttonKey] === value);
    });
    panels.forEach((panel) => {
      panel.classList.toggle(activeClass, panel.dataset[panelKey] === value);
    });
  }

  function wire() {
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        setActive(button.dataset[buttonKey]);
      });
    });
  }

  return Object.freeze({
    setActive,
    wire
  });
}
