// shopManager.js

class ShopManager {
    updateShopList() {
        fetch('/api/shops')
            .then(response => response.json())
            .then(shops => {
                uiManager.updateShopListUI(shops);
            });
    }

     viewShop(shopId) {
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

     buyItem(shopId, itemId) {
         fetch(`/api/shops/${shopId}/buy/${itemId}`, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify({playerId: playerId})
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

     openListItemModal(itemId) {
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

          listItemForSale() {
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

     removeShopItem(shopItemId) {
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

    updatePlayerShop(playerId) {
        fetch(`/api/players/${playerId}/shop`)
            .then(response => response.json())
            .then(shop => {
                uiManager.updatePlayerShopUI(shop);
            });
    }
}

window.ShopManager = new ShopManager();