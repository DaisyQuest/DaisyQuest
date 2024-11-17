package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SkillRequirement  implements IRequirement {
    private String skillId;
    int amount;

    @Override
    public boolean isMet(Player player) {
        return player.getAttributes().get(skillId).getLevel() >= amount;
    }

    @Override
    public boolean consume(Player player) {
        return true; // Spell requirements don't consume anything
    }

    @Override
    public String getDescription() {
        return String.format("Requires knowledge of skill: %s", skillId);
    }
}
