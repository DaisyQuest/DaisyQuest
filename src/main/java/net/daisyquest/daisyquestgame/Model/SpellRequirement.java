package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;

// Spell requirement
@Data
@AllArgsConstructor
public class SpellRequirement implements IRequirement {
    private String spellId;

    @Override
    public boolean isMet(Player player) {
        return player.getKnownSpells().contains(spellId);
    }

    @Override
    public boolean consume(Player player) {
        return true; // Spell requirements don't consume anything
    }

    @Override
    public String getDescription() {
        return String.format("Requires knowledge of spell: %s", spellId);
    }
}
