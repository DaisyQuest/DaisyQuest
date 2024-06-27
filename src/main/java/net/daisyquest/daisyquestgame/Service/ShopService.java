package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Repository.ShopRepository;
import net.daisyquest.daisyquestgame.Repository.ShopItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ShopService {

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

    @Transactional
    public String buyItem(String shopId, String itemId, String playerId) {
        Shop shop = getShop(shopId);
        Player player = playerService.getPlayer(playerId);

        if (shop == null || player == null) {
            return "Shop or player not found";
        }

        Optional<ShopItem> shopItemOpt = shop.getItems().stream()
                .filter(item -> item.getId() != null && item.getId().equals(itemId))
                .findFirst();

        if (shopItemOpt.isEmpty()) {
            return "Item not found in shop";
        }

        ShopItem shopItem = shopItemOpt.get();
        String currencyName = shopItem.getCurrencyUsed().getName();
        int playerCurrency = player.getCurrencies().getOrDefault(currencyName, 0);

        if (playerCurrency < shopItem.getPrice()) {
            return "Not enough " + currencyName;
        }

        if (shopItem.getQuantity() != null && shopItem.getQuantity() <= 0) {
            return "Item out of stock";
        }

        // Deduct currency and add item to player's inventory
        player.getCurrencies().put(currencyName, playerCurrency - shopItem.getPrice());
        player.getInventory().add(shopItem.getItemForSale());

        // Update shop item quantity if it's not unlimited
        if (shopItem.getQuantity() != null) {
            shopItem.setQuantity(shopItem.getQuantity() - 1);
            if (shopItem.getQuantity() == 0) {
                shop.getItems().remove(shopItem);
                shopItemRepository.delete(shopItem);
            } else {
                shopItemRepository.save(shopItem);
            }
        }

        playerService.updatePlayer(player);
        shopRepository.save(shop);

        return "Item purchased successfully";
    }

    @Transactional
    public String listItemForSale(String playerId, String itemId, int price, String currencyId, Integer quantity) {
        Player player = playerService.getPlayer(playerId);
        if (player == null) {
            return "Player not found";
        }

        Item item = player.getInventory().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElse(null);

        if (item == null) {
            return "Item not found in player's inventory";
        }

        Currency currency = currencyService.getCurrency(currencyId);
        if (currency == null) {
            return "Invalid currency";
        }

        Shop playerShop = getPlayerShop(playerId);
        if (playerShop == null) {
            playerShop = new Shop();
            playerShop.setName(player.getUsername() + "'s Shop");
            playerShop.setOwnerId(playerId);
            playerShop.setItems(new ArrayList<>());
        }

        ShopItem shopItem = new ShopItem();
        shopItem.setItemForSale(item);
        shopItem.setPrice(price);
        shopItem.setCurrencyUsed(currency);
        shopItem.setQuantity(quantity);

        // Save the ShopItem first
        shopItem = shopItemRepository.save(shopItem);

        if (playerShop.getItems() == null) {
            playerShop.setItems(new ArrayList<>());
        }
        playerShop.getItems().add(shopItem);

        // Save the updated Shop
        shopRepository.save(playerShop);

        player.getInventory().remove(item);
        playerService.updatePlayer(player);

        return "Item listed for sale successfully";
    }

    @Transactional
    public String removeShopItem(String playerId, String shopItemId) {
        Shop playerShop = getPlayerShop(playerId);
        if (playerShop == null) {
            return "Player shop not found";
        }

        Optional<ShopItem> shopItemOpt = playerShop.getItems().stream()
                .filter(item -> item.getId() != null && item.getId().equals(shopItemId))
                .findFirst();

        if (shopItemOpt.isEmpty()) {
            return "Shop item not found";
        }

        ShopItem shopItem = shopItemOpt.get();
        playerShop.getItems().remove(shopItem);
        shopRepository.save(playerShop);

        Player player = playerService.getPlayer(playerId);
        player.getInventory().add(shopItem.getItemForSale());
        playerService.updatePlayer(player);

        shopItemRepository.delete(shopItem);

        return "Item removed from shop and returned to inventory";
    }
}