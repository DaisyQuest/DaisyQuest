package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Data
@Document(collection = "items")
public class Item {
    @Id
    private String id;
    private String name;
    private String description;
    private Map<String, Integer> attributeModifiers;
    private Map<String, Integer> attributeRequirements;
    private Map<String, Integer> equipmentPropertyModifiers;

    private String spriteName;

    private int sellPrice;
    private boolean isChest;
    private boolean retainOnDeath;
    private boolean stackable;
    private int maxStackSize = 1;
    public int getMaxStackSize() {
        return maxStackSize > 0 ? maxStackSize : 1;  // Ensure we never return 0 or negative
    }

    public void setMaxStackSize(int maxStackSize) {
        this.maxStackSize = Math.max(1, maxStackSize);  // Ensure we never set 0 or negative
    }

    private boolean equippable = false;
    private String equipmentSlotTypeString;
    private boolean equippableInStacks = false;

    private Rarity rarity;

    List<SpecialAttack> specialAttacks;

    public boolean meetsRequirements(Map<String, Attribute> playerAttributes) {
        if (attributeRequirements == null) return true;
        for (Map.Entry<String, Integer> requirement : attributeRequirements.entrySet()) {
            Attribute playerAttribute = playerAttributes.get(requirement.getKey());
            if (playerAttribute == null || playerAttribute.getLevel() < requirement.getValue()) {
                return false;
            }
        }
        return true;
    }
}
