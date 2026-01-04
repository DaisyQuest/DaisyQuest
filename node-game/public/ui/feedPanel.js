export function createFeedPanel({ listElement }) {
  function pushLines(lines) {
    if (!lines || lines.length === 0) {
      return;
    }
    lines.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      listElement.prepend(li);
    });
  }

  return Object.freeze({ pushLines });
}
