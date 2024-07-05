package net.daisyquest.daisyquestgame.Model;

import lombok.Data;

import java.util.Map;

@Data
public class EquipmentSlot {
    private String type;
    private Item item;
    private int quantity;

    public EquipmentSlot(String type) {
        this.type = type;
    }

    public boolean canEquip(Item item, Map<String, Attribute> playerAttributes) {
        return item.meetsRequirements(playerAttributes);
    }

    public Item equip(Item newItem, int quantity) {
        Item oldItem = this.item;
        this.item = newItem;
        this.quantity = quantity;
        return oldItem;
    }

    public Item unequip() {
        Item unequippedItem = this.item;
        this.item = null;
        this.quantity = 0;
        return unequippedItem;
    }
}
