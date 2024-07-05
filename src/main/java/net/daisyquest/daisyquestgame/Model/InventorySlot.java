package net.daisyquest.daisyquestgame.Model;

import lombok.Data;


@Data
public class InventorySlot {
    private int slotIndex;
    private Item item;
    private int quantity;

    public InventorySlot(int slotIndex) {
        this.slotIndex = slotIndex;
        this.quantity = 0;
    }

    public boolean hasItem() {
        return item != null && quantity > 0;
    }

    public boolean canAddItem(Item newItem, int amount) {
        return !hasItem() || (item.equals(newItem) && item.isStackable() &&
                quantity + amount <= item.getMaxStackSize());
    }

    public int getAvailableSpace(Item newItem) {
        if (!hasItem()) return newItem.getMaxStackSize();
        if (item.equals(newItem) && item.isStackable()) {
            return item.getMaxStackSize() - quantity;
        }
        return 0;
    }

    public int addItem(Item newItem, int amount) {
        if (!hasItem()) {
            item = newItem;
            quantity = Math.min(amount, newItem.getMaxStackSize());
            return amount - quantity;
        } else if (item.equals(newItem) && item.isStackable()) {
            int spaceLeft = item.getMaxStackSize() - quantity;
            int amountToAdd = Math.min(amount, spaceLeft);
            quantity += amountToAdd;
            return amount - amountToAdd;
        }
        return amount;
    }

    public int removeItem(int amount) {
        int amountToRemove = Math.min(amount, quantity);
        quantity -= amountToRemove;
        if (quantity == 0) {
            item = null;
        }
        return amountToRemove;
    }
}