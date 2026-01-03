import {
  createCombatant,
  ACTIONS,
  DEFAULT_PLAYER,
  DEFAULT_ENEMY,
  performTurn
} from "./battle.js";

const logList = document.getElementById("log");
const playerHealth = document.getElementById("player-health");
const playerHealthValue = document.getElementById("player-health-value");
const playerMana = document.getElementById("player-mana");
const playerManaValue = document.getElementById("player-mana-value");
const enemyHealth = document.getElementById("enemy-health");
const enemyHealthValue = document.getElementById("enemy-health-value");
const enemyFocus = document.getElementById("enemy-focus");
const enemyFocusValue = document.getElementById("enemy-focus-value");

let state = {
  player: createCombatant(DEFAULT_PLAYER),
  enemy: createCombatant({ ...DEFAULT_ENEMY, isEnemy: true })
};

function pushLog(lines) {
  lines.forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    logList.prepend(li);
  });
}

function updateMeters() {
  playerHealth.style.width = `${(state.player.health / state.player.maxHealth) * 100}%`;
  playerHealthValue.textContent = `${state.player.health} / ${state.player.maxHealth}`;
  playerMana.style.width = `${(state.player.mana / state.player.maxMana) * 100}%`;
  playerManaValue.textContent = `${state.player.mana} / ${state.player.maxMana}`;
  enemyHealth.style.width = `${(state.enemy.health / state.enemy.maxHealth) * 100}%`;
  enemyHealthValue.textContent = `${state.enemy.health} / ${state.enemy.maxHealth}`;
  enemyFocus.style.width = `${(state.enemy.health / state.enemy.maxHealth) * 100}%`;
  enemyFocusValue.textContent = `${state.enemy.health} / ${state.enemy.maxHealth}`;
}

function resetBattle() {
  state = {
    player: createCombatant(DEFAULT_PLAYER),
    enemy: createCombatant({ ...DEFAULT_ENEMY, isEnemy: true })
  };
  logList.innerHTML = "";
  pushLog(["A new duel begins. Choose your opening move."]);
  updateMeters();
}

function handleAction(action) {
  const result = performTurn({
    player: state.player,
    enemy: state.enemy,
    action
  });
  state = { player: result.player, enemy: result.enemy };
  pushLog(result.log);
  updateMeters();
}

const actions = document.querySelectorAll("button.action");
actions.forEach((button) => {
  button.addEventListener("click", () => {
    handleAction(button.dataset.action);
  });
});

document.getElementById("reset").addEventListener("click", resetBattle);

resetBattle();
