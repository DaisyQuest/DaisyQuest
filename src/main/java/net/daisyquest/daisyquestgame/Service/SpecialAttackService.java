package net.daisyquest.daisyquestgame.Service;

import jakarta.annotation.PostConstruct;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.SpecialAttack;
import net.daisyquest.daisyquestgame.Repository.SpecialAttackRepository;
import net.daisyquest.daisyquestgame.Service.Interfaces.ICacheableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
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
    @Autowired
    private SpecialAttackRepository specialAttackRepository;

    public SpecialAttackService() {
        // Constructor is empty, initialization is done in setup()
    }

    @PostConstruct
    public void setup() {
        List<SpecialAttack> specialAttacksToSave = new ArrayList<>();

        SpecialAttack doubleSlash = createSpecialAttack("double_slash", "Double Slash",
                "Performs two quick slashes on the target", 5, 2, "double_slash", new ArrayList<>());
        specialAttacksToSave.add(doubleSlash);

        SpecialAttack powerfulBlow = createSpecialAttack("powerful_blow", "Powerful Blow",
                "Delivers a single, powerful strike", 8, 1, "powerful_blow", new ArrayList<>());
        powerfulBlow.addStatusEffectApplication(statusEffectService.getStatusEffectByShortDisplayNameNoCache("STN"), 2);
        specialAttacksToSave.add(powerfulBlow);

        SpecialAttack whirlwind = createSpecialAttack("whirlwind", "Whirlwind",
                "Spins rapidly, striking all nearby enemies", 12, 3, "whirlwind", new ArrayList<>());
        whirlwind.addStatusEffectApplication(statusEffectService.getStatusEffectByShortDisplayNameNoCache("FRZ"), 3);
        specialAttacksToSave.add(whirlwind);

        SpecialAttack venomStrike = createSpecialAttack("venom_strike", "Venom Strike",
                "A poisonous attack that damages over time", 10, 1, "venom_strike", new ArrayList<>());
        venomStrike.addStatusEffectApplication(statusEffectService.getStatusEffectByShortDisplayNameNoCache("PSN"), 5);
        specialAttacksToSave.add(venomStrike);

        for (SpecialAttack attack : specialAttacksToSave) {
            SpecialAttack existingAttack = specialAttackRepository.findSpecialAttackBySpecialAttackId(attack.getSpecialAttackId());
            if (existingAttack == null) {
                specialAttackRepository.save(attack);
            }
            specialAttacks.put(attack.getSpecialAttackId(), attack);
        }
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
        if (player.getInventory() != null) {
            player.getInventory().getEquipmentSlots().stream().filter(o -> o.getItem() != null && o.getItem().getSpecialAttacks() != null)
                    .map(o -> o.getItem().getSpecialAttacks()).distinct().forEach(retList::addAll);
        }

        retList.add(specialAttacks.get("double_slash"));
        retList.add(specialAttacks.get("venom_strike"));
        return retList;

    }


    public SpecialAttack getSpecialAttackByName(String specialAttackName) {
        return specialAttacks.keySet().stream().filter(o -> specialAttacks.get(o).getName().equals(specialAttackName)).map(specialAttacks::get).findFirst().orElse(null);
    }

    public SpecialAttack saveSpecialAttack(SpecialAttack specialAttack) {
        return specialAttackRepository.save(specialAttack);
    }

    public List<SpecialAttack> getAll() {
        return specialAttackRepository.findAll();
    }

    public SpecialAttack getSpecialAttackById(String id) {
        return specialAttackRepository.findById(id).orElse(null);
    }


    private SpecialAttack createSpecialAttack(String id, String name, String description, int cooldown,
                                              int attackQuantity, String spritePath, List<SpecialAttack.StatusEffectApplication> statusEffects) {
        SpecialAttack attack = new SpecialAttack();
        attack.setSpecialAttackId(id);
        attack.setName(name);
        attack.setDescription(description);
        attack.setCooldown(cooldown);
        attack.setAttackQuantity(attackQuantity);
        attack.setSpecialAttackSpritePath(spritePath);
        attack.setStatusEffects(statusEffects);
        return attack;
    }

}
