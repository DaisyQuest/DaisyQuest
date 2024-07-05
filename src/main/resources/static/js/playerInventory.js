
let playerInventory = null;
let selectedItem = null;

const EQUIPMENT_SLOTS = [
    ['HEAD'],
    ['LEFT_SHOULDER', 'NECK', 'RIGHT_SHOULDER', 'AMMO'],
    ['LEFT_WRIST', 'CHEST', 'RIGHT_WRIST'],
    ['LEFT_HAND', 'LEFT_GLOVE', 'RIGHT_GLOVE', 'RIGHT_HAND'],
    ['LEFT_FINGER_1', 'LEFT_FINGER_2', 'WAIST', 'RIGHT_FINGER_1', 'RIGHT_FINGER_2'],
    ['LEGS'],
    ['FEET']
];

function initializeInventory() {
    fetchPlayerInventory();
}

function fetchPlayerInventory() {
    fetch(`/api/inventory/${playerId}`)
        .then(response => response.json())
        .then(data => {
            playerInventory = data;
            renderInventory();
            renderEquipment();
        })
        .catch(error => console.error('Error fetching inventory:', error));
}

function renderInventory() {
    const container = document.getElementById('inventoryContainer');
    container.innerHTML = '';

    for (let i = 0; i < playerInventory.maxInventorySize; i++) {
        const slot = playerInventory.inventorySlots[i] || { slotIndex: i };
        const slotElement = document.createElement('div');
        slotElement.className = 'inventory-slot';
        slotElement.setAttribute('data-slot-index', i);

        if (slot.item) {
            slotElement.innerHTML = `
                <div class="item-container${slot.item.equippable ? ' equippable' : ''}">
                    <img src="/sprites/items/${slot.item.id}.svg" alt="${slot.item.name}" 
                         class="item-sprite" data-item-id="${slot.item.id}">
                    <span class="item-quantity">${slot.quantity}</span>
                    ${slot.item.equippable ? '<span class="equippable-indicator">E</span>' : ''}
                </div>
            `;
            slotElement.addEventListener('click', () => selectItem(slot.item));
            if (slot.item.equippable) {
                slotElement.setAttribute('draggable', 'true');
                slotElement.addEventListener('dragstart', drag);
            }
        } else {
            slotElement.innerHTML = '<div class="empty-slot"></div>';
        }

        slotElement.addEventListener('dragover', allowDrop);
        slotElement.addEventListener('drop', drop);
        container.appendChild(slotElement);
    }
}


function renderEquipment() {
    const container = document.getElementById('equipmentContainer');
    container.innerHTML = '';

    EQUIPMENT_SLOTS.forEach(tier => {
        const tierElement = document.createElement('div');
        tierElement.className = 'equipment-tier';

        tier.forEach(slotType => {
            const slotElement = document.createElement('div');
            slotElement.className = 'equipment-slot';
            slotElement.setAttribute('data-slot-type', slotType);

            const equippedItem = playerInventory.equipmentSlots.find(slot => slot.type === slotType);
            if (equippedItem && equippedItem.item) {
                slotElement.innerHTML = `
                    <div class="item-container">
                        <img src="/sprites/items/${equippedItem.item.id}.svg" alt="${equippedItem.item.name}" 
                             class="item-sprite" data-item-id="${equippedItem.item.id}">
                        ${equippedItem.item.equippableInStacks ? `<span class="item-quantity">${equippedItem.quantity}</span>` : ''}
                    </div>
                `;
                slotElement.addEventListener('click', () => selectItem(equippedItem.item));
                slotElement.setAttribute('draggable', 'true');
                slotElement.addEventListener('dragstart', drag);
            } else {
                slotElement.innerHTML = `
                    <div class="empty-slot">
                        <img src="/sprites/slots/${slotType.toLowerCase()}.svg" alt="${slotType}">
                    </div>
                `;
            }

            slotElement.addEventListener('dragover', allowDrop);
            slotElement.addEventListener('drop', dropEquip);
            tierElement.appendChild(slotElement);
        });

        container.appendChild(tierElement);
    });
}


function selectItem(item) {
    selectedItem = item;
    renderSelectedItemInfo();
}


function renderSelectedItemInfo() {
    const container = document.getElementById('selectedItemDetails');
    if (selectedItem) {
        container.innerHTML = `
            <h3>${selectedItem.name}</h3>
             <img src="/sprites/items/${selectedItem.id}.svg" style = "width = 64px; height = 64px;" alt="${selectedItem.name}" 
                             class="item-sprite-small" data-item-id="${selectedItem.id}">
            <p>${selectedItem.description}</p>
            <p>Sell Price: ${selectedItem.sellPrice}</p>
            <h4>Attribute Modifiers:</h4>
            <ul>
                ${Object.entries(selectedItem.attributeModifiers || {}).map(([attr, value]) =>
            `<li>${attr}: ${value}</li>`
        ).join('')}
            </ul>
            <h4>Requirements:</h4>
            <ul>
                ${Object.entries(selectedItem.attributeRequirements || {}).map(([attr, value]) =>
            `<li>${attr}: ${value}</li>`
        ).join('')}
            </ul>
            <button onclick="equipSelectedItem()">Equip</button>
            <button onclick="unequipSelectedItem()">Unequip</button>
            <button onclick="useSelectedItem()">Use</button>
            <button onclick="dropSelectedItem()">Drop</button>
            <button onclick="sendSelectedItem()">Send</button>
        `;
    } else {
        container.innerHTML = '<p>No item selected</p>';
    }
}

function sendSelectedItem() {
    if (selectedItem) {
        const recipientUsername = prompt("Enter the username of the player you want to send the item to:");
        if (recipientUsername) {
            fetch(`/api/inventory/${playerId}/send-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemId: selectedItem.id,
                    recipientUsername: recipientUsername
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert(data.error);
                    } else {
                        alert(data.message);
                        fetchPlayerInventory();
                    }
                })
                .catch(error => console.error('Error sending item:', error));
        }
    }
}

function unequipSelectedItem() {
    if (selectedItem) {
        const slotType = getSlotTypeForItem(selectedItem); // Implement this function based on your game logic
        fetch(`/api/inventory/${playerId}/unequip?slotType=${slotType}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert(data.message);
                    fetchPlayerInventory();
                }
            })
            .catch(error => console.error('Error unequipping item:', error));
    }
}

function equipSelectedItem() {
    if (selectedItem && selectedItem.equippable) {
        const slotType = getSlotTypeForItem(selectedItem);
        if (slotType) {
            fetch(`/api/inventory/${playerId}/equip?itemId=${selectedItem.id}&slotType=${slotType}`, {
                method: 'POST'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to equip item');
                    }
                    return response.json();
                })
                .then(data => {
                    alert(data.message || 'Item equipped successfully');
                    fetchPlayerInventory();
                })
                .catch(error => {
                    console.error('Error equipping item:', error);
                    alert('Failed to equip item. Please try again.');
                });
        } else {
            alert('This item cannot be equipped in any slot.');
        }
    } else {
        alert('This item cannot be equipped.');
    }
}



function getSlotTypeForItem(item) {
    if (item.equippable && item.equipmentSlotTypeString) {
        return item.equipmentSlotTypeString;
    }
    return null;
}


function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.getAttribute('data-item-id'));
}

function drop(ev) {
    ev.preventDefault();
    const itemId = ev.dataTransfer.getData("text");
    const toSlot = ev.target.closest('.inventory-slot').getAttribute('data-slot-index');
    const fromSlot = document.querySelector(`[data-item-id="${itemId}"]`).closest('.inventory-slot').getAttribute('data-slot-index');

    fetch(`/api/inventory/${playerId}/move?itemId=${itemId}&fromSlot=${fromSlot}&toSlot=${toSlot}`, {
        method: 'POST'
    })
        .then(() => fetchPlayerInventory())
        .catch(error => console.error('Error moving item:', error));
}

function dropEquip(ev) {
    ev.preventDefault();
    const itemId = ev.dataTransfer.getData("text");
    const slotType = ev.target.closest('.equipment-slot').getAttribute('data-slot-type');

    fetch(`/api/inventory/${playerId}/equip?itemId=${itemId}&slotType=${slotType}`, {
        method: 'POST'
    })
        .then(() => fetchPlayerInventory())
        .catch(error => console.error('Error equipping item:', error));
}

// Initialize inventory when the tab is shown
document.getElementById('inventory-management-tab').addEventListener('shown.bs.tab', initializeInventory);
function useSelectedItem() {
    if (selectedItem) {
        fetch(`/api/inventory/${playerId}/use-item/${selectedItem.id}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                fetchPlayerInventory();
            })
            .catch(error => console.error('Error using item:', error));
    }
}

function dropSelectedItem() {
    if (selectedItem) {
        const quantity = prompt("How many items do you want to drop? (Enter -1 to drop all)", "1");
        fetch(`/api/inventory/${playerId}/drop-item/${selectedItem.id}?quantity=${quantity}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                fetchPlayerInventory();
            })
            .catch(error => console.error('Error dropping item:', error));
    }
}