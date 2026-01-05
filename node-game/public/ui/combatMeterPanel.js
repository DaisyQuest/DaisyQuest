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
    updateMeter({
      bar: playerHealth,
      value: playerHealthValue,
      current: state.player.health,
      max: state.player.maxHealth
    });
    updateMeter({
      bar: playerMana,
      value: playerManaValue,
      current: state.player.mana,
      max: state.player.maxMana
    });
    updateMeter({
      bar: enemyHealth,
      value: enemyHealthValue,
      current: state.enemy.health,
      max: state.enemy.maxHealth
    });
    if (enemyFocusMax > 0) {
      enemyFocusRow?.classList.remove("is-hidden");
      updateMeter({
        bar: enemyFocus,
        value: enemyFocusValue,
        current: enemyFocusCurrent,
        max: enemyFocusMax
      });
    } else {
      enemyFocusRow?.classList.add("is-hidden");
    }
  }

  return Object.freeze({ render });
}

function updateMeter({ bar, value, current, max }) {
  if (!bar || !value) {
    return;
  }
  const safeMax = Number.isFinite(max) && max > 0 ? max : 1;
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const percent = Math.max(0, Math.min(100, (safeCurrent / safeMax) * 100));
  bar.style.width = `${percent}%`;
  value.textContent = `${safeCurrent} / ${safeMax}`;
}
