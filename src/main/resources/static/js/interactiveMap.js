
    // World Map variables
    const canvas = document.getElementById('worldMapCanvas');
    const ctx = canvas.getContext('2d');
    const coordsDisplay = document.getElementById('coordinates');
    canvas.addEventListener('click', handleMapClick);
    let worldMap;
    let players = [];
    let currentPlayer;
    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
    window.location.href = '/login';
}
    const LAND_SIZE = 10000;
    const VIEWPORT_WIDTH = 1000;
    const VIEWPORT_HEIGHT = 800;
    const SPRITE_SIZE = 32;

    const terrainColors = {
    PLAINS: '#90EE90',
    FOREST: '#228B22',
    MOUNTAIN: '#A0522D',
    WATER: '#4169E1',
    DESERT: '#F4A460'
};

    // Combat variables
    let currentCombatId;
    let selectedAction;
    let selectedSpell;
    let playerSpells = [];
    let combatLogs = [];

    let submapEntrances = [];


    // Submap variables
    let currentSubmap = null;

    let isInSubmap = false;
    // Duel variables
    let selectedPlayer = null;
    const DUEL_RANGE = 100;
    let lastClickX, lastClickY;
    let socket;
    let statusEffects = {};



    function initGameData() {
    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
    window.location.href = '/login';
    return;
}

    Promise.all([
    fetch('/api/world-map'),
    fetch(`/api/players/${playerId}`),
    fetch('/api/world-map/submap-entrances')
    ])
    .then(([worldMapResponse, playerResponse, submapEntrancesResponse]) =>
    Promise.all([worldMapResponse.json(), playerResponse.json(), submapEntrancesResponse.json()])
    )
    .then(([worldMapData, playerData, submapEntrancesData]) => {
    worldMap = worldMapData;
    submapEntrances = submapEntrancesData;

    currentPlayer = {
    id: playerData.player.id,
    username: playerData.player.username,
    level: playerData.player.level,
    experience: playerData.player.experience,
    worldPositionX: playerData.player.worldPositionX || 10000,
    worldPositionY: playerData.player.worldPositionY || 10000,
    currentSubmapId: playerData.player.currentSubmapId,
    submapCoordinateX: playerData.player.submapCoordinateX,
    submapCoordinateY: playerData.player.submapCoordinateY,
    submapCoordinateZ: playerData.player.submapCoordinateZ,
    // Add other relevant player properties here
};
    isInSubmap = currentPlayer.currentSubmapId != null;
    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;

    updatePlayerInfo();
    setupWebSocket();

    if (currentPlayer.currentSubmapId) {
    loadSubmapData(currentPlayer.currentSubmapId);
} else {
    drawWorldMap();
    fetchPlayersInViewport();
}
})
    .catch(error => {
    console.error('Error initializing game data:', error);
});
}




    function initWorldMap() {
    initGameData();
}


    function handleMapClick(event) {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Find if a player was clicked
    const clickedPlayer = findClickedPlayer(clickX, clickY);

    if (clickedPlayer) {
    handlePlayerClick(clickedPlayer);
} else {
    handleTerrainClick(clickX, clickY);
}
}

    // Add a new function to handle map clicks
    function handleTerrainClick(clickX, clickY) {
    if (isInSubmap) {
    handleSubmapTerrainClick(clickX, clickY);
} else {
    handleOverworldTerrainClick(clickX, clickY);
}
}
    function handleSubmapTerrainClick(clickX, clickY) {
    // Convert click coordinates to submap coordinates
    const submapX = currentPlayer.submapCoordinateX + (clickX - VIEWPORT_WIDTH / 2);
    const submapY = currentPlayer.submapCoordinateY + (clickY - VIEWPORT_HEIGHT / 2);

    // Check if the click is on an exit point
    if(currentSubmap.elements) {
    const exit = currentSubmap.elements.find(element =>
    element.type === 'exit' &&
    submapX >= element.x && submapX <= element.x + element.width &&
    submapY >= element.y && submapY <= element.y + element.height
    );
}
    //todo: clean
    if (false && exit) {
    returnToOverworld();
} else {
    // Ensure the target is within submap boundaries
    const targetX = Math.max(0, Math.min(currentSubmap.width - 1, submapX));
    const targetY = Math.max(0, Math.min(currentSubmap.height - 1, submapY));

    setupMovementPath(targetX, targetY);
}
}
    function handleOverworldTerrainClick(clickX, clickY) {
    const worldX = getCurrentPlayerX() + Math.round(clickX - VIEWPORT_WIDTH / 2);
    const worldY = getCurrentPlayerY() + Math.round(clickY - VIEWPORT_HEIGHT / 2);

    // Check if click is on a submap entrance
    fetch(`/api/world-map/check-submap-entrance?x=${worldX}&y=${worldY}`)
    .then(response => response.json())
    .then(data => {
    if (data.nearEntrance) {
    enterSubmap(data.submapId);
} else {
    setupMovementPath(worldX, worldY);
}
})
    .catch(error => console.error('Error checking submap entrance:', error));
}

    // Add a function to find the clicked player
    function findClickedPlayer(clickX, clickY) {
    const playerList =  players;
    for (const player of playerList) {
    if (player.id === currentPlayer.id) continue; // Skip current player

    let playerX, playerY;
    if (isInSubmap) {
    playerX = player.submapCoordinateX - currentPlayer.submapCoordinateX + VIEWPORT_WIDTH / 2;
    playerY = player.submapCoordinateY - currentPlayer.submapCoordinateY + VIEWPORT_HEIGHT / 2;
} else {
    playerX = player.worldPositionX - currentPlayer.worldPositionX + VIEWPORT_WIDTH / 2;
    playerY = player.worldPositionY - currentPlayer.worldPositionY + VIEWPORT_HEIGHT / 2;
}

    const dx = clickX - playerX;
    const dy = clickY - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= SPRITE_SIZE / 2) {
    return player;
}
}
    return null;
}

    function handleSubmapClick(clickX, clickY) {
    // Check if the click is on an exit point

    if(currentSubmap.elements) {
    const exit = currentSubmap.elements.find(element =>
    element.type === 'exit' &&
    clickX >= element.x && clickX <= element.x + element.width &&
    clickY >= element.y && clickY <= element.y + element.height
    );
}

    if (false && exit) {
    returnToOverworld();
} else {
    // Convert click coordinates to submap coordinates
    const submapX = currentPlayer.submapCoordinateX + (clickX - VIEWPORT_WIDTH / 2);
    const submapY = currentPlayer.submapCoordinateY + (clickY - VIEWPORT_HEIGHT / 2);

    // Ensure the target is within submap boundaries
    const targetX = Math.max(0, Math.min(currentSubmap.width - 1, submapX));
    const targetY = Math.max(0, Math.min(currentSubmap.height - 1, submapY));

    setupMovementPath(targetX, targetY);
}
}
    // New function to set up the movement path
    let movementQueue = [];
    const MOVE_SPEED = 3; // pixels per frame
    let moveInterval = null;
    let movementVector = { x: 0, y: 0 };
    let isKeyboardMovement = false;
    let lastReportedPosition = { x: 0, y: 0 };
    const REPORT_THRESHOLD = 10; // Minimum distance to move before reporting to server

    function setupMovementPath(targetX, targetY) {
    const startX = isInSubmap ? currentPlayer.submapCoordinateX : getCurrentPlayerX();
    const startY = isInSubmap ? currentPlayer.submapCoordinateY : getCurrentPlayerY();

    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 1) return;

    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    movementQueue = [];

    for (let i = 0; i < distance; i += MOVE_SPEED) {
    movementQueue.push({
    x: Math.round(startX + normalizedDx * i),
    y: Math.round(startY + normalizedDy * i)
});
}

    movementQueue.push({ x: targetX, y: targetY });

    isKeyboardMovement = false;
    startMovementInterval();
}

    // New function to process the movement queue

    function fetchPlayersInViewport() {
    if (currentSubmap) {
    // Fetch players in the current submap
    fetch(`/api/submaps/${currentSubmap.id}/players`)
    .then(response => response.json())
    .then(data => {
    players = Array.isArray(data) ? data : [];
    updateNearbyPlayersList();
    drawSubmap();
})
    .catch(error => console.error('Error fetching players in submap:', error));
} else {
    // Fetch players in the overworld viewport
    const centerX = getCurrentPlayerX();
    const centerY = getCurrentPlayerY();

    fetch(`/api/world-map/players?centerX=${centerX}&centerY=${centerY}&viewportWidth=${VIEWPORT_WIDTH}&viewportHeight=${VIEWPORT_HEIGHT}`)
    .then(response => response.json())
    .then(data => {
    players = Array.isArray(data) ? data : [];
    updateNearbyPlayersList();
    drawWorldMap();
})
    .catch(error => console.error('Error fetching players in overworld:', error));
}
}
    function checkSubmapEntrance(worldX, worldY) {
    fetch(`/api/world-map/check-submap-entrance?x=${worldX}&y=${worldY}`)
        .then(response => response.json())
        .then(data => {
            if (data.nearEntrance) {
                enterSubmap(data.submapId);
            }
        });
}

    function enterSubmap(submapId) {
    fetch(`/api/submaps/${submapId}/move/${getCurrentPlayerId()}`, { method: 'POST' })
        .then(response => response.json())
        .then(updatedPlayer => {
            currentPlayer = {
                id: updatedPlayer.id,
                username: updatedPlayer.username,
                level: updatedPlayer.level,
                experience: updatedPlayer.experience,
                worldPositionX: updatedPlayer.worldPositionX,
                worldPositionY: updatedPlayer.worldPositionY,
                currentSubmapId: submapId,
                submapCoordinateX: parseInt(updatedPlayer.submapCoordinateX),
                submapCoordinateY: parseInt(updatedPlayer.submapCoordinateY),
                submapCoordinateZ: updatedPlayer.submapCoordinateZ
                // Add any other relevant properties here
            };
            currentSubmap = submapId;
            isInSubmap = true;
            loadSubmapData(submapId);
        })
        .catch(error => console.error('Error entering submap:', error));
}


    function drawWorldMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const startX = Math.floor(currentPlayer.worldPositionX / LAND_SIZE) * LAND_SIZE;
    const startY = Math.floor(currentPlayer.worldPositionY / LAND_SIZE) * LAND_SIZE;

    for (let y = -LAND_SIZE; y <= VIEWPORT_HEIGHT + LAND_SIZE; y += LAND_SIZE) {
    for (let x = -LAND_SIZE; x <= VIEWPORT_WIDTH + LAND_SIZE; x += LAND_SIZE) {
    const worldX = startX + x;
    const worldY = startY + y;

    const offsetX = Math.round(x - (currentPlayer.worldPositionX % LAND_SIZE) + VIEWPORT_WIDTH / 2);
    const offsetY = Math.round(y - (currentPlayer.worldPositionY % LAND_SIZE) + VIEWPORT_HEIGHT / 2);

    ctx.fillStyle = getTileColor(Math.floor(worldX / LAND_SIZE), Math.floor(worldY / LAND_SIZE));
    ctx.fillRect(offsetX, offsetY, LAND_SIZE, LAND_SIZE);

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.strokeRect(offsetX, offsetY, LAND_SIZE, LAND_SIZE);
}
}

    for (const player of players) {
    if (player.id !== currentPlayer.id) {
    const x = Math.round(player.worldPositionX - currentPlayer.worldPositionX + VIEWPORT_WIDTH / 2);
    const y = Math.round(player.worldPositionY - currentPlayer.worldPositionY + VIEWPORT_HEIGHT / 2);

    if (x >= -SPRITE_SIZE/2 && x < VIEWPORT_WIDTH + SPRITE_SIZE/2 &&
    y >= -SPRITE_SIZE/2 && y < VIEWPORT_HEIGHT + SPRITE_SIZE/2) {
    drawPlayer(x, y, player, false);
}
}
}

    submapEntrances.forEach(entrance => {
    const x = entrance.x - currentPlayer.worldPositionX + VIEWPORT_WIDTH / 2;
    const y = entrance.y - currentPlayer.worldPositionY + VIEWPORT_HEIGHT / 2;
    ctx.fillStyle = '#FF00FF'; // Magenta color for visibility
    ctx.fillRect(x - 5, y - 5, 10, 10);
});


    drawPlayer(VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2, currentPlayer, true);

    coordsDisplay.textContent = `X: ${currentPlayer.worldPositionX}, Y: ${currentPlayer.worldPositionY}`;
}

    function getTileColor(x, y) {
    // In a real implementation, you would fetch the actual terrain type for these coordinates
    const terrainType = ['PLAINS', 'FOREST', 'MOUNTAIN', 'WATER', 'DESERT'][Math.floor(Math.random() * 5)];
    return terrainColors['PLAINS'];
}


    async function drawPlayer(x, y, player, isCurrentPlayer) {
    const layers = [
    player.subspriteBackground || 'background_0',
    player.subspriteFace || 'face_0',
    player.subspriteEyes || 'eyes_0',
    player.subspriteHairHat || 'hairhat_0'
    ];
    try {
    for (const layer of layers) {
    const sprite = await loadSprite(layer);
    ctx.drawImage(sprite, x - SPRITE_SIZE / 2, y - SPRITE_SIZE / 2, SPRITE_SIZE, SPRITE_SIZE);
}
    ctx.fillStyle = isCurrentPlayer ? '#e74c3c' : '#3498db';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.username, x, y + SPRITE_SIZE / 2 + 15);
} catch (error) {
    console.error('Error loading sprite:', error);
    ctx.fillStyle = isCurrentPlayer ? '#e74c3c' : '#3498db';
    ctx.beginPath();
    ctx.arc(x, y, SPRITE_SIZE / 2, 0, 2 * Math.PI);
    ctx.fill();
}
}


    function loadSprite(spriteName) {
    return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `/sprites/${spriteName}.png`;
});
}

    function updatePlayerInfo() {
    if (currentPlayer) {
    document.getElementById('player-name').textContent = currentPlayer.username || '';
    document.getElementById('player-level').textContent = currentPlayer.level || '';
    document.getElementById('player-exp').textContent = currentPlayer.currentSubmapId || 'NO SUBMAP';
}
}

    function updateNearbyPlayersList() {
    const nearbyPlayersList = document.getElementById('nearby-players');
    nearbyPlayersList.innerHTML = '';

    players.forEach(player => {
    if (player.id !== currentPlayer.id) {
    const li = document.createElement('li');
    li.textContent = `${player.username} (Level ${player.level})${player.isNPC ? ' [NPC]' : ''}`;
    nearbyPlayersList.appendChild(li);
}
});
}
    const MOVE_INTERVAL = 1000 / 60; // 60 FPS
    const SEND_INTERVAL = 200; // Send position to server every 200ms

    let sendInterval;
    let accumulatedMovement = { x: 0, y: 0 };

    function updatePlayerPosition(playerIdOfPlayerToUpdate, x, y) {
    if (!currentPlayer) {
    console.error('Current player is not initialized');
    return;
}

    if (x <= 0 || y <= 0) {
    console.log('Attempted move to invalid position:', x, y);
    return;
}

    x = Math.round(x);
    y = Math.round(y);

    if (playerIdOfPlayerToUpdate === getCurrentPlayerId()) {
    if (x === getCurrentPlayerX() && y === getCurrentPlayerY()) {
    return;
}

    setCurrentPlayerPosition(x, y);
    updatePlayerInfo();
    drawWorldMap();
} else {
    const player = players.find(p => p.id === playerIdOfPlayerToUpdate);
    if (player) {
    player.worldPositionX = x;
    player.worldPositionY = y;
    drawWorldMap();
} else {
    console.log('Player not found in viewport:', playerIdOfPlayerToUpdate);
    fetchPlayersInViewport();
}
}
}


    const sendPositionToServer = debounce(() => {
    if (isInSubmap) {
    fetch(`/api/submaps/${currentSubmap.id}/move-player`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
    playerId: getCurrentPlayerId(),
    x: Math.round(currentPlayer.submapCoordinateX),
    y: Math.round(currentPlayer.submapCoordinateY)
})
}).catch(error => console.error('Error updating player position in submap:', error));
} else {
    fetch('/api/world-map/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
    playerId: getCurrentPlayerId(),
    newX: Math.round(currentPlayer.worldPositionX),
    newY: Math.round(currentPlayer.worldPositionY)
})
}).catch(error => console.error('Error updating player position in overworld:', error));
}
}, 100); // Debounce for 100msebounce for 100ms


    function updateLocalPosition() {
    if (movementVector.x !== 0 || movementVector.y !== 0) {
    const normalizedVector = normalizeVector(movementVector);
    const dx = normalizedVector.x * (MOVE_SPEED * MOVE_INTERVAL / 1000);
    const dy = normalizedVector.y * (MOVE_SPEED * MOVE_INTERVAL / 1000);

    if (isInSubmap) {
    currentPlayer.submapCoordinateX = Math.max(0, Math.min(currentSubmap.width - 1, currentPlayer.submapCoordinateX + dx));
    currentPlayer.submapCoordinateY = Math.max(0, Math.min(currentSubmap.height - 1, currentPlayer.submapCoordinateY + dy));
    drawSubmap();
} else {
    currentPlayer.worldPositionX += dx;
    currentPlayer.worldPositionY += dy;
    drawWorldMap();
}
}
}
    function normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    return magnitude !== 0 ? { x: vector.x / magnitude, y: vector.y / magnitude } : { x: 0, y: 0 };
}



    // Debounce function
    function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
    const later = () => {
    clearTimeout(timeout);
    func(...args);
};
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
};
}






    function startCombat(combatId) {
    currentCombatId = combatId;
    document.getElementById('worldMapContainer').style.display = 'none';
    document.getElementById('combatArea').style.display = 'block';
    fetchCombatState(combatId);
}

    function fetchCombatState(combatId) {
    fetch(`/api/combat/${combatId}`)
        .then(response => response.json())
        .then(combat => {
            updateCombatUI(combat);
            fetchPlayerSpells();
            fetchStatusEffects(combatId);
            pollCombatStatus();
        })
        .catch(error => console.error('Error fetching combat state:', error));
}

    function fetchStatusEffects(combatId) {
    fetch(`/api/combat/${combatId}/status-effects`)
        .then(response => response.json())
        .then(effects => {
            statusEffects = effects || {}; // Ensure statusEffects is always an object
            updateStatusEffectsDisplay();
        })
        .catch(error => {
            console.error('Error fetching status effects:', error);
            statusEffects = {}; // Reset to empty object on error
        });
}


    function updateCombatUI(combat) {
    updatePlayerCards(combat);
    updateTurnIndicator(combat);
    updateCombatInfo(combat);
    updateSpellCooldowns(combat);
    updateActionButtons(combat);
    updateSelectionVisibility(combat);
    fetchAndUpdateCombatLog(combat.id);
    updateStatusEffectsDisplay();
}


    function updatePlayerCards(combat) {
    const playerCardsContainer = document.getElementById('playerCards');
    playerCardsContainer.innerHTML = '';

    const playerCount = combat.playerIds.length;
    const spriteSize = playerCount < 5 ? 128 : 64;

    combat.playerIds.forEach(id => {
    const health = combat.playerHealth[id];
    const maxHealth = combat.playerHealthStarting[id];
    const healthPercentage = (health / maxHealth) * 100;

    const playerCard = document.createElement('div');
    playerCard.className = `col-md-${Math.floor(12 / playerCount)} player-card`;
    playerCard.innerHTML = `
            <div class="player-sprite" style="width: ${spriteSize}px; height: ${spriteSize}px;">
                ${getPlayerSprite(id, spriteSize)}
            </div>
            <h3 class="text-center mt-2">${id}</h3>
            <div class="health-bar">
                <div class="health-bar-fill" style="width: ${healthPercentage}%"></div>
            </div>
            <p class="text-center mt-2">HP: ${health} / ${maxHealth}</p>
            <p class="text-center">AP: ${combat.playerActionPoints[id]}</p>
            <div class="status-effects" id="status-effects-${id}"></div>
        `;
    playerCardsContainer.appendChild(playerCard);
});
}

    function updateStatusEffectsDisplay() {
    if (!statusEffects || Object.keys(statusEffects).length === 0) {
    console.log('No status effects to display');
    return; // Exit the function if there are no status effects
}

    Object.keys(statusEffects).forEach(playerId => {
    const statusEffectsContainer = document.getElementById(`status-effects-${playerId}`);
    if (statusEffectsContainer) {
    statusEffectsContainer.innerHTML = '';
    const playerEffects = statusEffects[playerId] || [];
    playerEffects.forEach(effect => {
    if (effect && effect.statusEffect) {
    const effectElement = document.createElement('div');
    effectElement.className = 'status-effect';
    effectElement.style.backgroundColor = effect.statusEffect.color || '#cccccc';
    effectElement.style.border = `2px solid ${effect.statusEffect.borderColor || '#999999'}`;
    effectElement.title = `${effect.statusEffect.displayName || 'Unknown Effect'} (${effect.duration} turns)`;
    effectElement.textContent = effect.statusEffect.shortDisplayName || '?';
    statusEffectsContainer.appendChild(effectElement);
}
});
}
});
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
    fetchStatusEffects(currentCombatId); // This will now handle cases with no status effects
    if (!updatedCombat.active) {
    showCombatResults(updatedCombat);
}
})
    .catch(error => {
    console.error('Error performing action:', error);
    alert('An error occurred while performing the action. Please try again.');
});

    selectedSpell = null;
}

    function fetchPlayerSpells() {
    fetch(`/api/players/${playerId}/spells`)
        .then(response => response.json())
        .then(spells => {
            playerSpells = spells;
            updateSpellSelection();
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




    function getPlayerSprite(playerId, size) {
    if (playerId && playerId.startsWith('AI')) {
    return `<div class="player-sprite" style="width:${size}px;height:${size}px;">
                    <img src="/sprites/enemy_skeleton.png" width="${size}" height="${size}">
                </div>`;
} else {
    const player = players.find(p => p.id === playerId) || currentPlayer;
    return `
            <div class="player-sprite" style="width:${size}px;height:${size}px;">
                <img src="/sprites/${player.subspriteBackground || 'background_1'}.png" class="sprite-layer">
                <img src="/sprites/${player.subspriteFace || 'face_1'}.png" class="sprite-layer">
                <img src="/sprites/${player.subspriteEyes || 'eyes_1'}.png" class="sprite-layer">
                <img src="/sprites/${player.subspriteHairHat || 'hairhat_1'}.png" class="sprite-layer">
            </div>
        `;
}
}

    function updateTurnIndicator(combat) {
    const turnIndicator = document.getElementById('turnIndicator');
    turnIndicator.textContent = `Current Turn: ${combat.currentTurnPlayerId}`;
    turnIndicator.style.color = combat.currentTurnPlayerId === playerId ? '#4caf50' : '#e94560';
}

    function updateCombatInfo(combat) {
    const combatInfo = document.getElementById('combatInfo');
    combatInfo.innerHTML = `
        <p>Combat ID: ${combat.id}</p>
        <p>Current Turn: ${combat.currentTurnPlayerId}</p>
        <p>Turn Number: ${combat.turnNumber}</p>
        <p>Is Active: ${combat.active}</p>
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


    function fetchAndUpdateCombatLog(combatId) {
    fetch(`/api/combat/${combatId}/logs`)
        .then(response => response.json())
        .then(logs => {
            combatLogs = logs;
            updateCombatLogDisplay();
        })
        .catch(error => console.error('Error fetching combat logs:', error));
}

    function updateCombatLogDisplay() {
    const combatLogDiv = document.getElementById('combatLog');
    combatLogDiv.innerHTML = combatLogs.map(log => createCombatLogEntry(log)).join('');
    combatLogDiv.scrollTop = combatLogDiv.scrollHeight;
}

    function createCombatLogEntry(log) {
    let color = log.actorId === playerId ? '#4caf50' :
    log.isNeutral ? '#ffd700' : '#e94560';
    return `
        <div class="combat-log-entry" style="color: ${color}; ${log.actorId === playerId ? 'font-weight: bold;' : ''}">
            [Turn ${log.turnNumber}] ${log.description}
        </div>
    `;
}



    function handleSpellSelection() {
    const spellId = document.getElementById('spellSelect').value;
    selectedSpell = playerSpells.find(spell => spell.id === spellId);
    updateSpellInfo();

    // Keep spell selection visible
    document.getElementById('spellSelection').style.display = 'block';

    // Show target selection after spell is chosen
    updateTargetSelection();
    document.getElementById('targetSelection').style.display = 'block';
}

    function updateSelectionVisibility(combat) {
    const isPlayerTurn = combat.currentTurnPlayerId === playerId;
    const spellSelection = document.getElementById('spellSelection');
    const targetSelection = document.getElementById('targetSelection');

    if (isPlayerTurn) {
    // If it's the player's turn, show action buttons
    document.getElementById('actionButtons').style.display = 'block';

    // If a spell is selected, show both spell and target selection
    if (selectedAction === 'SPELL' && selectedSpell) {
    spellSelection.style.display = 'block';
    targetSelection.style.display = 'block';
} else if (selectedAction === 'SPELL') {
    // If SPELL is selected but no spell chosen yet, only show spell selection
    spellSelection.style.display = 'block';
    targetSelection.style.display = 'none';
} else if (selectedAction) {
    // For other actions, hide spell selection and show target selection
    spellSelection.style.display = 'none';
    targetSelection.style.display = 'block';
} else {
    // If no action is selected yet, hide both
    spellSelection.style.display = 'none';
    targetSelection.style.display = 'none';
}
} else {
    // If it's not the player's turn, hide everything
    document.getElementById('actionButtons').style.display = 'none';
    spellSelection.style.display = 'none';
    targetSelection.style.display = 'none';
}
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



    function showCombatResults(combat) {
    document.getElementById('combatArea').style.display = 'none';
    document.getElementById('combatResults').style.display = 'block';
    const resultsDiv = document.getElementById('combatResults');
    const winner = determineWinner(combat);
    const loser = Object.keys(combat.playerHealth).find(id => id !== winner);

    resultsDiv.innerHTML = `
        <h2>Combat Ended</h2>
        <p>Winner: ${winner}</p>
        <p>Final Health:</p>
        <ul>
            ${Object.entries(combat.playerHealth).map(([id, health]) => `<li>${id}: ${health}</li>`).join('')}
        </ul>
    `;

    if (winner === playerId) {
    fetch(`/api/players/${loser}/inventory`)
    .then(response => response.json())
    .then(inventory => {
    if (inventory.length > 0) {
    const randomItem = inventory[Math.floor(Math.random() * inventory.length)];
    resultsDiv.innerHTML += `
                        <p>You won the duel and took ${randomItem.name} from ${loser}!</p>
                    `;
    transferItem(randomItem.id, loser, winner);
} else {
    resultsDiv.innerHTML += `
                        <p>You won the duel, but ${loser} had no items to take.</p>
                    `;
}
})
    .catch(error => console.error('Error fetching loser inventory:', error));
} else {
    resultsDiv.innerHTML += `
            <p>You lost the duel. The winner may have taken one of your items.</p>
        `;
}

    resultsDiv.innerHTML += `
        <button onclick="returnToWorldMap()">Return to World Map</button>
    `;
}

    function determineWinner(combat) {
    return Object.entries(combat.playerHealth)
    .find(([id, health]) => health > 0)[0];
}

    function transferItem(itemId, fromPlayerId, toPlayerId) {
    fetch('/api/inventory/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            itemId: itemId,
            fromPlayerId: fromPlayerId,
            toPlayerId: toPlayerId
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Item transferred successfully');
            } else {
                console.error('Failed to transfer item:', data.message);
            }
        })
        .catch(error => console.error('Error transferring item:', error));
}

    function returnToWorldMap() {
    document.getElementById('combatResults').style.display = 'none';
    document.getElementById('worldMapContainer').style.display = 'block';
    currentCombatId = null;
    selectedPlayer = null;
    hideDuelButton();
    drawWorldMap();
}

    // Duel functions
    function handlePlayerClick(player) {
    selectedPlayer = player;
    let distance;

    if (isInSubmap) {
    distance = Math.sqrt(
    Math.pow(player.submapCoordinateX - currentPlayer.submapCoordinateX, 2) +
    Math.pow(player.submapCoordinateY - currentPlayer.submapCoordinateY, 2)
    );
} else {
    distance = Math.sqrt(
    Math.pow(player.worldPositionX - currentPlayer.worldPositionX, 2) +
    Math.pow(player.worldPositionY - currentPlayer.worldPositionY, 2)
    );
}

    if (distance <= DUEL_RANGE) {
    showDuelButton();
} else {
    hideDuelButton();
}
}


    function showDuelButton() {
    const duelButton = document.getElementById('duelButton');
    if (!duelButton) {
    const button = document.createElement('button');
    button.id = 'duelButton';
    button.textContent = 'Challenge to Duel';
    button.className = 'btn btn-danger';
    button.style.position = 'absolute';
    button.style.top = '10px';
    button.style.right = '10px';
    button.onclick = sendDuelRequest;
    document.body.appendChild(button);
} else {
    duelButton.style.display = 'block';
}
}

    function hideDuelButton() {
    const duelButton = document.getElementById('duelButton');
    if (duelButton) {
    duelButton.style.display = 'none';
}
}

    function sendDuelRequest() {
    if (!selectedPlayer) return;

    fetch('/api/duel/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
    challengerId: currentPlayer.id,
    targetId: selectedPlayer.id
})
})
    .then(response => response.json())
    .then(data => {
    console.log('Duel request response:', data); // Add this for debugging
    if (data.success) {
    if (data.combatId) {
    // Combat started immediately (NPC)
    console.log('Starting combat with NPC:', data.combatId);
    startCombat(data.combatId);
} else {
    alert(`Duel request sent to ${selectedPlayer.username}`);
}
} else {
    alert(`Failed to send duel request: ${data.message}`);
}
})
    .catch(error => console.error('Error sending duel request:', error));
}




    // Update the updateNearbyPlayersList function to show NPC status


    function handleDuelRequest(challengerId) {
    const challenger = players.find(p => p.id === challengerId);
    if (confirm(`${challenger.username} has challenged you to a duel. Do you accept?`)) {
    acceptDuelRequest(challengerId);
} else {
    rejectDuelRequest(challengerId);
}
}

    //SubMaps:
    function returnToOverworld() {
    fetch(`/api/submaps/${currentSubmap.id}/return/${getCurrentPlayerId()}`, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(updatedPlayer => {
            currentPlayer = {
                id: updatedPlayer.id,
                username: updatedPlayer.username,
                level: updatedPlayer.level,
                experience: updatedPlayer.experience,
                worldPositionX: updatedPlayer.worldPositionX,
                worldPositionY: updatedPlayer.worldPositionY,
                currentSubmapId: null,
                submapCoordinateX: null,
                submapCoordinateY: null,
                submapCoordinateZ: null
                // Add any other relevant properties here
            };
            currentSubmap = null;
            isInSubmap = false;
            drawWorldMap();
            fetchPlayersInViewport();
        })
        .catch(error => console.error('Error returning to overworld:', error));
}

    function movePlayerInSubmap(x, y) {
    x = Math.round(x);
    y = Math.round(y);

    // Ensure the movement is within submap boundaries
    x = Math.max(0, Math.min(currentSubmap.width - 1, x));
    y = Math.max(0, Math.min(currentSubmap.height - 1, y));

    if (x === currentPlayer.submapCoordinateX && y === currentPlayer.submapCoordinateY) {
    return;
}

    currentPlayer.submapCoordinateX = x;
    currentPlayer.submapCoordinateY = y;
    drawSubmap();
}


    function processMovement() {
    if (isKeyboardMovement) {
    processKeyboardMovement();
} else if (movementQueue.length > 0) {
    const nextPosition = movementQueue.shift();
    movePlayer(nextPosition.x, nextPosition.y);
} else {
    stopMovementInterval();
}
}
    function startMovementInterval() {
    if (!moveInterval) {
    moveInterval = setInterval(processMovement, 1000 / 60); // 60 FPS
}
}

    function stopMovementInterval() {
    if (moveInterval) {
    clearInterval(moveInterval);
    moveInterval = null;
    sendPositionToServer(); // Send final position
}
}



    function movePlayer(x, y) {
    if (isInSubmap) {
    movePlayerInSubmap(x, y);
} else {
    updatePlayerPosition(getCurrentPlayerId(), x, y);
}

    checkAndReportPosition();
}

    function checkAndReportPosition() {
    const currentX = isInSubmap ? currentPlayer.submapCoordinateX : getCurrentPlayerX();
    const currentY = isInSubmap ? currentPlayer.submapCoordinateY : getCurrentPlayerY();

    const dx = currentX - lastReportedPosition.x;
    const dy = currentY - lastReportedPosition.y;
    const distanceMoved = Math.sqrt(dx * dx + dy * dy);

    if (distanceMoved >= REPORT_THRESHOLD) {
    sendPositionToServer();
    lastReportedPosition = { x: currentX, y: currentY };
}
}

    function processKeyboardMovement() {
    if (movementVector.x !== 0 || movementVector.y !== 0) {
    const normalizedVector = normalizeVector(movementVector);
    const newX = (isInSubmap ? currentPlayer.submapCoordinateX : getCurrentPlayerX()) + normalizedVector.x * MOVE_SPEED;
    const newY = (isInSubmap ? currentPlayer.submapCoordinateY : getCurrentPlayerY()) + normalizedVector.y * MOVE_SPEED;
    movePlayer(Math.round(newX), Math.round(newY));
}
}

    function drawSubmapElement(element) {
    ctx.fillStyle = element.color || '#CCCCCC';
    ctx.fillRect(element.x, element.y, element.width, element.height);

    if (element.type === 'exit') {
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(element.x + element.width / 2, element.y + element.height / 2, 5, 0, 2 * Math.PI);
    ctx.fill();
}
}
    function drawSubmap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw submap background and elements
    if (currentSubmap && currentSubmap.elements) {
    currentSubmap.elements.forEach(element => drawSubmapElement(element));
}

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#D3D3D3');  // Light gray at the top
    gradient.addColorStop(1, '#696969');  // Dark gray at the bottom

    // Apply gradient background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);



    // Draw other players in the submap
    players.forEach(player => {
    if (player.id !== getCurrentPlayerId()) {
    const x = player.submapCoordinateX - currentPlayer.submapCoordinateX + VIEWPORT_WIDTH / 2;
    const y = player.submapCoordinateY - currentPlayer.submapCoordinateY + VIEWPORT_HEIGHT / 2;
    drawPlayer(x, y, player, false);
}
});

    // Draw current player
    drawPlayer(VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2, currentPlayer, true);

    coordsDisplay.textContent = `Submap: ${currentSubmap ? currentSubmap.title : 'Unknown'} | X: ${currentPlayer.submapCoordinateX}, Y: ${currentPlayer.submapCoordinateY}`;
}

    function loadSubmapData(submapId) {
    fetch(`/api/submaps/${submapId}`)
        .then(response => response.json())
        .then(submapData => {
            currentSubmap = submapData;
            drawSubmap();
            fetchPlayersInSubmap(submapId);
        })
        .catch(error => console.error('Error loading submap data:', error));
}

    function fetchPlayersInSubmap(submapId) {
    fetch(`/api/submaps/${submapId}/players`)
        .then(response => response.json())
        .then(submapPlayers => {
            players = submapPlayers.filter(player => player.id !== getCurrentPlayerId());
            updateNearbyPlayersList();
            drawSubmap();
        })
        .catch(error => console.error('Error fetching players in submap:', error));
}







    function setupWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    socket = new WebSocket(`${protocol}//${host}/ws`);

    socket.onopen = function(event) {
    console.log('WebSocket connection established');
    socket.send(JSON.stringify({ type: 'register', playerId: currentPlayer.id }));
};

    socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    switch(data.type) {
    case 'duelRequest':
    handleDuelRequest(data.challengerId);
    break;
    case 'duelAccepted':
    handleDuelAccepted(data.combatId, data.playerIds);
    break;
    case 'playerMove':
    updatePlayerPosition(data.playerId, data.x, data.y);
    break;
    case 'duelRejected':
    alert(`${data.targetUsername} has rejected your duel request.`);
    break;
    case 'enterSubmap':
    enterSubmap(data.submapId);
    break;
    case 'exitSubmap':
    returnToOverworld();
    break;
}
};

    socket.onclose = function(event) {
    console.log('WebSocket connection closed:', event);
    setTimeout(setupWebSocket, 5000);
};

    socket.onerror = function(error) {
    console.error('WebSocket error:', error);
};
}

    function handleDuelAccepted(combatId, playerIds) {
    console.log('Duel accepted, starting combat:', combatId);
    currentCombatId = combatId;
    document.getElementById('worldMapContainer').style.display = 'none';
    document.getElementById('combatArea').style.display = 'block';

    // Fetch the initial combat state
    fetch(`/api/combat/${combatId}`)
    .then(response => response.json())
    .then(combat => {
    updateCombatUI(combat);
    fetchPlayerSpells();
    pollCombatStatus();
})
    .catch(error => console.error('Error fetching initial combat state:', error));
}

    function acceptDuelRequest(challengerId) {
    fetch('/api/duel/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            challengerId: challengerId,
            targetId: currentPlayer.id
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Duel acceptance sent to server');
                // The server will send a WebSocket message to both players to start the combat
            } else {
                console.error('Failed to accept duel:', data.message);
            }
        })
        .catch(error => console.error('Error accepting duel request:', error));
}

    function rejectDuelRequest(challengerId) {
    fetch('/api/duel/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            challengerId: challengerId,
            targetId: currentPlayer.id
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Duel request rejected');
            } else {
                alert(`Failed to reject duel request: ${data.message}`);
            }
        })
        .catch(error => console.error('Error rejecting duel request:', error));
}

    // WebSocket setup and handling

    // Event listeners
    // canvas.addEventListener('click', (event) => {
    //     const rect = canvas.getBoundingClientRect();
    //     lastClickX = event.clientX - rect.left;
    //     lastClickY = event.clientY - rect.top;
    //
    //     const worldX = currentPlayer.worldPositionX + Math.round(lastClickX - VIEWPORT_WIDTH / 2);
    //     const worldY = currentPlayer.worldPositionY + Math.round(lastClickY - VIEWPORT_HEIGHT / 2);
    //
    //     updatePlayerPosition(currentPlayer, worldX, worldY);
    // });

    // Debounce function

    // Update player position locally


    // Normalize vector to ensure diagonal movement isn't faster
    // Handle keydown events
    document.addEventListener('keydown', (event) => {
        let dx = 0, dy = 0;
        switch (event.key) {
            case 'ArrowUp':
            case 'w':
                dy = -MOVE_SPEED;
                break;
            case 'ArrowDown':
            case 's':
                dy = MOVE_SPEED;
                break;
            case 'ArrowLeft':
            case 'a':
                dx = -MOVE_SPEED;
                break;
            case 'ArrowRight':
            case 'd':
                dx = MOVE_SPEED;
                break;
        }

        if (dx !== 0 || dy !== 0) {
            if (isInSubmap) {
                const newX = Math.max(0, Math.min(currentSubmap.width - 1, currentPlayer.submapCoordinateX + dx));
                const newY = Math.max(0, Math.min(currentSubmap.height - 1, currentPlayer.submapCoordinateY + dy));
                movePlayerInSubmap(Math.round(newX), Math.round(newY));
            } else {
                const newX = currentPlayer.worldPositionX + dx;
                const newY = currentPlayer.worldPositionY + dy;
                updatePlayerPosition(getCurrentPlayerId(), Math.round(newX), Math.round(newY));
            }
        }
    });

    document.addEventListener('keydown', (event) => {
    switch (event.key.toLowerCase()) {
    case 'w': movementVector.y = -1; break;
    case 'a': movementVector.x = -1; break;
    case 's': movementVector.y = 1; break;
    case 'd': movementVector.x = 1; break;
}
    if (!moveInterval) {
    moveInterval = setInterval(updateLocalPosition, MOVE_INTERVAL);
}
    if (!sendInterval) {
    sendInterval = setInterval(sendPositionToServer, SEND_INTERVAL);
}
});

    // Handle keyup events
    document.addEventListener('keyup', (event) => {
    switch (event.key.toLowerCase()) {
    case 'w': case 's': movementVector.y = 0; break;
    case 'a': case 'd': movementVector.x = 0; break;
}
    if (movementVector.x === 0 && movementVector.y === 0) {
    isKeyboardMovement = false;
    if (movementQueue.length === 0) {
    stopMovementInterval();
}
}
});

    // Modify the updatePlayerPosition function
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
    const message = this.value;
    if (message.trim() !== '') {
    // In a real implementation, you would send this message to your server
    addChatMessage(currentPlayer.username, message);
    this.value = '';
}
}
});

    function addChatMessage(username, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('p');
    messageElement.innerHTML = `<strong>${username}:</strong> ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}


    //HELPERS:

    function getCurrentPlayerId() {
    return currentPlayer ? currentPlayer.id : null;
}

    function getCurrentPlayerX() {
    return currentPlayer ? currentPlayer.worldPositionX : 0;
}

    function getCurrentPlayerY() {
    return currentPlayer ? currentPlayer.worldPositionY : 0;
}

    function getCurrentPlayerData() {
    return currentPlayer || null;
}

    function setCurrentPlayerPosition(x, y) {
    if (currentPlayer) {
    currentPlayer.worldPositionX = x;
    currentPlayer.worldPositionY = y;
}
}


    //


    initWorldMap();
    setInterval(fetchPlayersInViewport, 5000);




    //TEMP


//


// Update every 5 seconds