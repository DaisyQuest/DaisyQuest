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
  removeFromInventory,
  equipItem,
  unequipItem
} from "./items.js";
import { createProgressionSystem } from "./systems/progressionSystem.js";
import { createSpellRegistry } from "./systems/spellRegistry.js";
import { createSpellbookSystem } from "./systems/spellbookSystem.js";
import { createUnlockSystem } from "./systems/unlockSystem.js";
import { createPlayerSystem } from "./systems/playerSystem.js";
import { listSpells, SPELLBOOK_SLOTS } from "./spells.js";

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
const tabButtons = document.querySelectorAll("[data-tab-button]");
const tabPanels = document.querySelectorAll("[data-tab-panel]");
const statList = document.getElementById("stat-list");
const statPointsValue = document.getElementById("stat-points-value");
const levelValue = document.getElementById("level-value");
const experienceValue = document.getElementById("experience-value");
const nextLevelValue = document.getElementById("next-level-value");
const spellbookList = document.getElementById("spellbook-list");
const spellSlots = document.getElementById("spell-slots");
const spellbookMessage = document.getElementById("spellbook-message");

const progressionSystem = createProgressionSystem();
const spellRegistry = createSpellRegistry({ spells: listSpells() });
const spellbookSystem = createSpellbookSystem({ spellRegistry, slotCount: SPELLBOOK_SLOTS });
const unlockSystem = createUnlockSystem();
const playerSystem = createPlayerSystem({
  progressionSystem,
  inventoryManager: {
    addItem: addToInventory,
    removeItem: removeFromInventory,
    equipItem,
    unequipItem
  },
  spellRegistry,
  spellbookSystem,
  unlockSystem
});

let state = {
  player: createCombatant(DEFAULT_PLAYER),
  enemy: createCombatant({ ...getNpcById(), isEnemy: true }),
  playerData: playerSystem.createPlayerState({ knownSpells: ["fireball"] })
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

function renderProgression() {
  const nextLevelXp = progressionSystem.experienceForNextLevel(state.playerData.progression.level);
  levelValue.textContent = `${state.playerData.progression.level}`;
  experienceValue.textContent = `${state.playerData.progression.experience}`;
  nextLevelValue.textContent = `${nextLevelXp}`;
  statPointsValue.textContent = `${state.playerData.progression.statPoints}`;
  statList.innerHTML = "";
  Object.entries(state.playerData.progression.attributes).forEach(([key, value]) => {
    const row = document.createElement("div");
    row.className = "stat-row";
    row.innerHTML = `
      <span class="stat-name">${key}</span>
      <span class="stat-value">${value}</span>
      <button type="button" class="secondary" data-attribute="${key}">+</button>
    `;
    const button = row.querySelector("button");
    button.disabled = state.playerData.progression.statPoints <= 0;
    button.addEventListener("click", () => {
      const updated = playerSystem.allocateStatPoint(state.playerData, key, 1);
      if (updated.progression.error) {
        pushLog([updated.progression.error]);
        return;
      }
      state.playerData = updated;
      renderProgression();
    });
    statList.appendChild(row);
  });
}

function renderSpellbook() {
  spellbookList.innerHTML = "";
  spellSlots.innerHTML = "";
  spellbookMessage.textContent = "";
  const spells = listSpells();
  spells.forEach((spell) => {
    const item = document.createElement("div");
    item.className = "spell-entry";
    const known = state.playerData.knownSpells.includes(spell.id);
    const requirementResult = unlockSystem.evaluateRequirements(spell.unlockRequirements, {
      attributes: state.playerData.progression.attributes,
      inventory: state.playerData.inventory,
      consumedItems: state.playerData.consumedItems
    });
    item.innerHTML = `
      <div>
        <strong>${spell.name}</strong>
        <p>${spell.description}</p>
        <p>Mana: ${spell.manaCost} • Cooldown: ${spell.cooldown}</p>
        ${
          !known && spell.unlockRequirements.length > 0
            ? `<p class="spell-requirement">${requirementResult.ok ? "Requirements met." : requirementResult.reason}</p>`
            : ""
        }
      </div>
      <button type="button" class="secondary" data-spell-id="${spell.id}">
        ${known ? "Equip" : "Learn"}
      </button>
    `;
    const button = item.querySelector("button");
    if (!known && !requirementResult.ok) {
      button.disabled = true;
    }
    button.addEventListener("click", () => {
      if (!known) {
        const learned = playerSystem.learnSpell(state.playerData, spell.id);
        if (learned.error) {
          spellbookMessage.textContent = learned.error;
          return;
        }
        state.playerData = learned;
        renderInventory();
        renderProgression();
        renderSpellbook();
        return;
      }
      const slotIndex = state.playerData.spellbook.equippedSlots.findIndex((slot) => slot === null);
      const targetIndex = slotIndex === -1 ? 0 : slotIndex;
      const updated = playerSystem.equipSpell(state.playerData, spell.id, targetIndex);
      if (updated.error) {
        spellbookMessage.textContent = updated.error;
        return;
      }
      state.playerData = updated;
      renderSpellbook();
    });
    spellbookList.appendChild(item);
  });

  for (let i = 0; i < SPELLBOOK_SLOTS; i += 1) {
    const slot = document.createElement("div");
    slot.className = "spell-slot";
    const spellId = state.playerData.spellbook.equippedSlots[i];
    const spell = spellId ? spells.find((entry) => entry.id === spellId) : null;
    slot.innerHTML = `
      <div class="spell-slot-info">
        <span>Slot ${i + 1}</span>
        <span>${spell ? spell.name : "Empty"}</span>
      </div>
    `;
    if (spell) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "secondary";
      button.textContent = "Unequip";
      button.addEventListener("click", () => {
        const updated = playerSystem.unequipSpell(state.playerData, i);
        if (updated.error) {
          spellbookMessage.textContent = updated.error;
          return;
        }
        state.playerData = updated;
        renderSpellbook();
      });
      slot.appendChild(button);
    }
    spellSlots.appendChild(slot);
  }
}

function setActiveTab(tabId) {
  tabPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.tabPanel === tabId);
  });
  tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tabButton === tabId);
  });
}

function renderInventory() {
  inventoryList.innerHTML = "";
  const entries = Object.entries(state.playerData.inventory);
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
        const updated = playerSystem.equipItem(state.playerData, itemId);
        if (updated.error) {
          pushLog([updated.error]);
          return;
        }
        state.playerData = updated;
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
    const equippedId = state.playerData.equipment[slot];
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
        const updated = playerSystem.unequipItem(state.playerData, slot);
        if (updated.error) {
          pushLog([updated.error]);
          return;
        }
        state.playerData = updated;
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
  const result = craftItem(state.playerData.inventory, recipeId);
  if (result.error) {
    craftingResult.textContent = result.error;
    return;
  }
  const craftedItem = getItemById(result.crafted);
  state.playerData = {
    ...state.playerData,
    inventory: result.inventory
  };
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
    playerData: state.playerData
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
      state.playerData = playerSystem.addItem(state.playerData, drop.itemId, drop.quantity);
      return `Looted ${item ? item.name : drop.itemId} x${drop.quantity}.`;
    });
    pushLoot(lootLines);
    renderInventory();
  }
  if (result.experienceGained) {
    state.playerData = playerSystem.applyExperience(state.playerData, result.experienceGained);
    pushLog([`Gained ${result.experienceGained} experience.`]);
    renderProgression();
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
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.tabButton);
  });
});

populateNpcSelect();
populateRecipes();
renderRecipeDetails();
resetBattle();
renderInventory();
renderEquipment();
renderProgression();
renderSpellbook();
setActiveTab("battle");
