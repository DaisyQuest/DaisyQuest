package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;

// Item requirement
@Data
@AllArgsConstructor
public class ItemRequirement implements IRequirement {
    private String itemId;
    private int quantity;
    private boolean consume; // Whether to remove the item when consumed

    @Override
    public boolean isMet(Player player) {
        return player.getInventory().hasItem(itemId, quantity);
    }

    @Override
    public boolean consume(Player player) {
        if (!consume) { // If we don't need to consume the item
            return true;
        }

        try {
            player.getInventory().removeItem(itemId, quantity);
            return true;
        } catch (ItemNotFoundException e) {
            return false;
        }
    }

    @Override
    public String getDescription() {
        return String.format("Requires %dx %s", quantity, itemId);
    }
}
