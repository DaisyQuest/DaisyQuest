// inventoryManager.js


class InventoryManager {
    updateInventory(playerId) {
        fetch(`/api/players/${playerId}/inventory`)
            .then(response => response.json())
            .then(inventory => {
                uiManager.updateInventoryUI(inventory);
            });
    }

     useItem(itemId) {
        fetch(`/api/players/${playerId}/use-item/${itemId}`, { method: 'POST' })
            .then(response => response.json())
            .then(result => {
                alert(`Item used! ${result.message}`);
                updatePlayerInfo();
                updateInventory();
            });
    }

     dropItem(itemId) {
        if (confirm('Are you sure you want to drop this item?')) {
            fetch(`/api/players/${playerId}/drop-item/${itemId}`, { method: 'POST' })
                .then(response => response.json())
                .then(result => {
                    alert(`Item dropped! ${result.message}`);
                    updateInventory();
                });
        }
    }


     openSendItemModal(itemId) {
        document.getElementById('itemIdToSend').value = itemId;
        new bootstrap.Modal(document.getElementById('sendItemModal')).show();
    }

    sendItem() {
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
}

window.InventoryManager = new InventoryManager();