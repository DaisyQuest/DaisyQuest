package net.daisyquest.daisyquestgame.Service.Temp;

import net.daisyquest.daisyquestgame.Model.StatusEffect;
import net.daisyquest.daisyquestgame.Model.StatusEffectPropertyContainer;
import net.daisyquest.daisyquestgame.Model.StatusEffectPropertyType;
import net.daisyquest.daisyquestgame.Repository.StatusEffectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class StatusEffectTestData {
    @Autowired
    StatusEffectRepository statusEffectRepository;
    public List<StatusEffect> createTestStatusEffects() {
        List<StatusEffect> testEffects = new ArrayList<>();

        // Poison
        StatusEffect poison = statusEffectRepository.findStatusEffectByDisplayName("Poison");
        testEffects.add(poison);

        // Burn
        StatusEffect burn = statusEffectRepository.findStatusEffectByDisplayName("Burn");
        testEffects.add(burn);

        // Freeze
        StatusEffect freeze = statusEffectRepository.findStatusEffectByDisplayName("Freeze");
        testEffects.add(freeze);

        // Stun
        StatusEffect stun = statusEffectRepository.findStatusEffectByDisplayName("Stun");
        testEffects.add(stun);

        return testEffects;
    }
}