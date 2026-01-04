export function createTabNavigationAdapter({ buttons, buttonKey, onSelect } = {}) {
  const buttonList = Array.from(buttons ?? []);
  if (!buttonList.length || typeof onSelect !== "function") {
    return Object.freeze({
      destroy() {}
    });
  }

  function handleClick(event) {
    const value = event.currentTarget?.dataset?.[buttonKey];
    if (!value) {
      return;
    }
    onSelect(value);
  }

  buttonList.forEach((button) => {
    button.addEventListener("click", handleClick);
  });

  return Object.freeze({
    destroy() {
      buttonList.forEach((button) => {
        button.removeEventListener("click", handleClick);
      });
    }
  });
}
