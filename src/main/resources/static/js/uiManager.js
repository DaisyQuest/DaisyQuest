class UIManager {
    updateCombatInfo(combat) {
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

     updateSpellCooldowns(combat) {
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

     updateActionButtons(combat) {
        const isPlayerTurn = combat.currentTurnPlayerId === playerId;
        const actionButtons = document.querySelectorAll('.action-button');
        actionButtons.forEach(button => button.disabled = !isPlayerTurn);
        document.getElementById('actionButtons').style.display = isPlayerTurn ? 'block' : 'none';
    }
     updateSelectionVisibility(combat) {
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

    updatePlayerInfoUI(player) {
        const playerInfo = document.getElementById('playerInfo');
        playerInfo.innerHTML = `
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
                <h6>Currencies:</h6>
                <ul class="list-group">
                    ${Object.entries(player.currencies || {}).map(([key, value]) =>
            `<li class="list-group-item">${key}: ${value}</li>`
        ).join('')}
                </ul>
            `;
    }


     createAttributeTabs(taskType) {
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
    createTaskList(tasks, taskType) {
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

    updateInventoryUI(inventory) {
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
    }

    updateShopListUI(shops) {
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
    }

    updatePlayerShopUI(shop) {
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
    }
}

window.UIManager = new UIManager();