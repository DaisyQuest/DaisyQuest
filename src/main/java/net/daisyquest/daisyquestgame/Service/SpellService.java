package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.Spell;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class SpellService {
    private Map<String, Spell> spells = new HashMap<>();

    public SpellService() {
        // Initialize with some default spells
        Spell fireball = new Spell();
        fireball.setId("fireball");
        fireball.setName("Fireball");
        fireball.setDescription("Launches a ball of fire at the target");
        fireball.setManaCost(20);
        fireball.setCooldown(10);
        fireball.setEffect(Spell.SpellEffect.DAMAGE);
        spells.put(fireball.getId(), fireball);

        // Add more spells as needed
    }

    public Spell getSpell(String spellId) {
        return spells.get(spellId);
    }

    // Add methods for learning spells, etc.
}
