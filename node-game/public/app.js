import {
  createCombatant,
  ACTIONS,
  DEFAULT_PLAYER,
  getNpcById,
  NPCS,
  performTurn,
  isDefeated
} from "./battle.js";
import {
  ITEMS,
  RECIPES,
  NPC_LOOT_TABLES,
  RARITY_COLORS,
  EQUIPMENT_SLOTS
} from "./items.js";
import { createCraftingSystem } from "./systems/craftingSystem.js";
import { createInventoryManager } from "./systems/inventorySystem.js";
import { createItemRegistry } from "./systems/itemRegistry.js";
import { createLootSystem } from "./systems/lootSystem.js";
import { createProgressionSystem } from "./systems/progressionSystem.js";
import { createRegistryEditor } from "./systems/registryEditor.js";
import { initializeThemeEngine } from "./themeEngine.js";

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
const progressLevelBadge = document.getElementById("progress-level-badge");
const progressXpLabel = document.getElementById("progress-xp-label");
const progressFill = document.getElementById("progress-fill");
const progressCurrent = document.getElementById("progress-current");
const progressNext = document.getElementById("progress-next");
const milestoneList = document.getElementById("milestone-list");
const rewardDescription = document.getElementById("reward-description");
const claimRewardButton = document.getElementById("claim-reward");
const itemRegistryList = document.getElementById("item-registry-list");
const recipeRegistryList = document.getElementById("recipe-registry-list");
const itemEditor = document.getElementById("item-editor");
const recipeEditor = document.getElementById("recipe-editor");
const itemFormTitle = document.getElementById("item-form-title");
const itemFormMessage = document.getElementById("item-form-message");
const recipeFormTitle = document.getElementById("recipe-form-title");
const recipeFormMessage = document.getElementById("recipe-form-message");
const itemIdField = document.getElementById("item-id");
const itemNameField = document.getElementById("item-name");
const itemDescriptionField = document.getElementById("item-description");
const itemRarityField = document.getElementById("item-rarity");
const itemEquippableField = document.getElementById("item-equippable");
const itemSlotField = document.getElementById("item-slot");
const recipeIdField = document.getElementById("recipe-id");
const recipeNameField = document.getElementById("recipe-name");
const recipeResultField = document.getElementById("recipe-result");
const ingredientsList = document.getElementById("ingredients-list");
const newItemButton = document.getElementById("new-item");
const newRecipeButton = document.getElementById("new-recipe");
const addIngredientButton = document.getElementById("add-ingredient");
const tabButtons = document.querySelectorAll(".tab-button");
const registryPanes = document.querySelectorAll(".registry-pane");

const progressionSystem = createProgressionSystem({
  thresholds: [0, 120, 280, 480, 720, 1000, 1400, 1900]
});

const registryEditor = createRegistryEditor({
  items: ITEMS,
  recipes: RECIPES
});

const rewardMilestones = [
  { level: 2, reward: { itemId: "ember_scale", quantity: 2 }, label: "Ember Cache" },
  { level: 3, reward: { itemId: "moonsteel_ingot", quantity: 1 }, label: "Moonsteel Shard" },
  { level: 4, reward: { itemId: "crystal_shard", quantity: 2 }, label: "Guardian Crystal" },
  { level: 5, reward: { itemId: "wyrmling_helm", quantity: 1 }, label: "Wyrmling Relic" }
];

function buildRuntimeSystems(snapshot) {
  const itemRegistry = createItemRegistry({
    items: snapshot.items,
    recipes: snapshot.recipes,
    lootTables: NPC_LOOT_TABLES,
    rarityColors: RARITY_COLORS,
    equipmentSlots: EQUIPMENT_SLOTS
  });
  const inventoryManager = createInventoryManager({ itemRegistry });
  const craftingSystem = createCraftingSystem({ itemRegistry, inventoryManager });
  const lootSystem = createLootSystem({ itemRegistry });
  return {
    itemRegistry,
    inventoryManager,
    craftingSystem,
    lootSystem
  };
}

let runtime = buildRuntimeSystems(registryEditor.getSnapshot());

let state = {
  player: createCombatant(DEFAULT_PLAYER),
  enemy: createCombatant({ ...getNpcById(), isEnemy: true }),
  inventory: {},
  equipment: {},
  progression: progressionSystem.getProgressSnapshot(0),
  pendingReward: null,
  claimedRewards: new Set()
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
    const item = runtime.itemRegistry.getItem(itemId);
    const row = document.createElement("div");
    row.className = "inventory-item";
    const rarityColor = item ? runtime.itemRegistry.getRarityColor(item.rarity) : "#fff";
    row.innerHTML = `
      <div class="inventory-item-main">
        <span class="inventory-item-name" style="color: ${rarityColor};">${
          item ? item.name : "Unknown Item"
        }</span>
        <span class="inventory-item-quantity">x${quantity}</span>
      </div>
      <p class="inventory-item-description">${item ? item.description : "No description"}</p>
      <div class="inventory-item-actions"></div>
    `;
    const actions = row.querySelector(".inventory-item-actions");
    if (item?.equippable) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "secondary";
      button.textContent = "Equip";
      button.addEventListener("click", () => {
        const result = runtime.inventoryManager.equipItem(state.inventory, state.equipment, itemId);
        if (result.error) {
          pushLog([result.error]);
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
    const equippedId = state.equipment[slot];
    const item = equippedId ? runtime.itemRegistry.getItem(equippedId) : null;
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
        const result = runtime.inventoryManager.unequipItem(state.inventory, state.equipment, slot);
        if (result.error) {
          pushLog([result.error]);
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
  registryEditor.listRecipes().forEach((recipe, index) => {
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
  const recipe = runtime.itemRegistry.getRecipe(recipeSelect.value);
  if (!recipe) {
    recipeDetails.textContent = "Select a recipe to see ingredients.";
    return;
  }
  const ingredients = Object.entries(recipe.ingredients)
    .map(([itemId, amount]) => {
      const item = runtime.itemRegistry.getItem(itemId);
      return `${item ? item.name : itemId} x${amount}`;
    })
    .join(", ");
  const result = runtime.itemRegistry.getItem(recipe.resultItemId);
  recipeDetails.textContent = `${result ? result.name : "Unknown"} requires ${ingredients}.`;
}

function attemptCraft() {
  const recipeId = recipeSelect.value;
  const result = runtime.craftingSystem.craftItem(state.inventory, recipeId);
  if (result.error) {
    craftingResult.textContent = result.error;
    return;
  }
  const craftedItem = runtime.itemRegistry.getItem(result.crafted);
  state.inventory = result.inventory;
  craftingResult.textContent = craftedItem
    ? `Crafted ${craftedItem.name}.`
    : "Crafting complete.";
  renderInventory();
  applyProgressionGain(40, "Crafting mastery");
}

function resetBattle() {
  const npc = getSelectedNpc();
  state = {
    ...state,
    player: createCombatant(DEFAULT_PLAYER),
    enemy: createCombatant({ ...npc, isEnemy: true })
  };
  logList.innerHTML = "";
  lootList.innerHTML = "";
  enemyName.textContent = npc.name;
  npcDescription.textContent = npc.description;
  pushLog([`A new duel begins against ${npc.name}. Choose your opening move.`]);
  updateMeters();
}

function getVictoryReward(enemy) {
  const base = Math.max(40, Math.round(enemy.maxHealth / 2));
  return {
    xp: base,
    label: `${enemy.name} defeated (+${base} XP)`
  };
}

function getMilestoneForLevel(level) {
  return rewardMilestones.find(
    (reward) => reward.level <= level && !state.claimedRewards.has(reward.level)
  ) || null;
}

function applyProgressionGain(amount, sourceLabel) {
  const result = progressionSystem.awardXp(state.progression, amount);
  if (result.error) {
    pushLog([result.error]);
    return;
  }
  state.progression = result.state;
  if (sourceLabel) {
    pushLog([`${sourceLabel} earned.`]);
  }
  if (result.leveledUp) {
    pushLog([`Level up! You reached level ${state.progression.level}.`]);
    const milestone = getMilestoneForLevel(state.progression.level);
    if (milestone && !state.claimedRewards.has(milestone.level)) {
      state.pendingReward = milestone;
    }
  }
  renderProgression();
}

function renderProgression() {
  const { level, currentXp, nextLevelXp, progress, totalXp } = state.progression;
  progressLevelBadge.textContent = `Level ${level}`;
  progressXpLabel.textContent = `${totalXp} XP`;
  progressFill.style.width = `${progress * 100}%`;
  progressCurrent.textContent = `${currentXp} / ${nextLevelXp} XP`;
  const nextMilestone = rewardMilestones.find((reward) => reward.level > level);
  progressNext.textContent = nextMilestone
    ? `Next reward at Level ${nextMilestone.level}`
    : "All rewards claimed";

  milestoneList.innerHTML = "";
  rewardMilestones.forEach((milestone) => {
    const li = document.createElement("li");
    const claimed = state.claimedRewards.has(milestone.level);
    li.textContent = `Level ${milestone.level}: ${milestone.label} ${
      claimed ? "(claimed)" : ""
    }`;
    milestoneList.appendChild(li);
  });

  if (state.pendingReward) {
    rewardDescription.textContent = `Ready to claim: ${state.pendingReward.label}.`;
    claimRewardButton.disabled = false;
  } else {
    rewardDescription.textContent = "Win and craft to unlock your next reward.";
    claimRewardButton.disabled = true;
  }
}

function claimReward() {
  if (!state.pendingReward) {
    return;
  }
  const { reward, label, level } = state.pendingReward;
  state.inventory = runtime.inventoryManager.addItem(
    state.inventory,
    reward.itemId,
    reward.quantity
  );
  state.claimedRewards.add(level);
  state.pendingReward = null;
  pushLog([`Reward claimed: ${label}.`]);
  renderInventory();
  renderProgression();
}

function handleAction(action) {
  const result = performTurn({
    player: state.player,
    enemy: state.enemy,
    action
  });
  state = { ...state, player: result.player, enemy: result.enemy };
  pushLog(result.log);
  if (isDefeated(result.enemy)) {
    const reward = getVictoryReward(result.enemy);
    applyProgressionGain(reward.xp, reward.label);
    const lootDrops = runtime.lootSystem.rollLoot(result.enemy.id);
    if (lootDrops.length > 0) {
      const lootLines = lootDrops.map((drop) => {
        const item = runtime.itemRegistry.getItem(drop.itemId);
        state.inventory = runtime.inventoryManager.addItem(
          state.inventory,
          drop.itemId,
          drop.quantity
        );
        return `Looted ${item ? item.name : drop.itemId} x${drop.quantity}.`;
      });
      pushLoot(lootLines);
      renderInventory();
    }
  }
  if (result.experienceGained) {
    state.playerData = playerSystem.applyExperience(state.playerData, result.experienceGained);
    pushLog([`Gained ${result.experienceGained} experience.`]);
    renderProgression();
  }
  updateMeters();
}

function renderRegistryItems() {
  itemRegistryList.innerHTML = "";
  registryEditor.listItems().forEach((item) => {
    const card = document.createElement("div");
    card.className = "registry-card";
    card.innerHTML = `
      <h5>${item.name}</h5>
      <p>${item.description}</p>
      <p>Rarity: ${item.rarity}</p>
    `;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary";
    button.textContent = "Edit";
    button.addEventListener("click", () => populateItemForm(item));
    card.appendChild(button);
    itemRegistryList.appendChild(card);
  });
}

function renderRegistryRecipes() {
  recipeRegistryList.innerHTML = "";
  registryEditor.listRecipes().forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "registry-card";
    const ingredients = Object.entries(recipe.ingredients)
      .map(([itemId, amount]) => `${itemId} x${amount}`)
      .join(", ");
    card.innerHTML = `
      <h5>${recipe.name}</h5>
      <p>Result: ${recipe.resultItemId}</p>
      <p>Ingredients: ${ingredients}</p>
    `;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary";
    button.textContent = "Edit";
    button.addEventListener("click", () => populateRecipeForm(recipe));
    card.appendChild(button);
    recipeRegistryList.appendChild(card);
  });
}

function populateItemForm(item) {
  itemFormMessage.textContent = "";
  itemFormMessage.classList.remove("error");
  if (item) {
    itemFormTitle.textContent = `Edit ${item.name}`;
    itemIdField.value = item.id;
    itemIdField.disabled = true;
    itemNameField.value = item.name;
    itemDescriptionField.value = item.description;
    itemRarityField.value = item.rarity;
    itemEquippableField.checked = Boolean(item.equippable);
    itemSlotField.value = item.equipmentSlotTypeString || "";
  } else {
    itemFormTitle.textContent = "Create Item";
    itemIdField.value = "";
    itemIdField.disabled = false;
    itemNameField.value = "";
    itemDescriptionField.value = "";
    itemRarityField.value = "";
    itemEquippableField.checked = false;
    itemSlotField.value = "";
  }
}

function populateRecipeForm(recipe) {
  recipeFormMessage.textContent = "";
  recipeFormMessage.classList.remove("error");
  if (recipe) {
    recipeFormTitle.textContent = `Edit ${recipe.name}`;
    recipeIdField.value = recipe.id;
    recipeIdField.disabled = true;
    recipeNameField.value = recipe.name;
    recipeResultField.value = recipe.resultItemId;
    ingredientsList.innerHTML = "";
    Object.entries(recipe.ingredients).forEach(([itemId, amount]) => {
      addIngredientRow(itemId, amount);
    });
  } else {
    recipeFormTitle.textContent = "Create Recipe";
    recipeIdField.value = "";
    recipeIdField.disabled = false;
    recipeNameField.value = "";
    recipeResultField.value = "";
    ingredientsList.innerHTML = "";
    addIngredientRow();
  }
}

function addIngredientRow(selectedId = "", amount = 1) {
  const row = document.createElement("div");
  row.className = "ingredient-row";
  const select = document.createElement("select");
  registryEditor.listItems().forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    if (item.id === selectedId) {
      option.selected = true;
    }
    select.appendChild(option);
  });
  const quantity = document.createElement("input");
  quantity.type = "number";
  quantity.min = "1";
  quantity.value = String(amount);
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "secondary";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => row.remove());
  row.appendChild(select);
  row.appendChild(quantity);
  row.appendChild(remove);
  ingredientsList.appendChild(row);
}

function refreshRuntime() {
  runtime = buildRuntimeSystems(registryEditor.getSnapshot());
  populateRecipes();
  renderRecipeDetails();
  renderInventory();
  renderEquipment();
  renderRegistryItems();
  renderRegistryRecipes();
  populateRecipeResultOptions();
}

function populateRarityOptions() {
  itemRarityField.innerHTML = "<option value=\"\">Select rarity</option>";
  Object.keys(RARITY_COLORS).forEach((rarity) => {
    const option = document.createElement("option");
    option.value = rarity;
    option.textContent = rarity;
    itemRarityField.appendChild(option);
  });
}

function populateSlotOptions() {
  itemSlotField.innerHTML = "<option value=\"\">Select slot</option>";
  EQUIPMENT_SLOTS.forEach((slot) => {
    const option = document.createElement("option");
    option.value = slot;
    option.textContent = slot.replace("_", " ");
    itemSlotField.appendChild(option);
  });
}

function populateRecipeResultOptions() {
  recipeResultField.innerHTML = "<option value=\"\">Select item</option>";
  registryEditor.listItems().forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    recipeResultField.appendChild(option);
  });
}

itemEditor.addEventListener("submit", (event) => {
  event.preventDefault();
  const payload = {
    id: itemIdField.value.trim(),
    name: itemNameField.value.trim(),
    description: itemDescriptionField.value.trim(),
    rarity: itemRarityField.value,
    equippable: itemEquippableField.checked,
    equipmentSlotTypeString: itemEquippableField.checked ? itemSlotField.value : ""
  };
  const result = itemIdField.disabled
    ? registryEditor.updateItem(payload.id, payload)
    : registryEditor.addItem(payload);
  if (result.error) {
    itemFormMessage.textContent = result.error;
    itemFormMessage.classList.add("error");
    return;
  }
  itemFormMessage.textContent = "Item saved.";
  itemFormMessage.classList.remove("error");
  refreshRuntime();
});

recipeEditor.addEventListener("submit", (event) => {
  event.preventDefault();
  const ingredients = {};
  ingredientsList.querySelectorAll(".ingredient-row").forEach((row) => {
    const selects = row.querySelectorAll("select");
    const inputs = row.querySelectorAll("input");
    const itemId = selects[0].value;
    const amount = Number(inputs[0].value);
    ingredients[itemId] = amount;
  });
  const payload = {
    id: recipeIdField.value.trim(),
    name: recipeNameField.value.trim(),
    resultItemId: recipeResultField.value,
    ingredients
  };
  const result = recipeIdField.disabled
    ? registryEditor.updateRecipe(payload.id, payload)
    : registryEditor.addRecipe(payload);
  if (result.error) {
    recipeFormMessage.textContent = result.error;
    recipeFormMessage.classList.add("error");
    return;
  }
  recipeFormMessage.textContent = "Recipe saved.";
  recipeFormMessage.classList.remove("error");
  refreshRuntime();
});

newItemButton.addEventListener("click", () => populateItemForm(null));
newRecipeButton.addEventListener("click", () => populateRecipeForm(null));
addIngredientButton.addEventListener("click", () => addIngredientRow());
claimRewardButton.addEventListener("click", claimReward);

function wireTabs() {
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      registryPanes.forEach((pane) => {
        pane.classList.toggle("is-active", pane.dataset.pane === button.dataset.tab);
      });
    });
  });
}

const actions = document.querySelectorAll("button.action");
actions.forEach((button) => {
  if (button.id === "craft-button" || button.id === "claim-reward") {
    return;
  }
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
populateRarityOptions();
populateSlotOptions();
populateRecipeResultOptions();
wireTabs();
populateRecipes();
renderRecipeDetails();
populateItemForm(null);
populateRecipeForm(null);
renderRegistryItems();
renderRegistryRecipes();
renderProgression();
resetBattle();
renderInventory();
renderEquipment();
initializeThemeEngine();
