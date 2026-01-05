const DEFAULTS = Object.freeze({
  minDockHeight: 560,
  minViewportHeight: 720
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
  minViewportHeight = DEFAULTS.minViewportHeight
} = {}) {
  if (!dock || !panel || !viewport) {
    return createNoopLayout();
  }

  const updateLayout = () => {
    const dockHeight = dock.getBoundingClientRect().height;
    const viewportHeight = viewport.innerHeight ?? 0;
    const isExpanded = dockHeight >= minDockHeight && viewportHeight >= minViewportHeight;

    dock.classList.toggle("combat-dock--expanded", isExpanded);
    dock.classList.toggle("combat-dock--compact", !isExpanded);
    panel.classList.toggle("combat-panel--expanded", isExpanded);
    panel.classList.toggle("combat-panel--compact", !isExpanded);

    if (stage) {
      stage.classList.toggle("battle-stage--expanded", isExpanded);
      stage.classList.toggle("battle-stage--compact", !isExpanded);
    }
  };

  const handleResize = () => updateLayout();

  if (viewport.addEventListener) {
    viewport.addEventListener("resize", handleResize);
  }

  updateLayout();

  return Object.freeze({
    destroy() {
      if (viewport.removeEventListener) {
        viewport.removeEventListener("resize", handleResize);
      }
    },
    sync() {
      updateLayout();
    }
  });
}
