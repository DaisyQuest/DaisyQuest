export function createCombatMeterPanel({
  playerHealth,
  playerHealthValue,
  playerMana,
  playerManaValue,
  enemyHealth,
  enemyHealthValue,
  enemyFocus,
  enemyFocusValue,
  enemyFocusRow
}) {
  function render(state) {
    if (!state) {
      return;
    }
    const enemyFocusCurrent = state.enemy.focus ?? 0;
    const enemyFocusMax = state.enemy.maxFocus ?? 0;
    playerHealth.style.width = `${(state.player.health / state.player.maxHealth) * 100}%`;
    playerHealthValue.textContent = `${state.player.health} / ${state.player.maxHealth}`;
    playerMana.style.width = `${(state.player.mana / state.player.maxMana) * 100}%`;
    playerManaValue.textContent = `${state.player.mana} / ${state.player.maxMana}`;
    enemyHealth.style.width = `${(state.enemy.health / state.enemy.maxHealth) * 100}%`;
    enemyHealthValue.textContent = `${state.enemy.health} / ${state.enemy.maxHealth}`;
    if (enemyFocusMax > 0) {
      enemyFocusRow.classList.remove("is-hidden");
      enemyFocus.style.width = `${(enemyFocusCurrent / enemyFocusMax) * 100}%`;
      enemyFocusValue.textContent = `${enemyFocusCurrent} / ${enemyFocusMax}`;
    } else {
      enemyFocusRow.classList.add("is-hidden");
    }
  }

  return Object.freeze({ render });
}
