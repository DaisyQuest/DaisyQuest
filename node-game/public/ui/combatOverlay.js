export function updateCombatOverlayState({
  mapPanel,
  tabController,
  activeState,
  flowStateToTab = {},
  combatState = "combat"
} = {}) {
  if (!mapPanel || !tabController) {
    return false;
  }
  const shouldPersistMap = activeState === combatState;
  if (shouldPersistMap) {
    mapPanel.dataset.tabPersistent = "true";
  } else {
    delete mapPanel.dataset.tabPersistent;
  }
  const targetTab = flowStateToTab[activeState] ?? tabController.getActiveValue?.();
  if (targetTab) {
    tabController.setActive(targetTab);
  }
  return shouldPersistMap;
}
