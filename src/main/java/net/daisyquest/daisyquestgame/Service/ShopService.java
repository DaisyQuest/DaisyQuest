package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Repository.ShopRepository;
import net.daisyquest.daisyquestgame.Repository.ShopItemRepository;
import net.daisyquest.daisyquestgame.Service.Failure.InsufficientFundsException;
import net.daisyquest.daisyquestgame.Service.Failure.InvalidCurrencyException;
import net.daisyquest.daisyquestgame.Service.Failure.ShopNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ShopService {
    private static final Logger logger = LoggerFactory.getLogger(ShopService.class);
    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private ShopItemRepository shopItemRepository;

    @Autowired
    private PlayerService playerService;

    @Autowired
    private ItemService itemService;

    @Autowired
    private CurrencyService currencyService;

    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }

    public Shop getShop(String id) {
        return shopRepository.findById(id).orElse(null);
    }

    public Shop getPlayerShop(String playerId) {
        return shopRepository.findByOwnerId(playerId);
    }

    /**
     * Processes the purchase of an item from a shop by a player.
     *
     * @param shopId   The ID of the shop
     * @param itemId   The ID of the item to be purchased
     * @param playerId The ID of the player making the purchase
     * @return A string message indicating the result of the purchase attempt
     * @throws ShopNotFoundException if the shop is not found
     * @throws PlayerNotFoundException if the player is not found
     * @throws ItemNotFoundException if the item is not found in the shop
     * @throws InsufficientFundsException if the player doesn't have enough currency
     * @throws InventoryFullException if the player's inventory is full
     */
    @Transactional
    public String buyItem(String shopId, String itemId, String playerId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new ShopNotFoundException("Shop not found with id: " + shopId));

        Player player = playerService.getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }

        ShopItem shopItem = shop.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ItemNotFoundException("Item not found in shop: " + itemId));

        String currencyName = shopItem.getCurrencyUsed().getName();
        int playerCurrency = player.getInventory().getCurrencies().getOrDefault(currencyName, 0);

        if (playerCurrency < shopItem.getPrice()) {
            throw new InsufficientFundsException("Not enough " + currencyName + " to purchase item");
        }

        if (shopItem.getQuantity() != null && shopItem.getQuantity() <= 0) {
            throw new ItemNotFoundException("Item out of stock");
        }

        // Attempt to add item to player's inventory
        try {
            player.getInventory().addItem(shopItem.getItemForSale(), 1);
        } catch (InventoryFullException e) {
            throw new InventoryFullException("Cannot purchase item. Player's inventory is full.");
        }

        // Deduct currency from player
        player.getInventory().getCurrencies().put(currencyName, playerCurrency - shopItem.getPrice());

        // Update shop item quantity
        updateShopItemQuantity(shop, shopItem);

        // Save changes
        playerService.updatePlayer(player);
        shopRepository.save(shop);

        logger.info("Player {} successfully purchased item {} from shop {}", playerId, itemId, shopId);
        return "Item purchased successfully";
    }

    /**
     * Updates the quantity of a shop item after a purchase.
     * Removes the item from the shop if it's out of stock.
     *
     * @param shop The shop containing the item
     * @param shopItem The item that was purchased
     */
    private void updateShopItemQuantity(Shop shop, ShopItem shopItem) {
        if (shopItem.getQuantity() != null) {
            shopItem.setQuantity(shopItem.getQuantity() - 1);
            if (shopItem.getQuantity() == 0) {
                shop.getItems().remove(shopItem);
                shopItemRepository.delete(shopItem);
            } else {
                shopItemRepository.save(shopItem);
            }
        }
    }


    /**
     * Lists an item from a player's inventory for sale in their shop.
     *
     * @param playerId   The ID of the player listing the item
     * @param itemId     The ID of the item to be listed
     * @param price      The price of the item
     * @param currencyId The ID of the currency to be used for the sale
     * @param quantity   The quantity of the item to be listed (null for unlimited)
     * @return A string message indicating the result of the listing attempt
     * @throws PlayerNotFoundException if the player is not found
     * @throws ItemNotFoundException if the item is not found in the player's inventory
     * @throws InvalidCurrencyException if the specified currency is invalid
     */
    @Transactional
    public String listItemForSale(String playerId, String itemId, int price, String currencyId, Integer quantity) {
        Player player = playerService.getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }

        PlayerInventory inventory = player.getInventory();
        InventorySlot slot = inventory.getInventorySlots().stream()
                .filter(s -> s.hasItem() && s.getItem().getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ItemNotFoundException("Item not found in player's inventory: " + itemId));

        Currency currency = currencyService.getCurrency(currencyId);
        if (currency == null) {
            throw new InvalidCurrencyException("Invalid currency: " + currencyId);
        }

        Shop playerShop = getOrCreatePlayerShop(player);

        ShopItem shopItem = new ShopItem();
        shopItem.setItemForSale(slot.getItem());
        shopItem.setPrice(price);
        shopItem.setCurrencyUsed(currency);
        shopItem.setQuantity(quantity);

        shopItem = shopItemRepository.save(shopItem);
        playerShop.getItems().add(shopItem);
        shopRepository.save(playerShop);

        // Remove item from player's inventory
        int quantityToRemove = (quantity != null) ? quantity : slot.getQuantity();
        inventory.removeItem(itemId, quantityToRemove);
        playerService.updatePlayer(player);

        logger.info("Player {} listed item {} for sale", playerId, itemId);
        return "Item listed for sale successfully";
    }

    /**
     * Removes an item from a player's shop and returns it to their inventory.
     *
     * @param playerId   The ID of the player
     * @param shopItemId The ID of the shop item to be removed
     * @return A string message indicating the result of the removal attempt
     * @throws PlayerNotFoundException if the player is not found
     * @throws ShopNotFoundException if the player's shop is not found
     * @throws ItemNotFoundException if the shop item is not found
     * @throws InventoryFullException if the player's inventory is full
     */
    @Transactional
    public String removeShopItem(String playerId, String shopItemId) {
        Player player = playerService.getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }

        Shop playerShop = getPlayerShop(playerId);
        if (playerShop == null) {
            throw new ShopNotFoundException("Player shop not found for player: " + playerId);
        }

        ShopItem shopItem = playerShop.getItems().stream()
                .filter(item -> item.getId().equals(shopItemId))
                .findFirst()
                .orElseThrow(() -> new ItemNotFoundException("Shop item not found: " + shopItemId));

        playerShop.getItems().remove(shopItem);
        shopRepository.save(playerShop);

        PlayerInventory inventory = player.getInventory();
        try {
            inventory.addItem(shopItem.getItemForSale(), shopItem.getQuantity() != null ? shopItem.getQuantity() : 1);
        } catch (InventoryFullException e) {
            throw new InventoryFullException("Cannot return item to inventory. Player's inventory is full.");
        }

        playerService.updatePlayer(player);
        shopItemRepository.delete(shopItem);

        logger.info("Player {} removed item {} from shop and returned to inventory", playerId, shopItemId);
        return "Item removed from shop and returned to inventory";
    }

    /**
     * Gets or creates a shop for a player.
     *
     * @param player The player to get or create a shop for
     * @return The player's shop
     */
    private Shop getOrCreatePlayerShop(Player player) {
        Shop playerShop = getPlayerShop(player.getId());
        if (playerShop == null) {
            playerShop = new Shop();
            playerShop.setName(player.getUsername() + "'s Shop");
            playerShop.setOwnerId(player.getId());
            playerShop.setItems(new ArrayList<>());
            playerShop = shopRepository.save(playerShop);
        }
        return playerShop;
    }





}