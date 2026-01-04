const MINIMAP_STYLES = Object.freeze({
  SELF: Object.freeze({ symbol: "◆", color: "#facc15", label: "You" }),
  PLAYER: Object.freeze({ symbol: "●", color: "#60a5fa", label: "Player" }),
  NPC: Object.freeze({ symbol: "▲", color: "#fb923c", label: "NPC" }),
  WORLD_OBJECT: Object.freeze({ symbol: "■", color: "#a78bfa", label: "Object" })
});

const DEFAULT_STYLE = Object.freeze({ symbol: "?", color: "#e2e8f0", label: "Unknown" });

export function getMinimapStyle(type) {
  return MINIMAP_STYLES[type] ?? DEFAULT_STYLE;
}

export function buildLegendItems() {
  return Object.entries(MINIMAP_STYLES).map(([type, style]) => ({
    type,
    ...style
  }));
}

export function projectPoint({ centerX, centerY, radius, entry, canvasWidth, canvasHeight }) {
  if (radius <= 0) {
    return { x: canvasWidth / 2, y: canvasHeight / 2 };
  }
  const halfWidth = canvasWidth / 2;
  const halfHeight = canvasHeight / 2;
  return {
    x: halfWidth + ((entry.x - centerX) / radius) * halfWidth,
    y: halfHeight + ((entry.y - centerY) / radius) * halfHeight
  };
}

export function mapEntriesForRender({ data, canvasWidth, canvasHeight }) {
  if (!data) {
    return [];
  }
  return data.entries.map((entry) => {
    const style = getMinimapStyle(entry.type);
    const point = projectPoint({
      centerX: data.center.x,
      centerY: data.center.y,
      radius: data.radius,
      entry,
      canvasWidth,
      canvasHeight
    });
    return {
      ...point,
      symbol: style.symbol,
      color: style.color,
      label: entry.label
    };
  });
}

export function renderMinimap({ canvas, data }) {
  if (!canvas || !data) {
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  const renderEntries = mapEntriesForRender({
    data,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height
  });
  renderEntries.forEach((entry) => {
    ctx.fillStyle = entry.color;
    ctx.font = "14px Josefin Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(entry.symbol, entry.x, entry.y);
  });
}

export function toggleMinimapVisibility(state, { container, toggleButton }) {
  const nextVisible = !state.isVisible;
  state.isVisible = nextVisible;
  container.classList.toggle("minimap-panel--hidden", !nextVisible);
  toggleButton.setAttribute("aria-pressed", String(nextVisible));
  toggleButton.textContent = nextVisible ? "Hide" : "Show";
}

export function createMinimapPanel({
  container,
  canvas,
  toggleButton,
  legendContainer,
  fetchMinimap,
  intervalMs = 2000,
  setIntervalFn = setInterval,
  clearIntervalFn = clearInterval
}) {
  const state = { isVisible: true, intervalId: null };
  if (!container || !canvas || !toggleButton || !legendContainer) {
    return {
      start() {},
      stop() {},
      refresh() {},
      state
    };
  }

  function renderLegend() {
    legendContainer.innerHTML = "";
    buildLegendItems().forEach((item) => {
      const row = document.createElement("div");
      row.className = "minimap-legend-row";
      const symbol = document.createElement("span");
      symbol.className = "minimap-legend-symbol";
      symbol.textContent = item.symbol;
      symbol.style.color = item.color;
      const label = document.createElement("span");
      label.className = "minimap-legend-label";
      label.textContent = item.label;
      row.append(symbol, label);
      legendContainer.appendChild(row);
    });
  }

  async function refresh() {
    if (!state.isVisible || !fetchMinimap) {
      return;
    }
    const data = await fetchMinimap();
    renderMinimap({ canvas, data });
  }

  function start() {
    renderLegend();
    toggleButton.setAttribute("aria-pressed", "true");
    toggleButton.textContent = "Hide";
    toggleButton.addEventListener("click", () =>
      toggleMinimapVisibility(state, { container, toggleButton })
    );
    if (state.intervalId) {
      return;
    }
    refresh();
    state.intervalId = setIntervalFn(refresh, intervalMs);
  }

  function stop() {
    if (!state.intervalId) {
      return;
    }
    clearIntervalFn(state.intervalId);
    state.intervalId = null;
  }

  return {
    start,
    stop,
    refresh,
    state
  };
}
