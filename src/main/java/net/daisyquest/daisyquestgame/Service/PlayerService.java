package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.Attribute;
import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Repository.CurrencyRepository;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Service.Failure.UsernameAlreadyExistsException;
import net.daisyquest.daisyquestgame.Service.Initializer.PlayerInitializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
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
        PlayerInitializer.initPlayer(p, currencyRepository.findAll(), List.of(spellService.getSpell("fireball")));
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
}