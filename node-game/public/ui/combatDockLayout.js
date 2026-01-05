const DEFAULTS = Object.freeze({
  minDockHeight: 420,
  minDockWidth: 820,
  minViewportHeight: 640
});

const FALLBACK_VIEWPORT = globalThis?.window;

function createNoopLayout() {
  return Object.freeze({
    destroy() {},
    sync() {}
  });
}

export function createCombatDockLayout({
  dock,
  panel,
  stage,
  viewport = FALLBACK_VIEWPORT,
  minDockHeight = DEFAULTS.minDockHeight,
  minDockWidth = DEFAULTS.minDockWidth,
  minViewportHeight = DEFAULTS.minViewportHeight,
  createObserver
} = {}) {
  if (!dock || !panel || !viewport) {
    return createNoopLayout();
  }

  const updateLayout = () => {
    const rect = dock.getBoundingClientRect();
    const dockHeight = rect.height;
    const dockWidth = rect.width;
    const viewportHeight = viewport.innerHeight ?? 0;
    const isExpanded =
      dockHeight >= minDockHeight &&
      dockWidth >= minDockWidth &&
      viewportHeight >= minViewportHeight;

    dock.classList.toggle("combat-dock--expanded", isExpanded);
    dock.classList.toggle("combat-dock--compact", !isExpanded);
    panel.classList.toggle("combat-panel--expanded", isExpanded);
    panel.classList.toggle("combat-panel--compact", !isExpanded);
    panel.dataset.combatMode = isExpanded ? "expanded" : "compact";

    if (stage) {
      stage.classList.toggle("battle-stage--expanded", isExpanded);
      stage.classList.toggle("battle-stage--compact", !isExpanded);
    }
  };

  const handleResize = () => updateLayout();

  let observer = null;
  if (typeof createObserver === "function") {
    observer = createObserver(handleResize);
  } else if (viewport.ResizeObserver) {
    observer = new viewport.ResizeObserver(handleResize);
  } else if (globalThis?.ResizeObserver) {
    observer = new ResizeObserver(handleResize);
  }

  observer?.observe?.(dock);

  if (viewport.addEventListener) {
    viewport.addEventListener("resize", handleResize);
  }

  updateLayout();

  return Object.freeze({
    destroy() {
      if (viewport.removeEventListener) {
        viewport.removeEventListener("resize", handleResize);
      }
      observer?.disconnect?.();
    },
    sync() {
      updateLayout();
    }
  });
}
