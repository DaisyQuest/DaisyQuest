package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Controller.SpriteUpdateRequest;
import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Repository.ItemRepository;
import net.daisyquest.daisyquestgame.Repository.PlayerInventoryRepository;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Service.Failure.UsernameAlreadyExistsException;
import net.daisyquest.daisyquestgame.Service.Initializer.PlayerInitializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PlayerService {

    @Autowired
    private PlayerRepository playerRepository;


    @Autowired
    private CurrencyService currencyService;

    @Autowired
    private SpellService spellService;


    @Transactional
    public void addItemToInventory(String playerId, Item item, int quantity) {
        PlayerInventory inventory = getPlayerInventory(playerId);
        inventory.addItem(item, quantity);
        playerInventoryRepository.save(inventory);
    }

    // Player CRUD operations
    @Transactional
    public Player createPlayer(Player player) throws UsernameAlreadyExistsException {
        if (playerRepository.existsByUsername(player.getUsername())) {
            throw new UsernameAlreadyExistsException("Username already exists: " + player.getUsername());
        }
        PlayerInitializer.initPlayer(player, currencyService.getAllCurrencies(), List.of(spellService.getSpell("fireball")));
        Player playerWithId = playerRepository.save(player);

        PlayerInventory inventory = new PlayerInventory(playerWithId.getId(), 16); // or whatever initial size


        inventory = playerInventoryRepository.save(inventory);
        playerWithId.setInventory(inventory);


        return playerRepository.save(playerWithId);

    }


    @Transactional
    public Player createPlayer(String username) throws UsernameAlreadyExistsException {
        Player p = new Player();
        p.setUsername(username);
        return createPlayer(p);
    }


    public Player getPlayer(String id) {
        Player p =  playerRepository.findById(id).orElse(null);
        if(p == null){
            p= new Player();
        }
        PlayerInitializer.initPlayer(p, currencyService.getAllCurrencies(), List.of(spellService.getSpell("fireball"), spellService.getSpell("iceball"), spellService.getSpell("thunder")));
        p.setInventory(playerInventoryRepository.findByPlayerId(p.getId()));
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

    @Transactional
    public Player updatePlayer(Player player) {
        playerInventoryRepository.save(player.getInventory());
        return playerRepository.save(player);
    }
    // Inventory management


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
        return player.getInventory()
                .getInventorySlots()
                .stream()
                .map(InventorySlot::getItem)
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

    public boolean hasSufficientCurrencyByCurrencyName(Player buyer, String currencyName, int price) {
        Currency currency = currencyService.getCurrencyByName(currencyName);
        if (currency == null) {
            throw new IllegalArgumentException("Invalid currency ID: " + currencyName);
        }
        Integer amount = buyer.getCurrencies().get(currency.getId());
        return amount != null && amount >= price;
    }

    @Transactional
    public void deductCurrencyByName(Player buyer, String currencyName, int price) {
        Currency currency = currencyService.getCurrencyByName(currencyName);
        if (hasSufficientCurrencyByCurrencyName(buyer, currencyName, price)) {
            Map<String, Integer> currencies = buyer.getCurrencies();
            int newAmount = currencies.get(currency.getId()) - price;
            currencies.put(currencyName, newAmount);
            updatePlayer(buyer);
        } else {
            throw new IllegalArgumentException("Insufficient " + currency.getName() + " to complete the transaction.");
        }
    }

    @Transactional
    public void addCurrency(Player owner, String currencyName, int amount) {
        if (amount < 0) {
            throw new IllegalArgumentException("Cannot add a negative amount of currency.");
        }

        Currency currency = currencyService.getCurrency(currencyName);
        if (currency == null) {
            throw new IllegalArgumentException("Invalid currency ID: " + currencyName);
        }

        Map<String, Integer> currencies = owner.getCurrencies();
        currencies.merge(currency.getId(), amount, Integer::sum);
        updatePlayer(owner);
    }

    @Transactional
    public void addCurrencyByName(Player owner, String currencyName, int amount) {
        if (amount < 0) {
            throw new IllegalArgumentException("Cannot add a negative amount of currency.");
        }

        Currency currency = currencyService.getCurrency(currencyName);
        if (currency == null) {
            throw new IllegalArgumentException("Invalid currency name: " + currencyName);
        }

        Map<String, Integer> currencies = owner.getCurrencies();
        currencies.merge(currency.getId(), amount, Integer::sum);
        updatePlayer(owner);
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


    @Transactional
    public void addTalentPoint(String playerId) {
        Player player = getPlayer(playerId);
        if (player != null) {
            player.setTalentPointsAvailable(player.getTalentPointsAvailable() + 1);
            updatePlayer(player);
        } else {
            throw new IllegalArgumentException("Player not found");
        }
    }

    @Transactional
    public Player spendTalentPoint(String playerId, Talent talent) {
        Player player = getPlayer(playerId);
        if (player == null) {
            throw new IllegalArgumentException("Player not found");
        }

        if (player.getTalentPointsAvailable() <= 0) {
            throw new IllegalStateException("No talent points available");
        }

        int currentPoints = player.getTalents().get(talent);
        player.getTalents().put(talent, currentPoints + 1);
        player.setTalentPointsAvailable(player.getTalentPointsAvailable() - 1);
        updatePlayer(player);
        return player;
    }

    public int getTalentLevel(String playerId, Talent talent) {
        Player player = getPlayer(playerId);
        if (player != null) {
            return player.getTalents().get(talent);
        } else {
            throw new IllegalArgumentException("Player not found");
        }
    }

    public Map<Talent, Integer> getAllTalents(String playerId) {
        Player player = getPlayer(playerId);
        if (player != null) {
            return new EnumMap<>(player.getTalents());
        } else {
            throw new IllegalArgumentException("Player not found");
        }
    }

    @Autowired
    private PlayerInventoryRepository playerInventoryRepository;

    @Transactional
    public int addItemToInventory(String playerId, String itemId, int quantity) {

        Player player = getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> {
                    return new ItemNotFoundException("Item not found with id: " + itemId);
                });


        PlayerInventory inventory = player.getInventory();


        try {
            int addedQuantity = inventory.addItem(item, quantity);
            playerInventoryRepository.save(inventory);
            System.out.println("Successfully added {} {} to player {} inventory  " + addedQuantity + " of " +  item.getName() + " To Player With ID: " + playerId);
            return addedQuantity;
        } catch (InventoryFullException e) {
            System.err.println("Couldn't add all items to inventory: {}  " + e.getMessage());
            e.printStackTrace();
            // Extract the number of items added from the exception message
            String[] parts = e.getMessage().split(" ");
            return Integer.parseInt(parts[1]);
        }
    }
    public PlayerInventory getPlayerInventory(String playerId) {
        return playerInventoryRepository.findByPlayerId(playerId);
    }

    @Transactional
    public void moveItem(String playerId, String itemId, int fromSlot, int toSlot) {
        PlayerInventory inventory = getPlayerInventory(playerId);
        InventorySlot fromInventorySlot = inventory.getInventorySlots().stream()
                .filter(slot -> slot.getSlotIndex() == fromSlot)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid from slot"));

        InventorySlot toInventorySlot = inventory.getInventorySlots().stream()
                .filter(slot -> slot.getSlotIndex() == toSlot)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid to slot"));

        if (fromInventorySlot.getItem() == null || !fromInventorySlot.getItem().getId().equals(itemId)) {
            throw new IllegalArgumentException("Item not found in the specified slot");
        }

        Item item = fromInventorySlot.getItem();
        int quantity = fromInventorySlot.getQuantity();

        // Remove item from the original slot
        fromInventorySlot.setItem(null);
        fromInventorySlot.setQuantity(0);

        // Add item to the new slot
        if (toInventorySlot.getItem() == null) {
            toInventorySlot.setItem(item);
            toInventorySlot.setQuantity(quantity);
        } else if (toInventorySlot.getItem().getId().equals(itemId) && item.isStackable()) {
            toInventorySlot.setQuantity(toInventorySlot.getQuantity() + quantity);
        } else {
            // Swap items if the destination slot is occupied
            fromInventorySlot.setItem(toInventorySlot.getItem());
            fromInventorySlot.setQuantity(toInventorySlot.getQuantity());
            toInventorySlot.setItem(item);
            toInventorySlot.setQuantity(quantity);
        }

        playerInventoryRepository.save(inventory);
    }

    @Transactional
    public String useItem(String playerId, String itemId) throws PlayerNotFoundException, ItemNotFoundException {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new PlayerNotFoundException("Player not found with id: " + playerId));
        PlayerInventory inventory = player.getInventory();

        InventorySlot slot = inventory.getInventorySlots().stream()
                .filter(s -> s.hasItem() && s.getItem().getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ItemNotFoundException("Item not found in inventory: " + itemId));

        Item item = slot.getItem();
        String result = "ITEM EFFECT USED";
                //applyItemEffects(player, item);

        // Remove one item from the slot
        slot.removeItem(1);
        if (slot.getQuantity() == 0) {
            slot.setItem(null);
        }

        playerRepository.save(player);
        playerInventoryRepository.save(inventory);

        return result;
    }

    @Transactional
    public String removeItemFromInventory(String playerId, String itemId, int quantity)
            throws PlayerNotFoundException, ItemNotFoundException, InsufficientItemQuantityException {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new PlayerNotFoundException("Player not found with id: " + playerId));
        PlayerInventory inventory = player.getInventory();

        InventorySlot slot = inventory.getInventorySlots().stream()
                .filter(s -> s.hasItem() && s.getItem().getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ItemNotFoundException("Item not found in inventory: " + itemId));

        if (quantity == -1 || quantity >= slot.getQuantity()) {
            // Drop all items
            String itemName = slot.getItem().getName();
            int droppedQuantity = slot.getQuantity();
            slot.setItem(null);
            slot.setQuantity(0);
            playerInventoryRepository.save(inventory);
            return "Dropped all " + droppedQuantity + " " + itemName + "(s)";
        } else {
            // Drop specific quantity
            if (slot.getQuantity() < quantity) {
                throw new InsufficientItemQuantityException("Not enough items to drop");
            }
            slot.removeItem(quantity);
            if (slot.getQuantity() == 0) {
                slot.setItem(null);
            }
            playerInventoryRepository.save(inventory);
            return "Dropped " + quantity + " " + slot.getItem().getName() + "(s)";
        }
    }

    @Transactional
    public String moveEquipment(String playerId, String itemId, String fromSlotType, String toSlotType) {
        Player player = getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }

        PlayerInventory inventory = player.getInventory();

        // Find the source and destination equipment slots
        EquipmentSlot fromSlot = inventory.getEquipmentSlots().stream()
                .filter(slot -> slot.getType().equals(fromSlotType))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid source equipment slot: " + fromSlotType));

        EquipmentSlot toSlot = inventory.getEquipmentSlots().stream()
                .filter(slot -> slot.getType().equals(toSlotType))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid destination equipment slot: " + toSlotType));

        // Check if the source slot has the item we're trying to move
        if (fromSlot.getItem() == null || !fromSlot.getItem().getId().equals(itemId)) {
            throw new IllegalArgumentException("Item not found in the specified equipment slot");
        }

        // Check if the item can be equipped in the destination slot
        if (!canEquipItemInSlot(fromSlot.getItem(), toSlotType)) {
            throw new IllegalArgumentException("Item cannot be equipped in the destination slot");
        }

        // Perform the move/swap
        Item itemToMove = fromSlot.getItem();
        int quantityToMove = fromSlot.getQuantity();

        Item destinationItem = toSlot.getItem();
        int destinationQuantity = toSlot.getQuantity();

        // Move item to destination slot
        toSlot.setItem(itemToMove);
        toSlot.setQuantity(quantityToMove);

        // If destination had an item, move it to the source slot
        if (destinationItem != null) {
            fromSlot.setItem(destinationItem);
            fromSlot.setQuantity(destinationQuantity);
        } else {
            // Clear the source slot if destination was empty
            fromSlot.setItem(null);
            fromSlot.setQuantity(0);
        }

        playerInventoryRepository.save(inventory);

        return "Equipment moved successfully from " + fromSlotType + " to " + toSlotType;
    }

    private boolean canEquipItemInSlot(Item item, String slotType) {
        // Implement logic to check if the item can be equipped in the given slot type
        // This might involve checking item properties, player level, etc.
        // For now, we'll just check if the item's equipment slot matches the destination slot
        return item.getEquipmentSlotTypeString().equals(slotType);
    }



    @Transactional
    public String sendItem(String senderId, String itemId, String recipientUsername)
            throws PlayerNotFoundException, ItemNotFoundException, InsufficientItemQuantityException {
        Player sender = playerRepository.findById(senderId)
                .orElseThrow(() -> new PlayerNotFoundException("Sender not found with id: " + senderId));
        Player recipient = playerRepository.findByUsername(recipientUsername);

        if(recipient == null) {throw new PlayerNotFoundException("Recipient not found with username: " + recipientUsername);};

        PlayerInventory senderInventory = sender.getInventory();
        PlayerInventory recipientInventory = recipient.getInventory();

        InventorySlot senderSlot = senderInventory.getInventorySlots().stream()
                .filter(s -> s.hasItem() && s.getItem().getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ItemNotFoundException("Item not found in sender's inventory: " + itemId));

        Item itemToSend = senderSlot.getItem();

        // Remove item from sender's inventory
        senderSlot.removeItem(1);
        if (senderSlot.getQuantity() == 0) {
            senderSlot.setItem(null);
        }

        // Add item to recipient's inventory
        try {
            recipientInventory.addItem(itemToSend, 1);
        } catch (InventoryFullException e) {
            // If recipient's inventory is full, return the item to the sender
            senderSlot.addItem(itemToSend, 1);
            throw new IllegalStateException("Recipient's inventory is full. Item cannot be sent.");
        }

        playerInventoryRepository.save(senderInventory);
        playerInventoryRepository.save(recipientInventory);

        return "Successfully sent " + itemToSend.getName() + " to " + recipientUsername;
    }

    @Transactional
    public String equipItem(String playerId, String itemId, String slotType) {
        Player player = getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }
        PlayerInventory inventory = player.getInventory();

        Item itemToEquip = inventory.getInventorySlots().stream()
                .filter(slot -> slot.hasItem() && slot.getItem().getId().equals(itemId))
                .map(InventorySlot::getItem)
                .findFirst()
                .orElseThrow(() -> new ItemNotFoundException("Item not found in inventory: " + itemId));

        if (!itemToEquip.isEquippable() || !itemToEquip.getEquipmentSlotTypeString().equals(slotType)) {
            throw new IllegalArgumentException("Item cannot be equipped in the specified slot");
        }

        EquipmentSlot equipmentSlot = inventory.getEquipmentSlots().stream()
                .filter(slot -> slot.getType().equals(slotType))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid equipment slot type: " + slotType));

        if (equipmentSlot.getItem() != null) {
            inventory.addItem(equipmentSlot.getItem(), equipmentSlot.getQuantity());
        }

        equipmentSlot.setItem(itemToEquip);
        equipmentSlot.setQuantity(itemToEquip.isEquippableInStacks() ? 1 : inventory.removeItem(itemId, 1));

        playerInventoryRepository.save(inventory);

        return "Success equipping: " + itemToEquip + " in " + slotType;
    }

    @Transactional
    public String unequipItemToSlot(String playerId, String slotType, int toSlot) {
        Player player = getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }

        PlayerInventory inventory = player.getInventory();
        EquipmentSlot equipmentSlot = inventory.getEquipmentSlots().stream()
                .filter(slot -> slot.getType().equals(slotType))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid equipment slot type: " + slotType));

        if (equipmentSlot.getItem() == null) {
            throw new ItemNotFoundException("No item equipped in the specified slot: " + slotType);
        }

        Item unequippedItem = equipmentSlot.getItem();
        int quantity = equipmentSlot.getQuantity();

        // Remove item from equipment slot
        equipmentSlot.setItem(null);
        equipmentSlot.setQuantity(0);

        // Add item to specific inventory slot
        InventorySlot inventorySlot = inventory.getInventorySlots().get(toSlot);
        if (inventorySlot.getItem() != null) {
            throw new InventoryFullException("Target inventory slot is not empty");
        }

        inventorySlot.setItem(unequippedItem);
        inventorySlot.setQuantity(quantity);

        playerInventoryRepository.save(inventory);

        return "Item unequipped and moved to inventory slot " + toSlot;
    }





    @Transactional
    public void unequipItem(String playerId, String slotType) {
        Player player = getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }
        PlayerInventory inventory = player.getInventory();

        EquipmentSlot equipmentSlot = inventory.getEquipmentSlots().stream()
                .filter(slot -> slot.getType().equals(slotType))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid equipment slot type: " + slotType));

        if (equipmentSlot.getItem() == null) {
            throw new ItemNotFoundException("No item equipped in the specified slot: " + slotType);
        }

        Item unequippedItem = equipmentSlot.getItem();
        int quantity = equipmentSlot.getQuantity();

        try {
            inventory.addItem(unequippedItem, quantity);
            equipmentSlot.setItem(null);
            equipmentSlot.setQuantity(0);
        } catch (InventoryFullException e) {
            throw new InventoryFullException("Cannot unequip item. Inventory is full.");
        }

        playerInventoryRepository.save(inventory);
    }

    @Autowired
    ItemRepository itemRepository;
    private Item getItemById(String itemId) {

        return itemRepository.findById(itemId).orElse(null);
    }

    //TODO: REMOVE

    @Transactional
    public void addTestItemsToPlayer(String playerId) {
        Player player = getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }

        PlayerInventory inventory = player.getInventory();

        String[] itemNames = {
            "Flaming Sword",
            "Helm of Wisdom",
            "Pauldrons of Might",
            "Amulet of Vitality",
            "Epaulettes of Protection",
            "Quiver of Endless Arrows",
            "Bracers of Agility",
            "Chestplate of Resilience",
            "Vambraces of Defense",
            "Gauntlets of Strength",
            "Gloves of Dexterity",
            "Shield of the Ancients",
            "Ring of Power",
            "Band of Elemental Mastery",
            "Belt of Giant Strength",
            "Signet of the King"
        };

        for (String itemName : itemNames) {
            Item item = itemRepository.findItemByName(itemName);

                 if (item == null) throw new ItemNotFoundException("Test item not found: " + itemName);

            try {
                addItemToInventory(playerId, item.getId(), itemName.equals("Flaming Sword") ? 1 : 1);
            } catch (InventoryFullException e) {
                throw new RuntimeException("Failed to add test item " + itemName + ": " + e.getMessage());
            }
        }


        playerRepository.save(player);
    }

    @Transactional
    public String dropItem(String playerId, String itemId, int quantity) {
        Player player = getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }

        PlayerInventory inventory = player.getInventory();
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException("Item not found with id: " + itemId));

        int droppedQuantity;
        try {
            if (quantity == -1) {
                droppedQuantity = inventory.removeItem(itemId, Integer.MAX_VALUE);
            } else {
                droppedQuantity = inventory.removeItem(itemId, quantity);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error removing item from inventory: " + e.getMessage(), e);
        }

        if (droppedQuantity == 0) {
            return "No items of type " + item.getName() + " were found in the player's inventory";
        }

        try {
            playerInventoryRepository.save(inventory);
        } catch (Exception e) {
            throw new RuntimeException("Error saving updated inventory: " + e.getMessage(), e);
        }

        return String.format("Dropped %d %s(s)", droppedQuantity, item.getName());
    }



}