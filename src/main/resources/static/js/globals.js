//globals.js
let playerId  = localStorage.getItem('playerId');
window.playerId = playerId;
let attributes = [];
window.attributes = attributes
let currentCombatId = null;
window.currentCombatId = currentCombatId;
let playerSpells = [];
window.playerSpells =playerSpells

let selectedSpell = null;
window.selectedSpell = selectedSpell;
let selectedAction = null;
window.selectedAction = selectedAction;
let craftingInventory = [];
window.craftingInventory = craftingInventory;
let craftingIngredients = [];
window.craftingIngredients = craftingIngredients;
let currentPlayer;
window.currentPlayer =currentPlayer;
let unclaimedRewardCount = 0;
window.unclaimedRewardCount = unclaimedRewardCount
let combatLogs = [];
window.combatLogs = combatLogs;
let currencyDetails = [];
window.currencyDetails = currencyDetails
let playerCurrencies = {};
window.playerCurrencies = playerCurrencies;