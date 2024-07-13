package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import net.daisyquest.daisyquestgame.Service.InventoryFullException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;
import java.util.stream.Collectors;

@Data
@Document(collection = "player_inventories")
public class PlayerInventory {
    private static final Logger logger = LoggerFactory.getLogger(PlayerInventory.class);
    @Id
    private String id;
    private String playerId;
    private List<InventorySlot> inventorySlots;
    private List<EquipmentSlot> equipmentSlots;
    private int maxInventorySize;
    List<EquipmentProperty> equipmentProperties = new ArrayList<>();
    Map<String, Integer> effectivePropertyAmounts = new HashMap<>();

    public PlayerInventory(String playerId, int maxInventorySize) {
        this.playerId = playerId;
        this.maxInventorySize = maxInventorySize;
        this.inventorySlots = new ArrayList<>(maxInventorySize);
        this.equipmentSlots = new ArrayList<>();
        initializeInventorySlots();
        initializeEquipmentSlots();
    }

    private void initializeInventorySlots() {
        for (int i = 0; i < maxInventorySize; i++) {
            inventorySlots.add(new InventorySlot(i));
        }
    }

    private void initializeEquipmentSlots() {
        for (String slotType : EQUIPMENT_SLOT_TYPES) {
            equipmentSlots.add(new EquipmentSlot(slotType));
        }
    }



    public boolean canAddItem(Item item, int quantity) {
        int availableSpace = inventorySlots.stream()
                .filter(slot -> slot.canAddItem(item, quantity))
                .mapToInt(slot -> slot.getAvailableSpace(item))
                .sum();
        return availableSpace >= quantity;
    }

    public int addItem(Item newItem, int quantity) throws InventoryFullException {
        if (newItem == null) {
            throw new IllegalArgumentException("Cannot add null item to inventory");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be positive");
        }

        System.err.println("Attempting to add item: " + newItem.getName() + ", quantity: " + quantity);
        System.err.println("Item details - ID: " + newItem.getId() + ", MaxStackSize: " + newItem.getMaxStackSize() + ", Stackable: " + newItem.isStackable());

        logInventoryState();

        int remainingQuantity = quantity;
        int addedQuantity = 0;

        // First, try to stack with existing items if stackable
        if (newItem.isStackable()) {
            for (InventorySlot slot : inventorySlots) {
                if (remainingQuantity == 0) break;
                if (slot.getItem() != null && slot.getItem().getId().equals(newItem.getId())) {
                    int spaceInSlot = newItem.getMaxStackSize() - slot.getQuantity();
                    if (spaceInSlot > 0) {
                        int addQuantity = Math.min(remainingQuantity, spaceInSlot);
                        slot.setQuantity(slot.getQuantity() + addQuantity);
                        remainingQuantity -= addQuantity;
                        addedQuantity += addQuantity;
                        System.err.println("Added " + addQuantity + " items to existing stack in slot " + slot.getSlotIndex());
                    }
                }
            }
        }

        System.err.println("After stacking: remainingQuantity = " + remainingQuantity + ", addedQuantity = " + addedQuantity);

        // If there are still items to add, find empty slots
        while (remainingQuantity > 0) {
            InventorySlot emptySlot = findEmptySlot();
            if (emptySlot == null) {
                System.err.println("No empty slots found. Inventory size: " + inventorySlots.size());
                break; // No more empty slots
            }
            int addQuantity = Math.min(remainingQuantity, newItem.getMaxStackSize());
            emptySlot.setItem(newItem);
            emptySlot.setQuantity(addQuantity);
            remainingQuantity -= addQuantity;
            addedQuantity += addQuantity;
            System.err.println("Added " + addQuantity + " items to empty slot " + emptySlot.getSlotIndex());
        }

        System.err.println("Final state: remainingQuantity = " + remainingQuantity + ", addedQuantity = " + addedQuantity);

        if (addedQuantity == 0) {
            System.err.println("Could not add any items. Inventory is full.");
            throw new InventoryFullException("Could not add any items. Inventory is full.");
        }

        if (remainingQuantity > 0) {
            System.err.println("Added " + addedQuantity + " items. Not enough space to add remaining " + remainingQuantity + " items");
            throw new InventoryFullException("Added " + addedQuantity + " items. Not enough space to add remaining " + remainingQuantity + " items");
        }

        System.err.println("Successfully added " + addedQuantity + " items to inventory");
        return addedQuantity;
    }

    private InventorySlot findEmptySlot() {
        for (InventorySlot slot : inventorySlots) {
            if (slot.getItem() == null) {
                System.err.println("Found empty slot at index " + slot.getSlotIndex());
                return slot;
            }
        }
        System.err.println("No empty slots found in inventory");
        return null;
    }

    private void logInventoryState() {
        System.err.println("Current inventory state:");
        System.err.println("Inventory size: " + inventorySlots.size());
        int emptySlots = 0;
        for (InventorySlot slot : inventorySlots) {
            if (slot.getItem() == null) {
                emptySlots++;
            } else {
                System.err.println("Slot " + slot.getSlotIndex() + ": Item " + slot.getItem().getName() +
                        " (" + slot.getItem().getId() + "), Quantity: " + slot.getQuantity());
            }
        }
        System.err.println("Total empty slots: " + emptySlots);
    }


    public int removeItem(String itemId, int quantity) throws ItemNotFoundException {
        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity to remove must be non-negative");
        }

        int remainingQuantity = quantity;
        int totalRemoved = 0;

        for (InventorySlot slot : inventorySlots) {
            if (slot.hasItem() && slot.getItem().getId().equals(itemId)) {
                int removed = slot.removeItem(remainingQuantity);
                totalRemoved += removed;
                remainingQuantity -= removed;
                if (remainingQuantity == 0) break;
            }
        }

        if (totalRemoved == 0) {
            throw new ItemNotFoundException("Item not found in inventory: " + itemId);
        }

        return totalRemoved;
    }
    public Map<String, Integer> getInventoryContents() {
        return inventorySlots.stream()
                .filter(InventorySlot::hasItem)
                .collect(Collectors.groupingBy(
                        slot -> slot.getItem().getId(),
                        Collectors.summingInt(InventorySlot::getQuantity)
                ));
    }

    public boolean hasItem(String itemId) {
        return inventorySlots.stream()
                .anyMatch(slot -> slot.hasItem() && slot.getItem().getId().equals(itemId));
    }

    /**
     * Checks if the inventory contains at least the specified quantity of the item.
     *
     * @param itemId   The ID of the item to check for
     * @param quantity The minimum quantity of the item to check for
     * @return true if the inventory contains at least the specified quantity of the item, false otherwise
     */
    public boolean hasItem(String itemId, int quantity) {
        int totalQuantity = inventorySlots.stream()
                .filter(slot -> slot.hasItem() && slot.getItem().getId().equals(itemId))
                .mapToInt(InventorySlot::getQuantity)
                .sum();
        return totalQuantity >= quantity;
    }

    /**
     * Gets the total quantity of a specific item in the inventory.
     *
     * @param itemId The ID of the item to count
     * @return The total quantity of the item in the inventory
     */
    public int getItemQuantity(String itemId) {
        return inventorySlots.stream()
                .filter(slot -> slot.hasItem() && slot.getItem().getId().equals(itemId))
                .mapToInt(InventorySlot::getQuantity)
                .sum();
    }

    public static final String[] EQUIPMENT_SLOT_TYPES = {
            "HEAD", "NECK", "LEFT_SHOULDER", "RIGHT_SHOULDER", "CHEST", "WAIST",
            "LEGS", "FEET", "LEFT_WRIST", "RIGHT_WRIST", "LEFT_HAND", "RIGHT_HAND",
            "LEFT_FINGER_1","LEFT_FINGER_2", "RIGHT_FINGER_1","RIGHT_FINGER_2", "AMMO"
    };


    public Map<String, Integer> calculateEffectiveEquipmentBonuses() {
        Map<String, Integer> effectiveBonuses = new HashMap<>();
        Map<String, EquipmentProperty> propertyMap = new HashMap<>();

        // Create a map of property names to EquipmentProperty objects
        for (EquipmentProperty property : equipmentProperties) {
            propertyMap.put(property.getName(), property);
            effectiveBonuses.put(property.getName(), 0);
        }

        // Calculate the sum of all equipment bonuses
        for (EquipmentSlot slot : equipmentSlots) {
            if (slot.getItem() != null) {
                Map<String, Integer> itemBonuses = slot.getItem().getEquipmentPropertyModifiers();
                if(itemBonuses == null) continue;
                for (Map.Entry<String, Integer> entry : itemBonuses.entrySet()) {
                    String propertyName = entry.getKey();
                    int bonusValue = entry.getValue();
                    effectiveBonuses.merge(propertyName, bonusValue, Integer::sum);
                }
            }
        }

        // Apply the property types (additive, multiplicative, etc.)
        for (Map.Entry<String, Integer> entry : new HashMap<>(effectiveBonuses).entrySet()) {
            String propertyName = entry.getKey();
            int currentValue = entry.getValue();
            EquipmentProperty property = propertyMap.get(propertyName);

            if (property == null) {
                continue; // Skip if the property is not found in the equipmentProperties list
            }

            int finalValue;

            switch (property.getType()) {
                case ADDITITIVE:
                    finalValue = property.getDefaultAmount() + currentValue;
                    break;
                case MULTIPLICATIVE:
                    finalValue = (int) (property.getDefaultAmount() * (1 + currentValue * property.getAmountMultiplicative()));
                    break;
                case NON_QUANTITATIVE:
                    finalValue = currentValue > 0 ? 1 : 0;
                    break;
                case HIDDEN:
                    // For hidden properties, we keep the calculated value but it won't be displayed to the player
                    finalValue = currentValue;
                    break;
                default:
                    finalValue = currentValue;
            }

            effectiveBonuses.put(propertyName, finalValue);
        }

        return effectiveBonuses;
    }

    }





