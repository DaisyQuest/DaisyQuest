import {
  createCombatant,
  ACTIONS,
  DEFAULT_PLAYER,
  getNpcById,
  NPCS,
  performTurn
} from "./battle.js";
import {
  addToInventory,
  craftItem,
  EQUIPMENT_SLOTS,
  getItemById,
  getRarityColor,
  RECIPES,
  equipItem,
  unequipItem
} from "./items.js";

const logList = document.getElementById("log");
const playerHealth = document.getElementById("player-health");
const playerHealthValue = document.getElementById("player-health-value");
const playerMana = document.getElementById("player-mana");
const playerManaValue = document.getElementById("player-mana-value");
const enemyHealth = document.getElementById("enemy-health");
const enemyHealthValue = document.getElementById("enemy-health-value");
const enemyFocus = document.getElementById("enemy-focus");
const enemyFocusValue = document.getElementById("enemy-focus-value");
const enemyFocusRow = document.getElementById("enemy-focus-row");
const npcSelect = document.getElementById("npc-select");
const npcDescription = document.getElementById("npc-description");
const enemyName = document.getElementById("enemy-name");
const inventoryList = document.getElementById("inventory-list");
const equipmentList = document.getElementById("equipment-list");
const lootList = document.getElementById("loot-list");
const recipeSelect = document.getElementById("recipe-select");
const recipeDetails = document.getElementById("recipe-details");
const craftButton = document.getElementById("craft-button");
const craftingResult = document.getElementById("crafting-result");

let state = {
  player: createCombatant(DEFAULT_PLAYER),
  enemy: createCombatant({ ...getNpcById(), isEnemy: true }),
  inventory: {},
  equipment: {}
};

function populateNpcSelect() {
  npcSelect.innerHTML = "";
  NPCS.forEach((npc, index) => {
    const option = document.createElement("option");
    option.value = npc.id;
    option.textContent = npc.name;
    if (index === 0) {
      option.selected = true;
    }
    npcSelect.appendChild(option);
  });
}

function getSelectedNpc() {
  return getNpcById(npcSelect.value);
}

function pushLog(lines) {
  lines.forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    logList.prepend(li);
  });
}

function pushLoot(lines) {
  lines.forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    lootList.prepend(li);
  });
}

function updateMeters() {
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
    enemyFocus.style.width = "0%";
    enemyFocusValue.textContent = "0 / 0";
  }
}

function renderInventory() {
  inventoryList.innerHTML = "";
  const entries = Object.entries(state.inventory);
  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Your satchel is empty.";
    inventoryList.appendChild(empty);
    return;
  }
  entries.forEach(([itemId, quantity]) => {
    const item = getItemById(itemId);
    if (!item) {
      return;
    }
    const row = document.createElement("div");
    row.className = "inventory-item";
    const rarityColor = getRarityColor(item.rarity);
    row.innerHTML = `
      <div class="inventory-item-main">
        <span class="inventory-item-name" style="color: ${rarityColor};">${item.name}</span>
        <span class="inventory-item-quantity">x${quantity}</span>
      </div>
      <p class="inventory-item-description">${item.description}</p>
      <div class="inventory-item-actions"></div>
    `;
    const actions = row.querySelector(".inventory-item-actions");
    if (item.equippable) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "secondary";
      button.textContent = "Equip";
      button.addEventListener("click", () => {
        const result = equipItem(state.inventory, state.equipment, itemId);
        if (result.error) {
          pushLog([result.error]);
          return;
        }
        state.inventory = result.inventory;
        state.equipment = result.equipment;
        pushLog([`Equipped ${item.name}.`]);
        renderInventory();
        renderEquipment();
      });
      actions.appendChild(button);
    }
    inventoryList.appendChild(row);
  });
}

function renderEquipment() {
  equipmentList.innerHTML = "";
  EQUIPMENT_SLOTS.forEach((slot) => {
    const wrapper = document.createElement("div");
    wrapper.className = "equipment-slot";
    const equippedId = state.equipment[slot];
    const item = equippedId ? getItemById(equippedId) : null;
    wrapper.innerHTML = `
      <div class="equipment-slot-header">
        <span class="equipment-slot-name">${slot.replace("_", " ")}</span>
        <span class="equipment-slot-item">${item ? item.name : "Empty"}</span>
      </div>
    `;
    if (item) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "secondary";
      button.textContent = "Unequip";
      button.addEventListener("click", () => {
        const result = unequipItem(state.inventory, state.equipment, slot);
        if (result.error) {
          pushLog([result.error]);
          return;
        }
        state.inventory = result.inventory;
        state.equipment = result.equipment;
        pushLog([`Unequipped ${item.name}.`]);
        renderInventory();
        renderEquipment();
      });
      wrapper.appendChild(button);
    }
    equipmentList.appendChild(wrapper);
  });
}

function populateRecipes() {
  recipeSelect.innerHTML = "";
  RECIPES.forEach((recipe, index) => {
    const option = document.createElement("option");
    option.value = recipe.id;
    option.textContent = recipe.name;
    if (index === 0) {
      option.selected = true;
    }
    recipeSelect.appendChild(option);
  });
}

function renderRecipeDetails() {
  const recipe = RECIPES.find((entry) => entry.id === recipeSelect.value);
  if (!recipe) {
    recipeDetails.textContent = "Select a recipe to see ingredients.";
    return;
  }
  const ingredients = Object.entries(recipe.ingredients)
    .map(([itemId, amount]) => {
      const item = getItemById(itemId);
      return `${item ? item.name : itemId} x${amount}`;
    })
    .join(", ");
  const result = getItemById(recipe.resultItemId);
  recipeDetails.textContent = `${result ? result.name : "Unknown"} requires ${ingredients}.`;
}

function attemptCraft() {
  const recipeId = recipeSelect.value;
  const result = craftItem(state.inventory, recipeId);
  if (result.error) {
    craftingResult.textContent = result.error;
    return;
  }
  const craftedItem = getItemById(result.crafted);
  state.inventory = result.inventory;
  craftingResult.textContent = craftedItem
    ? `Crafted ${craftedItem.name}.`
    : "Crafting complete.";
  renderInventory();
}

function resetBattle() {
  const npc = getSelectedNpc();
  state = {
    player: createCombatant(DEFAULT_PLAYER),
    enemy: createCombatant({ ...npc, isEnemy: true }),
    inventory: state.inventory,
    equipment: state.equipment
  };
  logList.innerHTML = "";
  lootList.innerHTML = "";
  enemyName.textContent = npc.name;
  npcDescription.textContent = npc.description;
  pushLog([`A new duel begins against ${npc.name}. Choose your opening move.`]);
  updateMeters();
}

function handleAction(action) {
  const result = performTurn({
    player: state.player,
    enemy: state.enemy,
    action
  });
  state = { ...state, player: result.player, enemy: result.enemy };
  pushLog(result.log);
  if (result.loot && result.loot.length > 0) {
    const lootLines = result.loot.map((drop) => {
      const item = getItemById(drop.itemId);
      state.inventory = addToInventory(state.inventory, drop.itemId, drop.quantity);
      return `Looted ${item ? item.name : drop.itemId} x${drop.quantity}.`;
    });
    pushLoot(lootLines);
    renderInventory();
  }
  updateMeters();
}

const actions = document.querySelectorAll("button.action");
actions.forEach((button) => {
  button.addEventListener("click", () => {
    handleAction(button.dataset.action);
  });
});

document.getElementById("reset").addEventListener("click", resetBattle);
npcSelect.addEventListener("change", resetBattle);
recipeSelect.addEventListener("change", renderRecipeDetails);
craftButton.addEventListener("click", attemptCraft);

populateNpcSelect();
populateRecipes();
renderRecipeDetails();
resetBattle();
renderInventory();
renderEquipment();
