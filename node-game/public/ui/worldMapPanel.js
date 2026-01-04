export const WORLD_MAP_PANEL_HEIGHT = "min(75vh, 760px)";

export function applyWorldMapPanelLayout({
  layout,
  panel,
  surface,
  height = WORLD_MAP_PANEL_HEIGHT
} = {}) {
  if (!panel) {
    throw new Error("World map panel element is required.");
  }

  panel.style.height = height;
  panel.style.minHeight = height;
  panel.dataset.layoutHeight = height;

  if (layout) {
    layout.style.height = height;
    layout.style.minHeight = height;
    layout.dataset.layoutHeight = height;
  }

  if (surface) {
    surface.style.height = "100%";
    surface.style.flex = "1";
  }

  return { layout, panel, surface };
}
