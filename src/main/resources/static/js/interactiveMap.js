
    // World Map variables
    const canvas = document.getElementById('worldMapCanvas');
    const ctx = canvas.getContext('2d');
    const coordsDisplay = document.getElementById('coordinates');
    canvas.addEventListener('click', handleMapClick);
    let worldMap;
    let players = [];
    let currentPlayer;
    const playerSpriteCache = new Map();
    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
    window.location.href = '/';
}

    // Create a cache for item sprites
    const itemSpriteCache = {};

    // Pre-load item sprites
    function preloadItemSprites(items) {
        items.forEach(item => {
            if (!itemSpriteCache[item.item.id]) {
                const sprite = new Image();
                sprite.onload = () => console.log(`Loaded ${item.item.spriteName}`);
                sprite.onerror = () => {
                    console.error(`Failed to load sprite: ${item.item.spriteName}`);
                    sprite.error = true; // Mark this sprite as error
                };
                sprite.src = `/sprites/items/${item.item.spriteName}.png`;
                itemSpriteCache[item.item.id] = sprite;
            }
        });
    }




    const LAND_SIZE = 10000;
    const VIEWPORT_WIDTH = 1240;
    const VIEWPORT_HEIGHT = 720;
    const SPRITE_SIZE = 64;
    let mp3Player;
    document.addEventListener('DOMContentLoaded', function() {
        mp3Player = new MP3Player('audio-player-container');
        mp3Player.loadTrack('/audio/world2.mp3');
        mp3Player.audio.loop = true;
        mp3Player.togglePlayPause();
    });

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
    fetch('/api/world-map/submap-entrances'),
    fetchMapItemsInViewport()
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
    subspriteBackground: playerData.player.subspriteBackground,
    subspriteFace:playerData.player.subspriteFace,
    subspriteEyes:playerData.player.subspriteEyes,
    subspriteHairHat:playerData.player.subspriteHairHat
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

    // Add this function at the top of your script
    function throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        }
    }

    // Throttle the drawWorldMap function
    const throttledDrawWorldMap = throttle(drawWorldMap, 1000 / 240); //60fps



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
    const MOVE_SPEED = 1; // pixels per frame
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

    let mapItems = [];

    function fetchMapItemsInViewport() {
        const centerX = getCurrentPlayerX();
        const centerY = getCurrentPlayerY();

        fetch(`/api/world-map/items?centerX=${centerX}&centerY=${centerY}&viewportWidth=${VIEWPORT_WIDTH}&viewportHeight=${VIEWPORT_HEIGHT}`)
            .then(response => response.json())
            .then(data => {
                mapItems = data;
                preloadItemSprites(mapItems); // Pre-load sprites for new items
                if (isInSubmap) {
                    drawSubmap();
                } else {
                    drawWorldMap();
                }
            })
            .catch(error => console.error('Error fetching map items:', error));
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

    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');

    // Set dimensions
    offscreenCanvas.width = VIEWPORT_WIDTH;
    offscreenCanvas.height = VIEWPORT_HEIGHT;
    function drawWorldMap() {
        if (currentCombatId){
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);


        const startX = Math.floor(currentPlayer.worldPositionX / LAND_SIZE) * LAND_SIZE;
        const startY = Math.floor(currentPlayer.worldPositionY / LAND_SIZE) * LAND_SIZE;

        for (let y = -LAND_SIZE; y <= VIEWPORT_HEIGHT + LAND_SIZE; y += LAND_SIZE) {
            for (let x = -LAND_SIZE; x <= VIEWPORT_WIDTH + LAND_SIZE; x += LAND_SIZE) {
                const worldX = startX + x;
                const worldY = startY + y;

                const offsetX = Math.round(x - (currentPlayer.worldPositionX % LAND_SIZE) + VIEWPORT_WIDTH / 2);
                const offsetY = Math.round(y - (currentPlayer.worldPositionY % LAND_SIZE) + VIEWPORT_HEIGHT / 2);

                offscreenCtx.fillStyle = getTileColor(Math.floor(worldX / LAND_SIZE), Math.floor(worldY / LAND_SIZE));
                offscreenCtx.fillRect(offsetX, offsetY, LAND_SIZE, LAND_SIZE);

                offscreenCtx.strokeStyle = 'rgba(255,255,255,0.2)';
                offscreenCtx.strokeRect(offsetX, offsetY, LAND_SIZE, LAND_SIZE);
            }
        }

        for (const player of players) {
            if (player.id !== currentPlayer.id && !currentPlayer.currentSubmapId) {
                const x = Math.round(player.worldPositionX - currentPlayer.worldPositionX + VIEWPORT_WIDTH / 2);
                const y = Math.round(player.worldPositionY - currentPlayer.worldPositionY + VIEWPORT_HEIGHT / 2);

                if (x >= -SPRITE_SIZE/2 && x < VIEWPORT_WIDTH + SPRITE_SIZE/2 &&
                    y >= -SPRITE_SIZE/2 && y < VIEWPORT_HEIGHT + SPRITE_SIZE/2) {
                    drawPlayer(x, y, player, false);
                }
            }
        }

        mapItems.forEach(item => {
            console.log(item)
            const x = item.worldMapCoordinateX - currentPlayer.worldPositionX + VIEWPORT_WIDTH / 2;
            const y = item.worldMapCoordinateY - currentPlayer.worldPositionY + VIEWPORT_HEIGHT / 2;
            drawMapItem(x, y, item, offscreenCtx);
        });

        submapEntrances.forEach(entrance => {
            const x = entrance.x - currentPlayer.worldPositionX + VIEWPORT_WIDTH / 2;
            const y = entrance.y - currentPlayer.worldPositionY + VIEWPORT_HEIGHT / 2;
            offscreenCtx.fillStyle = '#FF00FF'; // Magenta color for visibility
            offscreenCtx.fillRect(x - 5, y - 5, 10, 10);
        });

        encampments.forEach(encampment => {
            const x = encampment.worldPositionX - currentPlayer.worldPositionX + VIEWPORT_WIDTH / 2;
            const y = encampment.worldPositionY - currentPlayer.worldPositionY + VIEWPORT_HEIGHT / 2;
            drawEncampment(x, y, encampment);
        });


        drawPlayer(VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2, currentPlayer, true);

        coordsDisplay.textContent = `X: ${currentPlayer.worldPositionX}, Y: ${currentPlayer.worldPositionY}`;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(offscreenCanvas, 0, 0);
    }
    function getTileColor(x, y) {
    // In a real implementation, you would fetch the actual terrain type for these coordinates
    const terrainType = ['PLAINS', 'FOREST', 'MOUNTAIN', 'WATER', 'DESERT'][Math.floor(Math.random() * 5)];
    return terrainColors['PLAINS'];
}
    function drawMapItem(x, y, item, ctxToDraw) {
        const spriteSize = 32; // Adjust this size as needed
        const sprite = itemSpriteCache[item.item.id];

        if (sprite && sprite.complete && !sprite.error) {
            // Sprite is loaded and has no errors, draw it
            ctxToDraw.drawImage(sprite, x - spriteSize / 2, y - spriteSize / 2, spriteSize, spriteSize);
        } else {
            // Sprite is not loaded or has errors, draw fallback
            ctxToDraw.fillStyle = 'yellow';
            ctxToDraw.beginPath();
            ctxToDraw.arc(x, y, 5, 0, 2 * Math.PI);
            ctxToDraw.fill();
        }

        // Draw item name with color based on rarity
        const rarityColor = getRarityColor(item.item.rarity);
        ctxToDraw.fillStyle = rarityColor;
        ctxToDraw.font = 'bold 12px Arial';
        ctxToDraw.textAlign = 'center';
        ctxToDraw.fillText(item.item.name, x, y + spriteSize / 2 + 15);
    }

    function getRarityColor(rarity) {
        switch (rarity) {
            case 'JUNK': return '#7F7F7F';
            case 'COMMON': return '#FFFFFF';
            case 'UNCOMMON': return '#1EFF00';
            case 'RARE': return '#0070DD';
            case 'EPIC': return '#A335EE';
            case 'LEGENDARY': return '#FF8000';
            case 'SUPERLATIVE': return '#00FFFF';
            default: return '#FFFFFF';
        }
    }
    function getItemSprite(itemId) {
        const sprite = new Image();
        sprite.src = `/sprites/items/${itemId}.png`;
        return sprite;
    }

    // Function to create and cache player sprite
    async function createPlayerSprite(player) {
        const cacheKey = `${player.id}-${player.subspriteBackground}-${player.subspriteFace}-${player.subspriteEyes}-${player.subspriteHairHat}`;

        if (playerSpriteCache.has(cacheKey)) {
            return playerSpriteCache.get(cacheKey);
        }

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = SPRITE_SIZE;
        offscreenCanvas.height = SPRITE_SIZE;
        const offscreenCtx = offscreenCanvas.getContext('2d');

        const layers = [
            player.subspriteBackground || 'background_1',
            player.subspriteFace || 'face_1',
            player.subspriteEyes || 'eyes_1',
            player.subspriteHairHat || 'hairhat_1'
        ];

        try {
            for (const layer of layers) {
                const sprite = await loadSprite(layer);
                offscreenCtx.drawImage(sprite, 0, 0, SPRITE_SIZE, SPRITE_SIZE);
            }
            playerSpriteCache.set(cacheKey, offscreenCanvas);
            return offscreenCanvas;
        } catch (error) {
            console.error('Error creating player sprite:', error);
            return null;
        }
    }

    // Updated drawPlayer function
    async function drawPlayer(x, y, player, isCurrentPlayer) {
        let playerSprite = await createPlayerSprite(player);

        if (playerSprite) {
            ctx.drawImage(playerSprite, x - SPRITE_SIZE / 2, y - SPRITE_SIZE / 2, SPRITE_SIZE, SPRITE_SIZE);
        } else {
            // Fallback if sprite creation failed
            ctx.fillStyle = isCurrentPlayer ? '#e74c3c' : '#3498db';
            ctx.beginPath();
            ctx.arc(x, y, SPRITE_SIZE / 2, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Draw player name
        ctx.fillStyle = isCurrentPlayer ? '#e74c3c' : '#3498db';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.username, x, y + SPRITE_SIZE / 2 + 15);
    }

    // You might want to add a function to clear the cache when necessary
    function clearPlayerSpriteCache() {
        playerSpriteCache.clear();
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
    let c = 0;
    players.forEach(player => {
    if (player.id !== currentPlayer.id) {
        if(c < 10) {
            const li = document.createElement('li');
            li.textContent = `${player.username} (Level ${player.level})${player.npc ? ' [NPC]' : ''}`;
            nearbyPlayersList.appendChild(li);
        }
        c++;

}
});
        const li2 = document.createElement('li');
        li2.textContent = `+ ${c - 10} more`;
        nearbyPlayersList.appendChild(li2);
}
    const MOVE_INTERVAL = 1000 / 60; // 60 FPS
    const SEND_INTERVAL = 200; // Send position to server every 200ms

    let sendInterval;
    let accumulatedMovement = { x: 0, y: 0 };


    const INTERPOLATION_DURATION = 200; // milliseconds
    let interpolationData = {};

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
        } else {
            const player = players.find(p => p.id === playerIdOfPlayerToUpdate);
            if (player) {
                player.worldPositionX = x;
                player.worldPositionY = y;
            } else {
                console.log('Player not found in viewport:', playerIdOfPlayerToUpdate);
                fetchPlayersInViewport();
            }
        }

    //    throttledDrawWorldMap();
        drawWorldMap();
    }

    function startInterpolation(player, targetX, targetY) {
        const startX = player.worldPositionX;
        const startY = player.worldPositionY;
        const startTime = Date.now();

        interpolationData[player.id] = {
            startX,
            startY,
            targetX,
            targetY,
            startTime
        };

        // Ensure the interpolation loop is running
        if (!interpolationLoop) {
            interpolationLoop = requestAnimationFrame(interpolateMovements);
        }
    }

    let interpolationLoop;

    function interpolateMovements() {
        const currentTime = Date.now();
        let needsRedraw = false;

        for (const playerId in interpolationData) {
            const data = interpolationData[playerId];
            const player = players.find(p => p.id === playerId);

            if (!player) continue;

            const progress = Math.min((currentTime - data.startTime) / INTERPOLATION_DURATION, 1);

            player.worldPositionX = Math.round(data.startX + (data.targetX - data.startX) * progress);
            player.worldPositionY = Math.round(data.startY + (data.targetY - data.startY) * progress);

            if (progress === 1) {
                delete interpolationData[playerId];
            }

            needsRedraw = true;
        }

        if (needsRedraw) {
         //   throttledDrawWorldMap();
            drawWorldMap();
        }

        if (Object.keys(interpolationData).length > 0) {
            interpolationLoop = requestAnimationFrame(interpolateMovements);
        } else {
            interpolationLoop = null;
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
    mp3Player.loadTrack('/audio/battle.mp3');
    mp3Player.togglePlayPause();
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
            fetchPlayerSpecialAttacks();
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


    function updatePlayerCards(combat, currentPlayerId) {
        const playerCardsContainer = document.getElementById('playerCards');
        playerCardsContainer.innerHTML = '';
        const playerCount = combat.playerIds.length;
        const spriteSize = playerCount < 5 ? 128 : 64;

        // Determine the current player's team
        const currentPlayerTeam = combat.playerTeams[currentPlayerId];

        // Separate players into teams
        const teams = {
            allied: [],
            enemy: []
        };

        combat.playerIds.forEach(id => {
            if (combat.playerTeams[id] === currentPlayerTeam) {
                teams.allied.push(id);
            } else {
                teams.enemy.push(id);
            }
        });

        // Function to create a player card
        const createPlayerCard = (id) => {
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
            return playerCard;
        };

        // Create and append allied team cards
        const alliedTeamContainer = document.createElement('div');
        alliedTeamContainer.className = 'row allied-team';
        teams.allied.forEach(id => {
            alliedTeamContainer.appendChild(createPlayerCard(id));
        });
        playerCardsContainer.appendChild(alliedTeamContainer);

        // Create and append enemy team cards
        const enemyTeamContainer = document.createElement('div');
        enemyTeamContainer.className = 'row enemy-team';
        teams.enemy.forEach(id => {
            enemyTeamContainer.appendChild(createPlayerCard(id));
        });
        playerCardsContainer.appendChild(enemyTeamContainer);
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
        const specialAttackSelection = document.getElementById('specialAttackSelection');
        const targetSelection = document.getElementById('targetSelection');

        spellSelection.style.display = 'none';
        specialAttackSelection.style.display = 'none';
        targetSelection.style.display = 'none';

        if (actionType === 'SPELL') {
            spellSelection.style.display = 'block';
            updateSpellSelection();
        } else if (actionType === 'SPECIAL_ATTACK') {
            specialAttackSelection.style.display = 'block';
            updateSpecialAttackSelection();
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
        } else if (selectedAction === 'SPECIAL_ATTACK') {
            if (!selectedSpecialAttack) {
                alert('Please select a special attack.');
                return;
            }
            actionData.specialAttackId = selectedSpecialAttack.specialAttackId;
            if(selectedSpecialAttack.id) {
                actionData.id = selectedSpecialAttack.id;
            }
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
                document.getElementById('specialAttackSelection').style.display = 'none';
                document.getElementById('targetSelection').style.display = 'none';
                fetchStatusEffects(currentCombatId);
                if (!updatedCombat.active) {
                    showCombatResults(updatedCombat);
                }
            })
            .catch(error => {
                console.error('Error performing action:', error);
                alert('An error occurred while performing the action. Please try again.');
            });

        selectedSpell = null;
        selectedSpecialAttack = null;
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



    // We should also update the handleSpellSelection function to show the target selection
    function handleSpellSelection(spellId) {
        selectedSpell = playerSpells.find(spell => spell.id === spellId);
        updateSpellInfo();

        // Update visual selection
        document.querySelectorAll('.spell-icon').forEach(icon => {
            icon.classList.toggle('selected', icon.dataset.spellId === spellId);
        });

        // Show target selection after spell is chosen
        updateTargetSelection();
        document.getElementById('targetSelection').style.display = 'block';
    }


    function updateSelectionVisibility(combat) {
        const isPlayerTurn = combat.currentTurnPlayerId === playerId;
        const spellSelection = document.getElementById('spellSelection');
        const spellSelectionBar = document.getElementById('spellSelectionBar');
        const spellInfoContainer = document.getElementById('spellInfoContainer');
        const targetSelection = document.getElementById('targetSelection');

        if (isPlayerTurn) {
            document.getElementById('actionButtons').style.display = 'block';

            if (selectedAction === 'SPELL') {
                spellSelection.style.display = 'block';
                spellSelectionBar.style.display = 'flex';
                spellInfoContainer.style.display = 'block';
                if (selectedSpell) {
                    targetSelection.style.display = 'block';
                } else {
                    targetSelection.style.display = 'none';
                }
            } else if (selectedAction) {
                spellSelection.style.display = 'none';
                targetSelection.style.display = 'block';
            } else {
                spellSelection.style.display = 'none';
                targetSelection.style.display = 'none';
            }
        } else {
            document.getElementById('actionButtons').style.display = 'none';
            spellSelection.style.display = 'none';
            targetSelection.style.display = 'none';
        }
    }


    function updateSpellSelection() {
        const spellSelectionBar = document.getElementById('spellSelectionBar');
        spellSelectionBar.innerHTML = '';

        playerSpells.forEach(spell => {
            const spellIcon = document.createElement('img');
            spellIcon.src = `/sprites/spells/${spell.spellSpritePath}.png`;
            spellIcon.alt = spell.name;
            spellIcon.className = 'spell-icon';
            spellIcon.dataset.spellId = spell.id;
            spellIcon.addEventListener('click', () => handleSpellSelection(spell.id));
            spellSelectionBar.appendChild(spellIcon);
        });

        if (playerSpells.length > 0) {
            handleSpellSelection(playerSpells[0].id);
        }
    }


    function updateSpellInfo() {
        if (selectedSpell) {
            document.getElementById('spellInfoName').textContent = selectedSpell.name;
            document.getElementById('spellInfoDescription').textContent = selectedSpell.description;
            document.getElementById('spellInfoManaCost').textContent = `Mana Cost: ${selectedSpell.manaCost}`;
            document.getElementById('spellInfoCooldown').textContent = `Cooldown: ${selectedSpell.cooldown} turns`;

            const spriteImg = document.getElementById('spellSprite');
            spriteImg.src = `/sprites/spells/${selectedSpell.spellSpritePath}.png`;
            spriteImg.alt = `${selectedSpell.name} Sprite`;
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
        mp3Player.audio.loop = false;
        mp3Player.loadTrack('/audio/win.mp3');
        mp3Player.audio.play();
    fetch(`/api/players/${loser}/inventory`)
    .then(response => response.json())
    .then(inventory => {
    if (inventory.length > 0) {
    const randomItem = inventory[Math.floor(Math.random() * inventory.length)];
    resultsDiv.innerHTML += `
                        <p>You won the duel and took ${randomItem.name} from  ${loser} has fallen!</p>
                    `;
    //transferItem(randomItem.id, loser, winner);
} else {
    resultsDiv.innerHTML += `
                        <p>You won the duel, ${loser} has fallen</p>
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
        mp3Player.audio.loop = true;
        mp3Player.loadTrack('/audio/world2.mp3');
        mp3Player.audio.play();
    document.getElementById('combatResults').style.display = 'none';
    document.getElementById('worldMapContainer').style.display = 'flex';
    currentCombatId = null;
    selectedPlayer = null;
    hideDuelButton();
    drawWorldMap();
}

    // Duel functions
    function handlePlayerClick(player) {
    selectedPlayer = player;
    updateTargetedPlayerInfo(player);
    let distance;

//     if (isInSubmap) {
//     distance = Math.sqrt(
//     Math.pow(player.submapCoordinateX - currentPlayer.submapCoordinateX, 2) +
//     Math.pow(player.submapCoordinateY - currentPlayer.submapCoordinateY, 2)
//     );
// } else {
//     distance = Math.sqrt(
//     Math.pow(player.worldPositionX - currentPlayer.worldPositionX, 2) +
//     Math.pow(player.worldPositionY - currentPlayer.worldPositionY, 2)
//     );
// }
//
//     if (distance <= DUEL_RANGE) {
//     showDuelButton();
// } else {
//     hideDuelButton();
// }
}

    function updateTargetedPlayerInfo(player) {
        const targetedPlayerInfo = document.getElementById('targeted-player-info');
        const duelButton = document.getElementById('duelButton');

        if (player) {
            document.getElementById('targeted-player-name').textContent = player.username || 'Unknown';
            document.getElementById('targeted-player-level').textContent = player.level || 'N/A';
            const position = isInSubmap
                ? `SubX: ${player.submapCoordinateX}, SubY: ${player.submapCoordinateY}`
                : `X: ${player.worldPositionX}, Y: ${player.worldPositionY}`;
            document.getElementById('targeted-player-position').textContent = position;
            targetedPlayerInfo.style.display = 'block';

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

            duelButton.style.display = distance <= DUEL_RANGE ? 'block' : 'none';
        } else {
            targetedPlayerInfo.style.display = 'none';
            duelButton.style.display = 'none';
        }
    }
    document.getElementById('duelButton').addEventListener('click', sendDuelRequest);

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



    const debouncedWsTransmitPosition = debounce(wsTransmitPosition, 100);

    function movePlayer(x, y) {
        if (isInSubmap) {
            movePlayerInSubmap(x, y);
        } else {
            updatePlayerPosition(getCurrentPlayerId(), x, y);
        }
        throttledWsTransmitPosition();
    }

    const throttledWsTransmitPosition = throttle(wsTransmitPosition, 200);

    function checkAndReportPosition() {
        const currentX = isInSubmap ? currentPlayer.submapCoordinateX : getCurrentPlayerX();
        const currentY = isInSubmap ? currentPlayer.submapCoordinateY : getCurrentPlayerY();

        const dx = currentX - lastReportedPosition.x;
        const dy = currentY - lastReportedPosition.y;
        const distanceMoved = Math.sqrt(dx * dx + dy * dy);

        if (distanceMoved >= REPORT_THRESHOLD) {
            debouncedWsTransmitPosition();
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
        console.error('Received WebSocket message:', data);
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



//ITEM PICKUP
    function attemptItemPickup() {
        const playerX = isInSubmap ? currentPlayer.submapCoordinateX : currentPlayer.worldPositionX;
        const playerY = isInSubmap ? currentPlayer.submapCoordinateY : currentPlayer.worldPositionY;
        const pickupRadius = 50; // Adjust this value as needed

        const nearbyItems = mapItems.filter(item => {
            const itemX = isInSubmap ? item.submapCoordinateX : item.worldMapCoordinateX;
            const itemY = isInSubmap ? item.submapCoordinateY : item.worldMapCoordinateY;
            const distance = Math.sqrt(Math.pow(itemX - playerX, 2) + Math.pow(itemY - playerY, 2));
            return distance <= pickupRadius;
        });

        if (nearbyItems.length > 0) {
            // If multiple items are nearby, pick up the first one
            pickUpItem(nearbyItems[0]);
         //   initializeInventory();
        } else {
            console.log("No items nearby to pick up.");
        }
    }

    function pickUpItem(item) {
        fetch(`/api/world-map/items/${item.id}/pickup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                playerId: currentPlayer.id
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log(`Picked up ${item.item.name}`);
                    // Remove the item from the map
                    mapItems = mapItems.filter(i => i.id !== item.id);
                    // Redraw the map
                    PlayerInventory.init();
                    if (isInSubmap) {
                        drawSubmap();
                    } else {
                        drawWorldMap();
                    }
                    // You might want to update the player's inventory here

                } else {
                    console.log(`Failed to pick up item: ${data.message}`);
                }
            })
            .catch(error => console.error('Error picking up item:', error));
    }


    const PlayerInventory = {
        addItem: function(item, quantity) {
            window.parent.postMessage({ action: 'addItem', data: { item, quantity } }, '*');
        },
        removeItem: function(itemId, quantity) {
            window.parent.postMessage({ action: 'removeItem', data: { itemId, quantity } }, '*');
        },
        init: function (){
            console.log("Sending Inventory Init Method To Main Window")
            window.parent.postMessage({action:'init', data: { }},'*');
        }
        // Add other proxy functions as needed
    };


    // Add this event listener to handle item pickup
    document.addEventListener('keydown', (event) => {
        if (event.key === 'e' || event.key === 'E') {
            attemptItemPickup();
        }
    });


//WEBSOCKET TRANSMIT

    function wsTransmitPosition() {
        console.log(socket.readyState);
        console.log(Date.now())
        if (socket.readyState === WebSocket.OPEN) {
            const message = {
                type: 'playerMove',
                playerId: getCurrentPlayerId(),
                x: Math.round(currentPlayer.worldPositionX),
                y: Math.round(currentPlayer.worldPositionY)
            };
            socket.send(JSON.stringify(message));
        }
    }

    //


    initWorldMap();
    setInterval(fetchPlayersInViewport, 3000);
    setInterval(fetchMapItemsInViewport, 3000);



    //TEMP
//SPECIAL ATTACKS:

    let playerSpecialAttacks = [];
    let selectedSpecialAttack = null;

    function fetchPlayerSpecialAttacks() {
        fetch(`/api/special-attacks/player/${playerId}`)
            .then(response => response.json())
            .then(specialAttacks => {
                playerSpecialAttacks = specialAttacks;
                updateSpecialAttackSelection();
                preloadSpecialAttackIcons(); // Preload icons after fetching
            })
            .catch(error => console.error('Error fetching player special attacks:', error));
    }
    function updateSpecialAttackSelection() {
        const specialAttackSelectionBar = document.getElementById('specialAttackSelectionBar');
        specialAttackSelectionBar.innerHTML = '';

        playerSpecialAttacks.forEach(specialAttack => {
            const specialAttackIcon = document.createElement('img');
            specialAttackIcon.src = `/sprites/special-attacks/${specialAttack.specialAttackSpritePath}.png`;
            specialAttackIcon.alt = specialAttack.name;
            specialAttackIcon.className = 'special-attack-icon';
            specialAttackIcon.dataset.specialAttackId = specialAttack.id;
            specialAttackIcon.addEventListener('click', () => handleSpecialAttackSelection(specialAttack.id));

            // Add error handling for image loading
            specialAttackIcon.onerror = function() {
                this.onerror = null; // Prevent infinite loop if fallback image also fails
                this.src = '/sprites/special-attacks/default-special-attack.png'; // Path to a default icon
                console.warn(`Failed to load special attack icon for ${specialAttack.name}`);
            };

            specialAttackSelectionBar.appendChild(specialAttackIcon);
        });

        if (playerSpecialAttacks.length > 0) {
            handleSpecialAttackSelection(playerSpecialAttacks[0].id);
        }
    }

    function preloadSpecialAttackIcons() {
        playerSpecialAttacks.forEach(specialAttack => {
            const img = new Image();
            img.src = `/sprites/special-attacks/${specialAttack.specialAttackSpritePath}.png`;
        });
    }


    function handleSpecialAttackSelection(specialAttackId) {
        selectedSpecialAttack = playerSpecialAttacks.find(sa => sa.id === specialAttackId);
        updateSpecialAttackInfo();

        // Update visual selection
        document.querySelectorAll('.special-attack-icon').forEach(icon => {
            icon.classList.toggle('selected', icon.dataset.specialAttackId === specialAttackId);
        });

        // Show target selection after special attack is chosen
        updateTargetSelection();
        document.getElementById('targetSelection').style.display = 'block';
    }

    function updateSpecialAttackInfo() {
        if (selectedSpecialAttack) {
            document.getElementById('specialAttackInfoName').textContent = selectedSpecialAttack.name;
            document.getElementById('specialAttackInfoDescription').textContent = selectedSpecialAttack.description;
            document.getElementById('specialAttackInfoCooldown').textContent = `Cooldown: ${selectedSpecialAttack.cooldown} turns`;
            document.getElementById('specialAttackInfoAttackQuantity').textContent = `Attacks: ${selectedSpecialAttack.attackQuantity}`;

            const spriteImg = document.getElementById('specialAttackSprite');
            spriteImg.src = `/sprites/special-attacks/${selectedSpecialAttack.specialAttackSpritePath}.png`;
            spriteImg.alt = `${selectedSpecialAttack.name} Sprite`;
        }
    }
    ///f





//

    function drawEncampment(x, y, encampment) {
        const sprite = encampmentSprites[encampment.sprite];
        if (sprite) {
            ctx.drawImage(sprite, x - sprite.width / 2, y - sprite.height / 2);
        } else {
            // Fallback if sprite is not loaded
            ctx.fillStyle = '#800000';
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Draw encampment name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(encampment.name, x, y + 20);
    }

    // Make sure to load encampment sprites
    const encampmentSprites = {};
    function loadEncampmentSprites() {
        const spriteNames = ['encampment_sprite']; // Add all your encampment sprite names here
        spriteNames.forEach(name => {
            const img = new Image();
            img.onload = () => console.log(`Loaded ${name}`);
            img.onerror = () => console.error(`Failed to load sprite: ${name}`);
            img.src = `/sprites/encampments/${name}.png`;
            encampmentSprites[name] = img;
        });
    }

    let encampments = [];

    function fetchEncampmentsInViewport() {
        const centerX = getCurrentPlayerX();
        const centerY = getCurrentPlayerY();

        fetch(`/api/npc-encampments/viewport?centerX=${centerX}&centerY=${centerY}&viewportWidth=${VIEWPORT_WIDTH}&viewportHeight=${VIEWPORT_HEIGHT}`)
            .then(response => response.json())
            .then(data => {
                encampments = data;
                drawWorldMap(); // Redraw the map to show the encampments
            })
            .catch(error => console.error('Error fetching encampments:', error));
    }

    // Call this function periodically or when the player moves significantly
    setInterval(fetchEncampmentsInViewport, 30000); // Fetch every 5 seconds, for example

    loadEncampmentSprites();

// Update every 5 seconds