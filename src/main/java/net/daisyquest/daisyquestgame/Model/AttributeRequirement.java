package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;

// Attribute level requirement
@Data
@AllArgsConstructor
public class AttributeRequirement implements IRequirement {
    private String attributeName;
    private int requiredLevel;

    @Override
    public boolean isMet(Player player) {
        Attribute attr = player.getAttributes().get(attributeName);
        return attr != null && attr.getLevel() >= requiredLevel;
    }

    @Override
    public boolean consume(Player player) {
        return true; // Attribute requirements don't consume anything
    }

    @Override
    public String getDescription() {
        return String.format("Requires %s level %d", attributeName, requiredLevel);
    }
}
