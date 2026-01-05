export function updateCombatOverlayState({
  mapPanel,
  tabController,
  activeState,
  flowStateToTab = {},
  combatState = "combat",
  overlayRoot = null
} = {}) {
  if (!mapPanel || !tabController) {
    return false;
  }
  const isCombat = activeState === combatState;
  if (isCombat) {
    mapPanel.dataset.tabPersistent = "true";
  } else {
    delete mapPanel.dataset.tabPersistent;
  }
  if (overlayRoot) {
    overlayRoot.dataset.combatOverlay = isCombat ? "active" : "inactive";
  }
  const targetTab = flowStateToTab[activeState] ?? tabController.getActiveValue?.();
  if (targetTab) {
    tabController.setActive(targetTab);
  }
  return isCombat;
}
