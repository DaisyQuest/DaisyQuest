// Global variables
let playerId;
let attributes = [];
let currentCombatId = null;
let playerSpells = [];
let selectedSpell = null;
let selectedAction = null;
let craftingInventory = [];
let craftingIngredients = [];
let currentPlayer;
// Event Listeners
document.addEventListener('DOMContentLoaded', initializeGame);
document.getElementById('startCombatBtn').addEventListener('click', startCombat);
document.getElementById('spellSelect').addEventListener('change', handleSpellSelection);

// Initialization
function initializeGame() {
    playerId = localStorage.getItem('playerId');
    if (!playerId) {
        window.location.href = '/';
    } else {
        updatePlayerInfo();
        fetchAttributes().then(() => {
            updateQuestList();
            updateActivityList();
            updateShopList();
            updatePlayerShop();
            initializeCrafting();
        });
        updateInventory();
    }
}


//Sprites:
//Player:
let currentSprite = {
    background: 0,
    face: 0,
    eyes: 0,
    hairhat: 0
};

const spriteCounts = {
    background: 10,
    face: 10,
    eyes: 10,
    hairhat: 10
};

function updateSpritePreview() {
    const preview = document.getElementById('spritePreview');
    preview.innerHTML = `
        <img src="/sprites/background_${currentSprite.background}.png">
        <img src="/sprites/face_${currentSprite.face}.png">
        <img src="/sprites/eyes_${currentSprite.eyes}.png">
        <img src="/sprites/hairhat_${currentSprite.hairhat}.png">
    `;
}

function updateSpriteSelector(type, direction) {
    currentSprite[type] = (currentSprite[type] + direction + spriteCounts[type]) % spriteCounts[type];
    const selector = document.querySelector(`.sprite-selector[data-type="${type}"]`);
    selector.querySelector('.sprite-image').src = `/sprites/${type}_${currentSprite[type]}.png`;
    selector.querySelector('.sprite-count').textContent = `${currentSprite[type] + 1} / ${spriteCounts[type]}`;
    updateSpritePreview();
}

document.querySelectorAll('.sprite-selector').forEach(selector => {
    const type = selector.dataset.type;
    selector.querySelector('.left-btn').addEventListener('click', () => updateSpriteSelector(type, -1));
    selector.querySelector('.right-btn').addEventListener('click', () => updateSpriteSelector(type, 1));
});

function saveSprite() {
    fetch(`/api/players/${playerId}/sprite`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            subspriteBackground: `background_${currentSprite.background}`,
            subspriteFace: `face_${currentSprite.face}`,
            subspriteEyes: `eyes_${currentSprite.eyes}`,
            subspriteHairHat: `hairhat_${currentSprite.hairhat}`
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Sprite updated successfully');
            // Close the modal or show a success message
        })
        .catch(error => console.error('Error updating sprite:', error));
}

// Initialize the sprite selection interface
updateSpritePreview();
document.querySelectorAll('.sprite-selector').forEach(selector => {
    const type = selector.dataset.type;
    updateSpriteSelector(type, 0);
});

//End Sprites

//WORLD MAP START
let selectedLand = null;

function initializeWorldMap() {
    fetch('/api/land/init')
        .then(response => response.json())
        .then(worldMap => {
            const worldMapElement = document.getElementById('worldMap');
            worldMapElement.style.setProperty('--map-width', worldMap.width);

            for (let y = 0; y < worldMap.height; y++) {
                for (let x = 0; x < worldMap.width; x++) {
                    const tile = document.createElement('div');
                    tile.className = 'land-tile';
                    tile.dataset.x = x;
                    tile.dataset.y = y;
                    tile.onclick = () => selectLand(x, y);
                    worldMapElement.appendChild(tile);
                }
            }

            // Select the first tile by default
            selectLand(0, 0);
        })
        .catch(error => {
            console.error('Error initializing world map:', error);
        });
}

function selectLand(x, y) {
    fetch(`/api/land?x=${x}&y=${y}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Land not found');
            }
            return response.json();
        })
        .then(land => {
            selectedLand = land;
            updateLandDetails();
        })
        .catch(error => {
            console.error('Error fetching land details:', error);
            updateLandDetails(null);
        });
}

function updateLandDetails(land = selectedLand) {
    const landInfo = document.getElementById('landInfo');
    console.log(land);
    if (land) {
        landInfo.innerHTML = `
            <p>Coordinates: (${land.xcoordinate}, ${land.ycoordinate})</p>
            <p>Type: ${land.landType || 'Unknown'}</p>
            <p>Owner: ${land.owner ? land.owner.username : 'Unclaimed'}</p>
            <p>For Sale: ${land.forSale ? 'Yes' : 'No'}</p>
        `;

        document.getElementById('buyButton').style.display = land.forSale ? 'inline-block' : 'none';
        document.getElementById('sellButton').style.display = land.owner && !land.forSale ? 'inline-block' : 'none';
        document.getElementById('partitionButton').style.display = land.owner ? 'inline-block' : 'none';
    } else {
        landInfo.innerHTML = '<p>No land selected or land data unavailable.</p>';
        document.getElementById('buyButton').style.display = 'none';
        document.getElementById('sellButton').style.display = 'none';
        document.getElementById('partitionButton').style.display = 'none';
    }
}

function buyLand() {
    const buyerId = playerId; // Replace with actual logged-in player ID
    const currencyType = 'Mana Crystals'; // Replace with selected currency

    fetch('/api/land/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `landId=${selectedLand.id}&buyerId=${buyerId}&currencyType=${currencyType}`
    })
        .then(response => response.json())
        .then(updatedLand => {
            selectedLand = updatedLand;
            updateLandDetails();
            updateMapTile(updatedLand);
        });
}

function sellLand() {
    const prices = { gold: 1000 }; // Replace with actual price input

    fetch('/api/land/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ landId: selectedLand.id, prices: prices })
    })
        .then(response => response.json())
        .then(updatedLand => {
            selectedLand = updatedLand;
            updateLandDetails();
            updateMapTile(updatedLand);
        });
}

function partitionLand() {
    document.getElementById('partitionModal').style.display = 'block';
}

function submitPartition() {
    const area = document.getElementById('partitionArea').value;
    const payoutInterval = document.getElementById('payoutInterval').value;

    fetch(`/api/land/${selectedLand.id}/partition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `area=${area}&payoutInterval=${payoutInterval}`
    })
        .then(response => response.json())
        .then(updatedLand => {
            selectedLand = updatedLand;
            updateLandDetails();
            closeModal();
        });
}

function closeModal() {
    document.getElementById('partitionModal').style.display = 'none';
}

function updateMapTile(land) {
    const tile = document.querySelector(`.land-tile[data-x="${land.xcoordinate}"][data-y="${land.ycoordinate}"]`);
    tile.classList.toggle('owned', !!land.owner);
    tile.classList.toggle('for-sale', land.forSale);
}

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', () => initializeWorldMap(20, 20));
//WORLD MAP END



// Start CRAFTING

//Start Recipe Book

async function openRecipeBook() {
    try {
        const recipes = await fetchRecipes();
        const itemDetails = await fetchItemDetails(recipes);
        displayRecipes(recipes, itemDetails);
        new bootstrap.Modal(document.getElementById('recipeBookModal')).show();
    } catch (error) {
        console.error('Error opening recipe book:', error);
        alert('Failed to open recipe book. Please try again.');
    }
}

async function fetchRecipes() {
    const response = await fetch('/api/recipes/discovered');
    if (!response.ok) {
        throw new Error('Failed to fetch recipes');
    }
    return response.json();
}

async function fetchItemDetails(recipes) {
    const allItemIds = new Set();
    recipes.forEach(recipe => {
        Object.keys(recipe.requiredItemIdsAndAmounts).forEach(id => allItemIds.add(id));
        allItemIds.add(recipe.resultItemId);
    });

    const itemDetailsPromises = Array.from(allItemIds).map(id =>
        fetch(`/api/items/${id}`).then(response => response.json())
    );

    const itemDetails = await Promise.all(itemDetailsPromises);
    return itemDetails.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {});
}

function displayRecipes(recipes, itemDetails) {
    const recipeBookContent = document.getElementById('recipeBookContent');
    if (recipes.length === 0) {
        recipeBookContent.innerHTML = '<p>No recipes discovered yet.</p>';
        return;
    }

    const recipeHtml = recipes.map(recipe => `
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">${recipe.name}</h5>
                <p class="card-text">
                    <strong>Ingredients:</strong> ${formatIngredients(recipe.requiredItemIdsAndAmounts, itemDetails)}
                </p>
                <p class="card-text">
                    <strong>Result:</strong> ${itemDetails[recipe.resultItemId]?.name || 'Unknown Item'}
                </p>
                <p class="card-text">
                    <small class="text-muted">Discovered by: ${recipe.discoveredBy}</small>
                </p>
            </div>
        </div>
    `).join('');

    recipeBookContent.innerHTML = recipeHtml;
}

function formatIngredients(ingredients, itemDetails) {
    return Object.entries(ingredients)
        .map(([itemId, amount]) => {
            const itemName = itemDetails[itemId]?.name || 'Unknown Item';
            return `${itemName} (${amount})`;
        })
        .join(', ');
}

//End Recipe Book

function initializeCrafting() {
    updateCraftingInventory();
}

function updateCraftingInventory() {
    fetch(`/api/players/${playerId}/inventory`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch inventory');
            }
            return response.json();
        })
        .then(inventory => {
            craftingInventory = inventory;
            updateCraftingUI();
        })
        .catch(error => {
            console.error('Error updating crafting inventory:', error);
            alert('Failed to load inventory. Please try again.');
        });
}

function updateCraftingUI() {
    const inventoryList = document.getElementById('craftingInventoryList');
    const ingredientsList = document.getElementById('craftingIngredientsList');

    if (!inventoryList || !ingredientsList) {
        console.error('Crafting list elements not found');
        return;
    }

    inventoryList.innerHTML = craftingInventory.map(item => createCraftingItemHTML(item, 'inventory')).join('');
    ingredientsList.innerHTML = craftingIngredients.map(item => createCraftingItemHTML(item, 'ingredients')).join('');
}

function createCraftingItemHTML(item, listType) {
    return `
        <div class="crafting-item">
            <div>
                <img src="https://place-hold.it/32" alt="${item.name}">
                ${item.name} (${item.quantity || 1})
            <button class="btn btn-sm btn-${listType === 'inventory' ? 'primary' : 'danger'}" 
                    onclick="moveItem('${listType === 'inventory' ? 'right' : 'left'}', '${item.id}')">
                ${listType === 'inventory' ? '→' : '←'}
            </button>
            </div>

        </div>
    `;
}

function moveItem(direction, itemId) {
    const quantity = 1;//parseInt(document.getElementById('craftingQuantity').value, 10) || 1;

    if (direction === 'right') {
        const item = craftingInventory.find(i => i.id === itemId);
        if (item && (item.quantity || 1) >= quantity) {
            const movedItem = { ...item, quantity: quantity };
            const existingIngredient = craftingIngredients.find(i => i.id === itemId);
            if (existingIngredient) {
                existingIngredient.quantity += quantity;
            } else {
                craftingIngredients.push(movedItem);
            }
            item.quantity -= quantity;
            if (item.quantity <= 0) {
                craftingInventory = craftingInventory.filter(i => i.id !== itemId);
            }
        }
    } else {
        const item = craftingIngredients.find(i => i.id === itemId);
        if (item) {
            const inventoryItem = craftingInventory.find(i => i.id === itemId);
            if (inventoryItem) {
                inventoryItem.quantity += item.quantity;
            } else {
                craftingInventory.push({ ...item });
            }
            craftingIngredients = craftingIngredients.filter(i => i.id !== itemId);
        }
    }

    updateCraftingUI();
}

function attemptCrafting() {
    const ingredientsMap = craftingIngredients.reduce((acc, item) => {
        acc[item.id] = item.quantity || 1;
        return acc;
    }, {});

    if (Object.keys(ingredientsMap).length === 0) {
        alert('Please add ingredients before crafting.');
        return;
    }

    fetch(`/api/players/${playerId}/craft`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(ingredientsMap)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Crafting failed');
            }
            return response.json();
        })
        .then(result => {
            alert(result.message);
            updateCraftingInventory();
            craftingIngredients = [];
            updateCraftingUI();
            updatePlayerInfo();
        })
        .catch(error => {
            console.error('Error crafting:', error);
            alert('Error crafting: ' + error.message);
        });
}


// End CRAFTING
function fetchAttributes() {
    return fetch(`/api/players/${playerId}/attributes`)
        .then(response => response.json())
        .then(data => {
            attributes = data;
            createAttributeTabs('quest');
            createAttributeTabs('activity');
        });
}

// Combat Functions
function startCombat() {
    console.log('Starting combat');
    fetch('/api/combat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerIds: [playerId, 'AI1', 'AI2'], playerTeams: {} })
    })
        .then(response => response.json())
        .then(combat => {
            console.log('Combat started:', combat);
            currentCombatId = combat.id;
            updateCombatUI(combat);
            document.getElementById('combatLobby').style.display = 'none';
            document.getElementById('combatArea').style.display = 'block';
            fetchPlayerSpells();
            pollCombatStatus();
        })
        .catch(error => console.error('Error starting combat:', error));
}

function fetchPlayerSpells() {
    fetch(`/api/players/${playerId}/spells`)
        .then(response => response.json())
        .then(spells => {
            playerSpells = spells;
        })
        .catch(error => console.error('Error fetching player spells:', error));
}

function pollCombatStatus() {
    if (!currentCombatId) {
        console.log('No active combat to poll');
        return;
    }

    console.log('Polling combat status for:', currentCombatId);
    fetch(`/api/combat/${currentCombatId}`)
        .then(response => response.json())
        .then(combat => {
            console.log('Received combat update:', combat);
            if (combat.active) {
                updateCombatUI(combat);
                setTimeout(pollCombatStatus, 2000);
            } else {
                console.log('Combat ended');
                showCombatResults(combat);
            }
        })
        .catch(error => {
            console.error('Error polling combat status:', error);
            setTimeout(pollCombatStatus, 2000);
        });
}

function updateCombatUI(combat) {
    console.log('Updating combat UI:', combat);
    updateCombatInfo(combat);
    updateSpellCooldowns(combat);
    updateActionButtons(combat);
    updateSelectionVisibility(combat);
}

function updateCombatInfo(combat) {
    const combatInfo = document.getElementById('combatInfo');
    combatInfo.innerHTML = `
        <p>Combat ID: ${combat.id}</p>
        <p>Current Turn: ${combat.currentTurnPlayerId}</p>
        <p>Turn Number: ${combat.turnNumber}</p>
        <p>Is Active: ${combat.active}</p>
        <h6>Player Health:</h6>
        <ul>
            ${Object.entries(combat.playerHealth).map(([id, health]) => `<li>${id}: ${health}</li>`).join('')}
        </ul>
        <h6>Action Points:</h6>
        <ul>
            ${Object.entries(combat.playerActionPoints).map(([id, ap]) => `<li>${id}: ${ap}</li>`).join('')}
        </ul>
    `;
}

function updateSpellCooldowns(combat) {
    if (combat.spellCooldowns && combat.spellCooldowns[playerId]) {
        const cooldowns = combat.spellCooldowns[playerId];
        const cooldownInfo = Object.entries(cooldowns)
            .map(([spellId, cooldown]) => {
                const spell = playerSpells.find(s => s.id === spellId);
                return spell ? `${spell.name}: ${cooldown}` : null;
            })
            .filter(Boolean)
            .join(', ');

        document.getElementById('combatInfo').innerHTML += `
            <p>Spell Cooldowns: ${cooldownInfo}</p>
       `;
    }
}

function updateActionButtons(combat) {
    const isPlayerTurn = combat.currentTurnPlayerId === playerId;
    const actionButtons = document.querySelectorAll('.action-button');
    actionButtons.forEach(button => button.disabled = !isPlayerTurn);
    document.getElementById('actionButtons').style.display = isPlayerTurn ? 'block' : 'none';
}

function updateSelectionVisibility(combat) {
    const isPlayerTurn = combat.currentTurnPlayerId === playerId;
    const spellSelection = document.getElementById('spellSelection');
    const targetSelection = document.getElementById('targetSelection');
    if (!isPlayerTurn) {
        spellSelection.style.display = 'none';
        targetSelection.style.display = 'none';
    } else {
        targetSelection.style.display = 'block';
    }
}

function performAction(actionType) {
    selectedAction = actionType;
    const spellSelection = document.getElementById('spellSelection');
    const targetSelection = document.getElementById('targetSelection');

    spellSelection.style.display = 'none';
    targetSelection.style.display = 'none';

    if (actionType === 'SPELL') {
        spellSelection.style.display = 'block';
        updateSpellSelection();
        updateSpellInfo();
    } else {
        updateTargetSelection();
        targetSelection.style.display = 'block';
    }
}

function handleSpellSelection() {
    const spellId = document.getElementById('spellSelect').value;
    selectedSpell = playerSpells.find(spell => spell.id === spellId);
    updateSpellInfo();
    document.getElementById('targetSelection').style.display = 'block';
    updateTargetSelection();
}

function updateSpellSelection() {
    const spellSelect = document.getElementById('spellSelect');
    spellSelect.innerHTML = '';
    playerSpells.forEach(spell => {
        const option = document.createElement('option');
        option.value = spell.id;
        option.textContent = spell.name;
        spellSelect.appendChild(option);
    });
    updateSpellInfo();
}

function updateSpellInfo() {
    const spellId = document.getElementById('spellSelect').value;
    selectedSpell = playerSpells.find(spell => spell.id === spellId);

    if (selectedSpell) {
        document.getElementById('spellInfoName').textContent = selectedSpell.name;
        document.getElementById('spellInfoDescription').textContent = selectedSpell.description;
        document.getElementById('spellInfoManaCost').textContent = `Mana Cost: ${selectedSpell.manaCost}`;
        document.getElementById('spellInfoCooldown').textContent = `Cooldown: ${selectedSpell.cooldown} turns`;
    }
}

function updateTargetSelection() {
    const targetSelect = document.getElementById('targetSelect');
    targetSelect.innerHTML = '';

    fetch(`/api/combat/${currentCombatId}`)
        .then(response => response.json())
        .then(combat => {
            combat.playerIds.forEach(id => {
                if (id !== playerId && combat.playerHealth[id] > 0) {
                    const option = document.createElement('option');
                    option.value = id;
                    option.textContent = id;
                    targetSelect.appendChild(option);
                }
            });
        })
        .catch(error => console.error('Error updating target selection:', error));
}

function confirmAction() {
    const targetPlayerId = document.getElementById('targetSelect').value;
    if (!targetPlayerId) {
        alert('Please select a target.');
        return;
    }

    let actionData = {
        playerId: playerId,
        type: selectedAction,
        targetPlayerId: targetPlayerId,
        actionPoints: 1
    };

    if (selectedAction === 'SPELL') {
        if (!selectedSpell) {
            alert('Please select a spell.');
            return;
        }
        actionData.spellId = selectedSpell.id;
    }

    fetch(`/api/combat/${currentCombatId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
        })
        .then(response => response.json())
        .then(updatedCombat => {
            updateCombatUI(updatedCombat);
            document.getElementById('spellSelection').style.display = 'none';
            document.getElementById('targetSelection').style.display = 'none';
            if (!updatedCombat.active) {
                showCombatResults(updatedCombat);
            }
        })
        .catch(error => console.error('Error performing action:', error));

    selectedSpell = null;
}

function showCombatResults(combat) {
    document.getElementById('combatArea').style.display = 'none';
    document.getElementById('combatResults').style.display = 'block';
    const resultsDiv = document.getElementById('combatResults');
    resultsDiv.innerHTML = `
        <h2>Combat Ended</h2>
        <p>Winner: ${determineWinner(combat)}</p>
        <p>Final Health:</p>
        <ul>
            ${Object.entries(combat.playerHealth).map(([id, health]) =>` <li>${id}: ${health}</li>`).join('')
}
        </ul>
        <button onclick="returnToLobby()">Return to Lobby</button> 
        `
    }

    function determineWinner(combat) {
    return Object.entries(combat.playerHealth)
    .find(([id, health]) => health > 0)[0];
    }

    function returnToLobby() {
        currentCombatId = null;
        document.getElementById('combatResults').style.display = 'none';
        document.getElementById('combatLobby').style.display = 'block';
    }

    function endCombat() {
        currentCombatId = null;
        document.getElementById('combatResults').style.display = 'none';
        document.getElementById('combatArea').style.display = 'none';
        document.getElementById('combatLobby').style.display = 'block';
        updatePlayerInfo();
    }

// Player Info and Inventory Functions
 // Declare this at the top of your script

function updatePlayerInfo() {
    fetch(`/api/players/${playerId}`)
        .then(response => response.json())
        .then(player => {
            currentPlayer = player; // Store the player data globally
            const playerInfo = document.getElementById('playerInfo');
            playerInfo.innerHTML = `
                <div class="row">
                    <div class="col-md-4">
                        <div class="sprite-preview mb-3">
                            <img src="/sprites/${player.subspriteBackground || 'background_0'}.png">
                            <img src="/sprites/${player.subspriteFace || 'face_0'}.png">
                            <img src="/sprites/${player.subspriteEyes || 'eyes_0'}.png">
                            <img src="/sprites/${player.subspriteHairHat || 'hairhat_0'}.png">
                        </div>
                        <button class="btn btn-primary btn-sm mb-3" onclick="openSpriteSelectionModal()">Customize Sprite</button>
                    </div>
                    <div class="col-md-8">
                        <h6>Player: ${player.username}</h6>
                        <p>Level: ${player.level}</p>
                        <p>Total Experience: ${player.totalExperience}</p>
                        <p>Mana: ${player.currentMana} / ${player.maxMana}</p>
                        <h6>Attributes:</h6>
                        <ul class="list-group">
                            ${Object.entries(player.attributes || {}).map(([key, value]) =>
                `<li class="list-group-item">${key}: Level ${value.level} (XP: ${value.experience})</li>`
            ).join('')}
                        </ul>
                        <h6 class="mt-3">Currencies:</h6>
                        <ul class="list-group">
                            ${Object.entries(player.currencies || {}).map(([key, value]) =>
                `<li class="list-group-item">${key}: ${value}</li>`
            ).join('')}
                        </ul>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error updating player info:', error);
            alert('Failed to update player info. Please refresh the page.');
        });
}

function openSpriteSelectionModal() {
    // Fetch the latest player data
    fetch(`/api/players/${playerId}`)
        .then(response => response.json())
        .then(player => {
            // Initialize the sprite selection with the player's current sprite
            currentSprite = {
                background: parseInt(player.subspriteBackground?.split('_')[1] || '0'),
                face: parseInt(player.subspriteFace?.split('_')[1] || '0'),
                eyes: parseInt(player.subspriteEyes?.split('_')[1] || '0'),
                hairhat: parseInt(player.subspriteHairHat?.split('_')[1] || '0')
            };
            updateSpritePreview();
            document.querySelectorAll('.sprite-selector').forEach(selector => {
                const type = selector.dataset.type;
                updateSpriteSelector(type, 0);
            });

            // Open the modal
            new bootstrap.Modal(document.getElementById('spriteSelectionModal')).show();
        })
        .catch(error => {
            console.error('Error fetching player data:', error);
            alert('Failed to load player data. Please try again.');
        });
}

    function updateInventory() {
        fetch(`/api/players/${playerId}/inventory`)
            .then(response => response.json())
            .then(inventory => {
                const inventoryList = document.getElementById('inventoryList');
                inventoryList.innerHTML = inventory.map(item => `
                <div class="inventory-item">
                    <h6>${item.name}</h6>
                    <p>${item.description}</p>
                    <p>Sell Price: ${item.sellPrice} gold</p>
                    <button class="btn btn-sm btn-primary" onclick="useItem('${item.id}')">Use</button>
                    <button class="btn btn-sm btn-danger" onclick="dropItem('${item.id}')">Drop</button>
                    <button class="btn btn-sm btn-info" onclick="openSendItemModal('${item.id}')">Send</button>
                    <button class="btn btn-sm btn-success" onclick="openListItemModal('${item.id}')">List for Sale</button>
                </div>
            `).join('');
            });
    }

// Quest and Activity Functions
    function updateQuestList() {
        fetch('/api/quests')
            .then(response => response.json())
            .then(quests => {
                attributes.forEach(attr => {
                    const questList = document.getElementById(`quest-${attr}`);
                    const filteredQuests = quests.filter(quest => quest.requirements && quest.requirements[attr]);
                    questList.innerHTML = createTaskList(filteredQuests, 'quest');
                });
            });
    }

    function updateActivityList() {
        fetch('/api/activities')
            .then(response => response.json())
            .then(activities => {
                attributes.forEach(attr => {
                    const activityList = document.getElementById(`activity-${attr}`);
                    const filteredActivities = activities.filter(activity => activity.requirements && activity.requirements[attr]);
                    activityList.innerHTML = createTaskList(filteredActivities, 'activity');
                });
            });
    }

function convertTimestampToReadableDate(timestamp) {
    var date = new Date(timestamp);
    var formattedDate = date.toLocaleString();
    return formattedDate;
}

function createAttributeTabs(taskType) {
    const tabList = document.getElementById(`${taskType}AttributeTabs`);
    const tabContent = document.getElementById(`${taskType}AttributeTabContent`);

    attributes.forEach((attr, index) => {
        const tab = document.createElement('li');
        tab.className = 'nav-item';
        tab.innerHTML = `
            <button class="nav-link ${index === 0 ? 'active' : ''}" id="${taskType}-${attr}-tab" data-bs-toggle="tab" 
                    data-bs-target="#${taskType}-${attr}" type="button" role="tab" 
                    aria-controls="${taskType}-${attr}" aria-selected="${index === 0}">${attr}</button>
        `;
        tabList.appendChild(tab);

        const content = document.createElement('div');
        content.className = `tab-pane fade ${index === 0 ? 'show active' : ''}`;
        content.id = `${taskType}-${attr}`;
        content.setAttribute('role', 'tabpanel');
        content.setAttribute('aria-labelledby', `${taskType}-${attr}-tab`);
        tabContent.appendChild(content);
    });
}

function createTaskList(tasks, taskType) {
    return `
        <ul class="list-group">
            ${tasks.map(task => `
                <li class="list-group-item">
                    <h6>${task.name}</h6>
                    <p>${task.description}</p>
                    <div class="task-info">
                        <strong>Rewards:</strong>
                        <ul>
                            <li>Experience: ${task.experienceReward}</li>
                            ${Object.entries(task.attributeRewards || {}).map(([attr, value]) =>
        `<li>${attr}: +${value}</li>`
    ).join('')}
                            ${Object.entries(task.itemRewards || {}).map(([item, quantity]) =>
        `<li>${item}: ${quantity}</li>`
    ).join('')}
                        </ul>
                        <strong>Requirements:</strong>
                        <ul>
                            ${Object.entries(task.requirements || {}).map(([attr, value]) =>
        `<li>${attr}: ${value}</li>`
    ).join('')}
                        </ul>
                    </div>
                    <button class="btn btn-primary btn-sm mt-2" onclick="start${taskType === 'quest' ? 'Quest' : 'Activity'}('${task.id}')">
                        Start ${taskType === 'quest' ? 'Quest' : 'Activity'}
                    </button>
                </li>
            `).join('')}
        </ul>
    `;
}

// Quest and Activity Functions
function startQuest(questId) {
    fetch(`/api/quests/${questId}/start?playerId=${playerId}`, { method: 'POST' })
        .then(response => response.json())
        .then(quest => {
            const activeTask = document.getElementById('activeTask');
            activeTask.innerHTML = `
                <h6>${quest.name}</h6>
                <p>${quest.description}</p>
                <p>Time remaining: <span id="timeRemaining">${quest.duration.toFixed(1)}</span> seconds</p>
                <div class="progress">
                    <div id="questProgress" class="progress-bar smooth-progress" role="progressbar" style="width: 0%"></div>
                </div>
            `;
            startQuestTimer(quest.duration, questId)});
}
function startActivity(activityId) {
    fetch(`/api/activities/${activityId}/start?playerId=${playerId}`, { method: 'POST' })
        .then(response => response.json())
        .then(activity => {
            const activeTask = document.getElementById('activeTask');
            activeTask.innerHTML = `
                <h6>${activity.name}</h6>
                <p>${activity.description}</p>
                <p>Time remaining: <span id="timeRemaining">${activity.duration.toFixed(1)}</span> seconds</p>
                <div class="progress">
                    <div id="questProgress" class="progress-bar smooth-progress" role="progressbar" style="width: 0%"></div>
                </div>
            `;
            startQuestTimer(activity.duration, activityId);
        });
}

function startQuestTimer(duration, questId) {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;
    const timerElement = document.getElementById('timeRemaining');
    const progressBar = document.getElementById('questProgress');

    progressBar.style.transition = 'width 0.1s linear';

    function updateTimer() {
        const currentTime = Date.now();
        const timeRemaining = Math.max(0, endTime - currentTime);
        const progress = 1 - (timeRemaining / (duration * 1000));

        timerElement.textContent = (timeRemaining / 1000).toFixed(1);
        progressBar.style.width = `${progress * 100}%`;

        if (timeRemaining > 0) {
            requestAnimationFrame(updateTimer);
        } else {
            completeQuest(questId);
        }
    }

    requestAnimationFrame(updateTimer);
}

function completeQuest(questId) {
    fetch(`/api/quests/${questId}/complete?playerId=${playerId}`, {method: 'POST'})
        .then(response => response.json())
        .then(result => {
            alert(`Quest completed!\nExperience gained: ${result.experienceGained}\nAttribute increases: ${JSON.stringify(result.attributeIncreases)}`);
            updatePlayerInfo();
            updateQuestList();
            document.getElementById('activeTask').innerHTML = '';
        });
}

function useItem(itemId) {
    fetch(`/api/players/${playerId}/use-item/${itemId}`, { method: 'POST' })
        .then(response => response.json())
        .then(result => {
            alert(`Item used! ${result.message}`);
            updatePlayerInfo();
            updateInventory();
        });
}

function dropItem(itemId) {
    if (confirm('Are you sure you want to drop this item?')) {
        fetch(`/api/players/${playerId}/drop-item/${itemId}`, { method: 'POST' })
            .then(response => response.json())
            .then(result => {
                alert(`Item dropped! ${result.message}`);
                updateInventory();
            });
    }
}

function openSendItemModal(itemId) {
    document.getElementById('itemIdToSend').value = itemId;
    new bootstrap.Modal(document.getElementById('sendItemModal')).show();
}

function sendItem() {
    const itemId = document.getElementById('itemIdToSend').value;
    const recipientUsername = document.getElementById('recipientUsername').value;

    fetch(`/api/players/${playerId}/send-item`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, recipientUsername }),
    })
        .then(response => response.json())
        .then(result => {
            alert(`Item sent! ${result.message}`);
            updateInventory();
            bootstrap.Modal.getInstance(document.getElementById('sendItemModal')).hide();
        })
        .catch(error => {
            alert('Error sending item: ' + error.message);
        });
}

function updateShopList() {
    fetch('/api/shops')
        .then(response => response.json())
        .then(shops => {
            const shopList = document.getElementById('shopList');
            shopList.innerHTML = shops.map(shop => `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">${shop.name}</h5>
                        <p class="card-text">Owner: ${shop.ownerId ? 'Player-owned' : 'NPC'}</p>
                        <button class="btn btn-primary" onclick="viewShop('${shop.id}')">View Shop</button>
                    </div>
                </div>
            `).join('');
        });
}

function viewShop(shopId) {
    fetch(`/api/shops/${shopId}`)
        .then(response => response.json())
        .then(shop => {
            const shopList = document.getElementById('shopList');
            shopList.innerHTML = `
                <h4>${shop.name}</h4>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Price</th>
                            <th>Currency</th>
                            <th>Quantity</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${shop.items.map(item => `
                            <tr>
                                <td>${item.itemForSale.name}</td>
                                <td>${item.price}</td>
                                <td>${item.currencyUsed.name}</td>
                                <td>${item.quantity !== null ? item.quantity : 'Unlimited'}</td>
                                <td><button class="btn btn-sm btn-primary" onclick="buyItem('${shop.id}', '${item.id}')">Buy</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button class="btn btn-secondary" onclick="updateShopList()">Back to Shop List</button>
            `;
        });
}

function buyItem(shopId, itemId) {
    fetch(`/api/shops/${shopId}/buy/${itemId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId: playerId })
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            updatePlayerInfo();
            updateInventory();
            viewShop(shopId); // Refresh the shop view
        })
        .catch(error => {
            alert('Error buying item: ' + error.message);
        });
}

function openListItemModal(itemId) {
    document.getElementById('itemIdToList').value = itemId;

    // Populate currency options
    fetch('/api/currencies')
        .then(response => response.json())
        .then(currencies => {
            const currencySelect = document.getElementById('itemCurrency');
            currencySelect.innerHTML = currencies.map(currency =>
                `<option value="${currency.id}">${currency.name}</option>`
            ).join('');
        });

    new bootstrap.Modal(document.getElementById('listItemModal')).show();
}

function listItemForSale() {
    const itemId = document.getElementById('itemIdToList').value;
    const price = parseInt(document.getElementById('itemPrice').value, 10);
    const currencyId = document.getElementById('itemCurrency').value;
    const quantityInput = document.getElementById('itemQuantity').value;
    const quantity = quantityInput ? parseInt(quantityInput, 10) : null;

    fetch(`/api/players/${playerId}/shop/list-item`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, price, currencyId, quantity })
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            updatePlayerShop();
            updateInventory();
            bootstrap.Modal.getInstance(document.getElementById('listItemModal')).hide();
        })
        .catch(error => {
            alert('Error listing item: ' + error.message);
        });
}
function removeShopItem(shopItemId) {
    if (confirm('Are you sure you want to remove this item from your shop?')) {
        fetch(`/api/players/${playerId}/shop/remove-item/${shopItemId}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(result => {
                alert(result.message);
                updatePlayerShop();
                updateInventory();
            })
            .catch(error => {
                alert('Error removing item: ' + error.message);
            });
    }
}

// Combat Timer Function
function updateTurnTimer(startTime, duration) {
    const timerElement = document.getElementById('turnTimer');
    const updateTimer = () => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        const remainingSeconds = Math.max(0, duration - elapsedSeconds);
        timerElement.textContent = remainingSeconds;
        if (remainingSeconds > 0) {
            setTimeout(updateTimer, 1000);
        }
    };
    updateTimer();
}



// Periodically check for combat updates (in case it's not the player's turn)
setInterval(() => {
    if (currentCombatId) {
        fetch(`/api/combat/${currentCombatId}`)
            .then(response => response.json())
            .then(combat => {
                updateCombatUI(combat);
                if (!combat.active) {
                    showCombatResults(combat);
                }
            })
            .catch(error => console.error('Error fetching combat update:', error));
    }
}, 5000);


function updatePlayerShop() {
    fetch(`/api/players/${playerId}/shop`)
        .then(response => response.json())
        .then(shop => {
            const playerShopList = document.getElementById('playerShopList');
            if (shop) {
                playerShopList.innerHTML = `
                    <h4>${shop.name}</h4>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Price</th>
                                <th>Currency</th>
                                <th>Quantity</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${shop.items.map(item => `
                                <tr>
                                    <td>${item.itemForSale.name}</td>
                                    <td>${item.price}</td>
                                    <td>${item.currencyUsed.name}</td>
                                    <td>${item.quantity !== null ? item.quantity : 'Unlimited'}</td>
                                    <td><button class="btn btn-sm btn-danger" onclick="removeShopItem('${item.id}')">Remove</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                playerShopList.innerHTML = '<p>You don\'t have a shop yet. List an item for sale to create your shop!</p>';
            }
        });
}
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('crafting-tab').addEventListener('shown.bs.tab', function (e) {
        updateCraftingInventory();
    });
});
window.moveItem = moveItem;
window.attemptCrafting = attemptCrafting;