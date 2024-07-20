package net.daisyquest.daisyquestgame.Service;

import jakarta.annotation.PostConstruct;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.Spell;
import net.daisyquest.daisyquestgame.Service.Interfaces.ICacheableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class SpellService implements ICacheableService {
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
        fireball.addStatusEffectApplication(statusEffectService.getStatusEffectByShortDisplayNameNoCache("BRN"), 4);
        fireball.setSpellSpritePath("fireball_red");
        spells.put(fireball.getId(), fireball);



        Spell iceball = new Spell();
        iceball.setId("blizzard");
        iceball.setName("Blizzard");
        iceball.setDescription("Creates a furious blizzard!");
        iceball.setManaCost(45);
        iceball.setCooldown(20);
        iceball.setEffect(Spell.SpellEffect.DAMAGE);
        iceball.setSpellSpritePath("fireball_blue");

        iceball.addStatusEffectApplication(statusEffectService.getStatusEffectByShortDisplayNameNoCache("FRZ"), 4);
        spells.put(iceball.getId(), iceball);


        Spell thunder = new Spell();
        thunder.setId("thunder");
        thunder.setName("Thunder");
        thunder.setDescription("Thunder!!!");
        thunder.setManaCost(10);
        thunder.setCooldown(5);
        thunder.setEffect(Spell.SpellEffect.DAMAGE);

        thunder.setSpellSpritePath("fireball_purple");

        thunder.addStatusEffectApplication(statusEffectService.getStatusEffectByShortDisplayNameNoCache("STN"), 4);

        spells.put(thunder.getId(), thunder);

        Spell skeletonRot = new Spell();
        skeletonRot.setId("skeleton_rot");
        skeletonRot.setName("Skeleton Rot");
        skeletonRot.setDescription("Inflicts rot on the target, causing damage over time");
        skeletonRot.setManaCost(10);
        skeletonRot.setCooldown(5);
        skeletonRot.setEffect(Spell.SpellEffect.DAMAGE);
        skeletonRot.setSpellSpritePath("fireball_grey");


        skeletonRot.addStatusEffectApplication(statusEffectService.getStatusEffectByShortDisplayNameNoCache("ROT"), 10);

        spells.put(skeletonRot.getId(), skeletonRot);
    }

    public Spell getSpell(String spellId) {
        return spells.get(spellId);
    }

    @Override
    public void clearCache() {
        spells.clear();
        setup();
    }

    @Override
    public String getServiceName() {
        return "SpellService";
    }



    // Add methods for learning spells, etc.
}
