package net.daisyquest.daisyquestgame.Service;



import net.daisyquest.daisyquestgame.Model.Attribute;
import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Service.Initializer.PlayerInitializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlayerService {

    @Autowired
    private PlayerRepository playerRepository;

    public Player createPlayer(Player player) {


        PlayerInitializer.initPlayer(player);
        return playerRepository.save(player);
    }

    public Player getPlayer(String id) {
        return playerRepository.findById(id).orElse(null);
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

    public void addItemToInventory(Player player, Item item, int quantity) {
        for(int i = 0; i < quantity; i++) {
            player.getInventory().add(item);
        }
        updatePlayer(player);
    }

    public String useItem(String playerId, String itemId) {
        Player player = getPlayer(playerId);
        if (player != null) {
            Optional<Item> itemOpt = player.getInventory().stream()
                    .filter(item -> item.getId().equals(itemId))
                    .findFirst();

            if (itemOpt.isPresent()) {
                Item item = itemOpt.get();
                // Apply item effects
                item.getAttributeModifiers().forEach((attributeName, value) -> {
                    Attribute attribute = player.getAttributes().get(attributeName);
                    if (attribute != null) {
                        attribute.setLevel(attribute.getLevel() + value);
                    }
                });
                player.getInventory().remove(item);
                updatePlayer(player);
                return "Item used successfully. Effects applied.";
            }
            return "Item not found in inventory.";
        }
        return "Player not found.";
    }

    public String dropItem(String playerId, String itemId) {
        Player player = getPlayer(playerId);
        if (player != null) {
            Optional<Item> itemOpt = player.getInventory().stream()
                    .filter(item -> item.getId().equals(itemId))
                    .findFirst();

            if (itemOpt.isPresent()) {
                player.getInventory().remove(itemOpt.get());
                updatePlayer(player);
                return "Item dropped successfully.";
            }
            return "Item not found in inventory.";
        }
        return "Player not found.";
    }

    public String sendItem(String senderId, String itemId, String recipientUsername) {
        Player sender = getPlayer(senderId);
        Player recipient = playerRepository.findByUsername(recipientUsername);

        if (sender == null) {
            return "Sender not found.";
        }
        if (recipient == null) {
            return "Recipient not found.";
        }

        Optional<Item> itemOpt = sender.getInventory().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst();

        if (itemOpt.isPresent()) {
            Item item = itemOpt.get();
            sender.getInventory().remove(item);
            recipient.getInventory().add(item);
            updatePlayer(sender);
            updatePlayer(recipient);
            return "Item sent successfully.";
        }
        return "Item not found in sender's inventory.";
    }

    public List<Item> getInventory(String playerId) {
        Player player = getPlayer(playerId);
        if (player != null) {
            return player.getInventory();
        }
        return List.of(); // Return empty list if player not found
    }

    public void addExperience(Player player, int amount) {
        player.setTotalExperience(player.getTotalExperience() + amount);
        checkLevelUp(player);
        updatePlayer(player);
    }

    private void checkLevelUp(Player player) {
        int currentLevel = player.getLevel();
        int xpForNextLevel = calculateXPForLevel(currentLevel + 1);

        while (player.getTotalExperience() >= xpForNextLevel) {
            player.setLevel(player.getLevel() + 1);
            // You could add more effects here, like increasing base stats
            xpForNextLevel = calculateXPForLevel(player.getLevel() + 1);
        }
    }

    private int calculateXPForLevel(int level) {
        // This is a simple XP curve. Adjust as needed for your game balance.
        return 100 * (level - 1) * (level - 1);
    }

    public void addAttributeExperience(Player player, String attributeName, int amount) {
        Attribute attribute = player.getAttributes().get(attributeName);
        if (attribute != null) {
            attribute.setExperience(attribute.getExperience() + amount);
            checkAttributeLevelUp(attribute);
            updatePlayer(player);
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

    private int calculateAttributeXPForLevel(int level) {
        // This is a simple XP curve for attributes. Adjust as needed.
        return 50 * level * level;
    }
}