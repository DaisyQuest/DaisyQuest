package net.daisyquest.daisyquestgame.Service;

import jakarta.annotation.PostConstruct;
import net.daisyquest.daisyquestgame.Model.Spell;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class SpellService {
    private final Map<String, Spell> spells = new HashMap<>();

    @Autowired
    private StatusEffectService statusEffectService;
    public SpellService() {
        // Initialize with some default spells

        // Add more spells as needed
    }

    @PostConstruct
    public void setup(){
        Spell fireball = new Spell();
        fireball.setId("fireball");
        fireball.setName("Fireball");
        fireball.setDescription("Launches a ball of fire at the target");
        fireball.setManaCost(20);
        fireball.setCooldown(10);
        fireball.setEffect(Spell.SpellEffect.DAMAGE);
        fireball.addStatusEffectApplication(statusEffectService.getStatusEffectByDisplayNameNoCache("Burn"), 4);
        spells.put(fireball.getId(), fireball);



        Spell iceball = new Spell();
        iceball.setId("blizzard");
        iceball.setName("Blizzard");
        iceball.setDescription("Creates a furious blizzard!");
        iceball.setManaCost(45);
        iceball.setCooldown(20);
        iceball.setEffect(Spell.SpellEffect.DAMAGE);
        iceball.addStatusEffectApplication(statusEffectService.getStatusEffectByDisplayNameNoCache("Freeze"), 4);
        spells.put(iceball.getId(), iceball);


        Spell thunder = new Spell();
        thunder.setId("thunder");
        thunder.setName("Thunder");
        thunder.setDescription("Thunder!!!");
        thunder.setManaCost(10);
        thunder.setCooldown(5);
        thunder.setEffect(Spell.SpellEffect.DAMAGE);
        thunder.addStatusEffectApplication(statusEffectService.getStatusEffectByDisplayNameNoCache("Stun"), 4);

        spells.put(thunder.getId(), thunder);
    }

    public Spell getSpell(String spellId) {
        return spells.get(spellId);
    }

    // Add methods for learning spells, etc.
}
