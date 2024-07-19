package net.daisyquest.daisyquestgame.Service;

import jakarta.annotation.PostConstruct;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.SpecialAttack;
import net.daisyquest.daisyquestgame.Service.Interfaces.ICacheableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SpecialAttackService implements ICacheableService {
    private final Map<String, SpecialAttack> specialAttacks = new HashMap<>();

    @Autowired
    private StatusEffectService statusEffectService;

    @Autowired
    private PlayerService playerService;

    public SpecialAttackService() {
        // Constructor is empty, initialization is done in setup()
    }

    @PostConstruct
    public void setup() {
        SpecialAttack doubleSlash = new SpecialAttack();
        doubleSlash.setId("double_slash");
        doubleSlash.setName("Double Slash");
        doubleSlash.setDescription("Performs two quick slashes on the target");
        doubleSlash.setCooldown(5);
        doubleSlash.setAttackQuantity(2);
        doubleSlash.setSpecialAttackSpritePath("double_slash");
        doubleSlash.setStatusEffects(new ArrayList<>());
        specialAttacks.put(doubleSlash.getId(), doubleSlash);

        SpecialAttack powerfulBlow = new SpecialAttack();
        powerfulBlow.setId("powerful_blow");
        powerfulBlow.setName("Powerful Blow");
        powerfulBlow.setDescription("Delivers a single, powerful strike");
        powerfulBlow.setCooldown(8);
        powerfulBlow.setAttackQuantity(1);
        powerfulBlow.setSpecialAttackSpritePath("powerful_blow");
        powerfulBlow.setStatusEffects(new ArrayList<>());
        powerfulBlow.addStatusEffectApplication(statusEffectService.getStatusEffectByShortDisplayNameNoCache("STN"), 2);
        specialAttacks.put(powerfulBlow.getId(), powerfulBlow);

        SpecialAttack whirlwind = new SpecialAttack();
        whirlwind.setId("whirlwind");
        whirlwind.setName("Whirlwind");
        whirlwind.setDescription("Spins rapidly, striking all nearby enemies");
        whirlwind.setCooldown(12);
        whirlwind.setAttackQuantity(3);
        whirlwind.setSpecialAttackSpritePath("whirlwind");
        whirlwind.setStatusEffects(new ArrayList<>());
        whirlwind.addStatusEffectApplication(statusEffectService.getStatusEffectByShortDisplayNameNoCache("FRZ"), 3);
        specialAttacks.put(whirlwind.getId(), whirlwind);

        SpecialAttack venomStrike = new SpecialAttack();
        venomStrike.setId("venom_strike");
        venomStrike.setName("Venom Strike");
        venomStrike.setDescription("A poisonous attack that damages over time");
        venomStrike.setCooldown(10);
        venomStrike.setAttackQuantity(1);
        venomStrike.setSpecialAttackSpritePath("venom_strike");
        venomStrike.setStatusEffects(new ArrayList<>());
        venomStrike.addStatusEffectApplication(statusEffectService.getStatusEffectByShortDisplayNameNoCache("PSN"), 5);
        specialAttacks.put(venomStrike.getId(), venomStrike);
    }

    public SpecialAttack getSpecialAttack(String specialAttackId) {
        return specialAttacks.get(specialAttackId);
    }

    @Override
    public void clearCache() {
        specialAttacks.clear();
        setup();
    }

    @Override
    public String getServiceName() {
        return "SpecialAttackService";
    }

    public void addSpecialAttack(SpecialAttack specialAttack) {
        specialAttacks.put(specialAttack.getId(), specialAttack);
    }

    public void removeSpecialAttack(String specialAttackId) {
        specialAttacks.remove(specialAttackId);
    }

    public Map<String, SpecialAttack> getAllSpecialAttacks() {
        return new HashMap<>(specialAttacks);
    }

    public boolean specialAttackExists(String specialAttackId) {
        return specialAttacks.containsKey(specialAttackId);
    }

    public void updateSpecialAttack(SpecialAttack updatedSpecialAttack) {
        if (specialAttacks.containsKey(updatedSpecialAttack.getId())) {
            specialAttacks.put(updatedSpecialAttack.getId(), updatedSpecialAttack);
        } else {
            throw new IllegalArgumentException("Special attack with ID " + updatedSpecialAttack.getId() + " does not exist.");
        }
    }
    public List<SpecialAttack> getSpecialAttacksForPlayer(String playerId) {
        Player player = playerService.getPlayer(playerId);
        List<SpecialAttack> retList = new ArrayList<>();
        if(player.getInventory() != null) {
            player.getInventory().getEquipmentSlots().stream().filter(o-> o.getItem() != null && o.getItem().getSpecialAttacks() != null)
                    .map(o -> o.getItem().getSpecialAttacks()).distinct().forEach(retList::addAll);
        }

        retList.add(specialAttacks.get("double_slash"));
        retList.add(specialAttacks.get("venom_strike"));
        return retList;

    }


    public SpecialAttack getSpecialAttackByName(String specialAttackName) {
        return specialAttacks.keySet().stream().filter(o -> specialAttacks.get(o).getName().equals(specialAttackName)).map(specialAttacks::get).findFirst().orElse(null);
    }
}
