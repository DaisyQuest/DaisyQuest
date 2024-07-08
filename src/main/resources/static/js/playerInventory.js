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

    // Add currencies section
    const currenciesSection = document.createElement('div');
    currenciesSection.className = 'currencies-section';
    currenciesSection.innerHTML = `
        <h5 class="mt-4">Currencies</h5>
        <ul class="list-group">
            ${Object.entries(playerInventory.currencies || {}).map(([currencyId, amount]) => {
        const details = currencyDetails[currencyId] || { name: currencyId, symbol: '' };
        return `<li class="list-group-item">
                    ${details.name}: ${details.symbol}${amount}
                </li>`;
    }).join('')}
        </ul>
    `;
    container.appendChild(currenciesSection);

    // Render inventory slots
    const slotsContainer = document.createElement('div');
    slotsContainer.className = 'inventory-slots-container';

    for (let i = 0; i < playerInventory.maxInventorySize; i++) {
        const slot = playerInventory.inventorySlots[i] || { slotIndex: i };
        const slotElement = document.createElement('div');
        slotElement.className = 'inventory-slot';
        slotElement.setAttribute('data-slot-index', i);

        if (slot.item) {
            slotElement.innerHTML = `
                <img src="/sprites/items/${slot.item.id}.png" alt="${slot.item.name}" 
                     class="item-sprite" data-item-id="${slot.item.id}" draggable="true">
                <span class="item-quantity">${slot.quantity}</span>
            `;
            slotElement.addEventListener('click', () => selectItem(slot.item));

            const imgElement = slotElement.querySelector('.item-sprite');
            imgElement.addEventListener('dragstart', drag);
        } else {
            slotElement.innerHTML = '<div class="empty-slot"></div>';
        }

        slotElement.addEventListener('dragover', allowDrop);
        slotElement.addEventListener('drop', drop);
        slotsContainer.appendChild(slotElement);
    }

    container.appendChild(slotsContainer);
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
                    <img src="/sprites/items/${equippedItem.item.id}.png" alt="${equippedItem.item.name}" 
                         class="item-sprite" data-item-id="${equippedItem.item.id}" draggable="true">
                    ${equippedItem.item.equippableInStacks ? `<span class="item-quantity">${equippedItem.quantity}</span>` : ''}
                `;
                slotElement.addEventListener('click', () => selectItem(equippedItem.item));
                const imgElement = slotElement.querySelector('.item-sprite');
                imgElement.addEventListener('dragstart', dragEquipped);
            } else {
                slotElement.innerHTML = `<div class="empty-slot"><img src="/sprites/slots/${slotType.toLowerCase()}.png" alt="${slotType}"></div>`;
            }

            slotElement.addEventListener('dragover', allowDrop);
            slotElement.addEventListener('drop', (ev) => dropEquip(ev, slotType));
            tierElement.appendChild(slotElement);
        });

        container.appendChild(tierElement);
    });
}

function dragEquipped(ev) {
    ev.dataTransfer.setData("text", JSON.stringify({
        itemId: ev.target.getAttribute('data-item-id'),
        fromEquipment: true,
        slotType: ev.target.closest('.equipment-slot').getAttribute('data-slot-type')
    }));
}

function dropEquip(ev, toSlotType) {
    ev.preventDefault();
    const data = ev.dataTransfer ? JSON.parse(ev.dataTransfer.getData("text")) : null;

    if (data) {
        handleEquipmentMove(data.itemId, data.fromEquipment, data.slotType, toSlotType);
    }
}

function handleEquipmentMove(itemId, fromEquipment, fromSlotType, toSlotType) {
    if (fromEquipment) {
        fetch(`/api/inventory/${playerId}/move-equipment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                itemId: itemId,
                fromSlotType: fromSlotType,
                toSlotType: toSlotType
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => {
                fetchPlayerInventory();
            })
            .catch(error => {
                console.error('Error moving equipment:', error);
                alert('Failed to move equipment. Please try again.');
            });
    } else {
        fetch(`/api/inventory/${playerId}/equip?itemId=${itemId}&slotType=${toSlotType}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => {
                fetchPlayerInventory();
                selectedItem = null;
            })
            .catch(error => {
                console.error('Error equipping item:', error);
                alert('Failed to equip item. Please try again.');
            });
    }
}

function selectItem(item) {
    selectedItem = item;
    renderSelectedItemInfo();
}

function renderSelectedItemInfo() {
    const container = document.getElementById('selectedItemDetails');
    if (selectedItem) {
        const isEquipped = playerInventory.equipmentSlots.some(slot => slot.item && slot.item.id === selectedItem.id);
        const equipSlotIcon = selectedItem.equippable ?
            `<img src="/sprites/slots/${selectedItem.equipmentSlotTypeString.toLowerCase()}.png" alt="${selectedItem.equipmentSlotTypeString}" class="equipment-slot-icon">` : '';

        container.innerHTML = `
            <h3>${selectedItem.name} ${equipSlotIcon}</h3>
            <img src="/sprites/items/${selectedItem.id}.png" style="width: 64px; height: 64px;" alt="${selectedItem.name}" 
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
            <div class="button-container">
                ${isEquipped ?
            `<button class="inventory-button unequip-button" onclick="unequipSelectedItem()">Unequip</button>` :
            (selectedItem.equippable ? `<button class="inventory-button equip-button" onclick="equipSelectedItem()">Equip</button>` : '')
        }
                <button class="inventory-button use-button" onclick="useSelectedItem()">Use</button>
                <button class="inventory-button drop-button" onclick="dropSelectedItem()">Drop</button>
                <button class="inventory-button send-button" onclick="sendSelectedItem()">Send</button>
            </div>
        `;
    } else {
        container.innerHTML = '<p>No item selected</p>';
    }
}

function unequipSelectedItem() {
    if (selectedItem && selectedItem.equippable) {
        const slotType = getSlotTypeForItem(selectedItem);
        if (slotType) {
            fetch(`/api/inventory/${playerId}/unequip?slotType=${slotType}`, {
                method: 'POST'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to unequip item');
                    }
                    return response.json();
                })
                .then(data => {
                    alert(data.message || 'Item unequipped successfully');
                    fetchPlayerInventory();
                    // Hide the unequip button
                    const unequipButton = document.querySelector('.unequip-button');
                    if (unequipButton) {
                        unequipButton.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error('Error unequipping item:', error);
                    alert('Failed to unequip item. Please try again.');
                });
        } else {
            alert('This item cannot be unequipped.');
        }
    } else {
        alert('This item is not equipped.');
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

function equipSelectedItem() {
    if (selectedItem && selectedItem.equippable) {
        const slotType = getSlotTypeForItem(selectedItem);
        if (slotType) {
            fetch(`/api/inventory/${playerId}/equip?itemId=${selectedItem.id}&slotType=${slotType}`, {
                method: 'POST',
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
    ev.dataTransfer.setData("text", JSON.stringify({
        itemId: ev.target.getAttribute('data-item-id'),
        fromEquipment: false
    }));
}

function drop(ev) {
    ev.preventDefault();
    const data = JSON.parse(ev.dataTransfer.getData("text"));
    const itemId = data.itemId;
    const fromEquipment = data.fromEquipment;
    const slotType = data.slotType;

    const toSlot = ev.target.closest('.inventory-slot').getAttribute('data-slot-index');

    if (fromEquipment) {
        fetch(`/api/inventory/${playerId}/unequiptoslot?slotType=${slotType}&toSlot=${toSlot}`, {
            method: 'POST'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => {
                fetchPlayerInventory();
            })
            .catch(error => {
                console.error('Error unequipping item:', error);
                alert('Failed to unequip item. Please try again.');
            });
    } else {
        const fromSlot = document.querySelector(`[data-item-id="${itemId}"]`).closest('.inventory-slot').getAttribute('data-slot-index');

        fetch(`/api/inventory/${playerId}/move?itemId=${itemId}&fromSlot=${fromSlot}&toSlot=${toSlot}`, {
            method: 'POST'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => {
                fetchPlayerInventory();
            })
            .catch(error => {
                console.error('Error moving item:', error);
                alert('Failed to move item. Please try again.');
            });
    }
}

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