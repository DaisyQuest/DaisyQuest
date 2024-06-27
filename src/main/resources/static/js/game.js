let playerId;
let attributes = []; // Will store the list of attributes

document.addEventListener('DOMContentLoaded', () => {
    playerId = localStorage.getItem('playerId');
    if (!playerId) {
        window.location.href = '/';
    } else {
        updatePlayerInfo();
        fetchAttributes().then(() => {
            updateQuestList();
            updateActivityList();
            updateShopList();
            updatePlayerShop(); // New function call
        });
        updateInventory();
    }
});

function fetchAttributes() {
    return fetch(`/api/players/${playerId}/attributes`)
        .then(response => response.json())
        .then(data => {
            attributes = data;
            createAttributeTabs('quest');
            createAttributeTabs('activity');
        });
}

function createAttributeTabs(taskType) {
    const tabList = document.getElementById(`${taskType}AttributeTabs`);
    const tabContent = document.getElementById(`${taskType}AttributeTabContent`);

    attributes.forEach((attr, index) => {
        // Create tab
        const tab = document.createElement('li');
        tab.className = 'nav-item';
        tab.innerHTML = `
            <button class="nav-link ${index === 0 ? 'active' : ''}" id="${taskType}-${attr}-tab" data-bs-toggle="tab" 
                    data-bs-target="#${taskType}-${attr}" type="button" role="tab" 
                    aria-controls="${taskType}-${attr}" aria-selected="${index === 0}">${attr}</button>
        `;
        tabList.appendChild(tab);

        // Create tab content
        const content = document.createElement('div');
        content.className = `tab-pane fade ${index === 0 ? 'show active' : ''}`;
        content.id = `${taskType}-${attr}`;
        content.setAttribute('role', 'tabpanel');
        content.setAttribute('aria-labelledby', `${taskType}-${attr}-tab`);
        tabContent.appendChild(content);
    });
}

function updatePlayerInfo() {
    fetch(`/api/players/${playerId}`)
        .then(response => response.json())
        .then(player => {
            const playerInfo = document.getElementById('playerInfo');
            playerInfo.innerHTML = `
                <h6>Player: ${player.username}</h6>
                <p>Level: ${player.level}</p>
                <p>Total Experience: ${player.totalExperience}</p>
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
            startQuestTimer(quest.duration, questId);
        });
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