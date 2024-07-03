package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Controller.PlayerController;
import net.daisyquest.daisyquestgame.Controller.SpriteUpdateRequest;
import net.daisyquest.daisyquestgame.Model.Attribute;
import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Repository.CurrencyRepository;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Service.Failure.UsernameAlreadyExistsException;
import net.daisyquest.daisyquestgame.Service.Initializer.PlayerInitializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PlayerService {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private CurrencyRepository currencyRepository;

    @Autowired
    private SpellService spellService;
    // Player CRUD operations
    public Player createPlayer(Player player) throws UsernameAlreadyExistsException {
        if (playerRepository.existsByUsername(player.getUsername())) {
            throw new UsernameAlreadyExistsException("Username already exists: " + player.getUsername());
        }
        PlayerInitializer.initPlayer(player, currencyRepository.findAll(), List.of(spellService.getSpell("fireball")));
        return playerRepository.save(player);
    }

    public Player getPlayer(String id) {
        Player p =  playerRepository.findById(id).orElse(null);
        PlayerInitializer.initPlayer(p, currencyRepository.findAll(), List.of(spellService.getSpell("fireball"), spellService.getSpell("iceball"), spellService.getSpell("thunder")));
        return p;
    }

    public Player getPlayerByUsername(String username) {
        return playerRepository.findByUsername(username);
    }

    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    public void deletePlayer(String id) {
        playerRepository.deleteById(id);
    }

    public Player updatePlayer(Player player) {
        return playerRepository.save(player);
    }

    // Inventory management
    public void addItemToInventory(Player player, Item item, int quantity) {
        for (int i = 0; i < quantity; i++) {
            player.getInventory().add(item);
        }
        updatePlayer(player);
    }

    public String useItem(String playerId, String itemId) {
        Player player = getPlayer(playerId);
        if (player == null) return "Player not found.";

        Optional<Item> itemOpt = findItemInInventory(player, itemId);
        if (itemOpt.isEmpty()) return "Item not found in inventory.";

        Item item = itemOpt.get();
        applyItemEffects(player, item);
        player.getInventory().remove(item);
        updatePlayer(player);
        return "Item used successfully. Effects applied.";
    }

    public String dropItem(String playerId, String itemId) {
        Player player = getPlayer(playerId);
        if (player == null) return "Player not found.";

        Optional<Item> itemOpt = findItemInInventory(player, itemId);
        if (itemOpt.isEmpty()) return "Item not found in inventory.";

        player.getInventory().remove(itemOpt.get());
        updatePlayer(player);
        return "Item dropped successfully.";
    }

    public String sendItem(String senderId, String itemId, String recipientUsername) {
        Player sender = getPlayer(senderId);
        Player recipient = getPlayerByUsername(recipientUsername);

        if (sender == null) return "Sender not found.";
        if (recipient == null) return "Recipient not found.";

        Optional<Item> itemOpt = findItemInInventory(sender, itemId);
        if (itemOpt.isEmpty()) return "Item not found in sender's inventory.";

        Item item = itemOpt.get();
        sender.getInventory().remove(item);
        recipient.getInventory().add(item);
        updatePlayer(sender);
        updatePlayer(recipient);
        return "Item sent successfully.";
    }

    public List<Item> getInventory(String playerId) {
        Player player = getPlayer(playerId);
        return player != null ? player.getInventory() : List.of();
    }

    // Experience and leveling
    public void addExperience(Player player, int amount) {
        player.setTotalExperience(player.getTotalExperience() + amount);
        checkLevelUp(player);
        updatePlayer(player);
    }

    public void addAttributeExperience(Player player, String attributeName, int amount) {
        Attribute attribute = player.getAttributes().get(attributeName.toLowerCase());
        if (attribute != null) {
            attribute.setExperience(attribute.getExperience() + amount);
            checkAttributeLevelUp(attribute);
            updatePlayer(player);
        }
    }

    // Private helper methods
    private Optional<Item> findItemInInventory(Player player, String itemId) {
        return player.getInventory().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst();
    }

    private void applyItemEffects(Player player, Item item) {
        item.getAttributeModifiers().forEach((attributeName, value) -> {
            Attribute attribute = player.getAttributes().get(attributeName);
            if (attribute != null) {
                attribute.setLevel(attribute.getLevel() + value);
            }
        });
    }

    private void checkLevelUp(Player player) {
        int currentLevel = player.getLevel();
        int xpForNextLevel = calculateXPForLevel(currentLevel + 1);

        while (player.getTotalExperience() >= xpForNextLevel) {
            player.setLevel(player.getLevel() + 1);
            xpForNextLevel = calculateXPForLevel(player.getLevel() + 1);
        }
    }

    private void checkAttributeLevelUp(Attribute attribute) {
        int currentLevel = attribute.getLevel();
        int xpForNextLevel = calculateAttributeXPForLevel(currentLevel + 1);

        while (attribute.getExperience() >= xpForNextLevel) {
            attribute.setLevel(attribute.getLevel() + 1);
            attribute.setExperience(attribute.getExperience() - xpForNextLevel);
            xpForNextLevel = calculateAttributeXPForLevel(attribute.getLevel() + 1);
        }
    }

    private int calculateXPForLevel(int level) {
        return 100 * (level - 1) * (level - 1);
    }

    private int calculateAttributeXPForLevel(int level) {
        return 50 * level * level;
    }


    public Player updatePlayerSprite(String playerId, SpriteUpdateRequest request) {
        Player player = getPlayer(playerId);
        if (player == null) {
            throw new IllegalArgumentException("Player not found");
        }

        player.setSubspriteBackground(request.getSubspriteBackground());
        player.setSubspriteFace(request.getSubspriteFace());
        player.setSubspriteEyes(request.getSubspriteEyes());
        player.setSubspriteHairHat(request.getSubspriteHairHat());

        return playerRepository.save(player);
    }

    @Transactional
    public void addResources(String playerId, int amount) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));
        player.setResources(player.getResources() + amount);
        playerRepository.save(player);
    }

    public boolean hasSufficientCurrency(Player buyer, String currencyType, int price) {
        Map<String, Integer> currencies = buyer.getCurrencies();

        // Check if the currency type exists and the buyer has enough of it
        return currencies.containsKey(currencyType) && currencies.get(currencyType) >= price;
    }

    /**
     * Deducts a specified amount from a player's currency, if possible.
     * @param buyer The player whose currency is being deducted.
     * @param currencyType The type of currency to deduct.
     * @param price The amount to deduct.
     */
    public void deductCurrency(Player buyer, String currencyType, int price) {
        if (hasSufficientCurrency(buyer, currencyType, price)) {
            Map<String, Integer> currencies = buyer.getCurrencies();

            // Deduct the currency safely after rechecking the balance
            int newAmount = currencies.get(currencyType) - price;
            currencies.put(currencyType, newAmount);
        } else {
            // Handle the case where there is not enough currency
            throw new IllegalArgumentException("Insufficient " + currencyType + " to complete the transaction.");
        }
    }

    public void addCurrency(Player owner, String currencyType, int amount) {
        if (amount < 0) {
            throw new IllegalArgumentException("Cannot add a negative amount of currency.");
        }

        Map<String, Integer> currencies = owner.getCurrencies();

        // Check if the currency type exists; if not, initialize it
        currencies.putIfAbsent(currencyType, 0);

        // Add the specified amount to the existing balance
        int newAmount = currencies.get(currencyType) + amount;
        currencies.put(currencyType, newAmount);
    }

    public boolean deductResources(String id, int cost) {
        return true;
    }


    public void markPlayerForDeletion(String playerId) {
        Player player = getPlayer(playerId);
        if (player != null && player.isNPC()) {
            player.setMarkedForDeletion(true);
            updatePlayer(player);
            // You might want to schedule a task to actually delete this player after a certain time
        }
    }


}