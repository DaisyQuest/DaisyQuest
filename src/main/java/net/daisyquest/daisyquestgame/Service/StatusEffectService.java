package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.StatusEffect;
import net.daisyquest.daisyquestgame.Model.Combat;
import net.daisyquest.daisyquestgame.Model.CombatStatusContainer;
import net.daisyquest.daisyquestgame.Model.StatusEffectInfo;
import net.daisyquest.daisyquestgame.Repository.StatusEffectRepository;
import net.daisyquest.daisyquestgame.Service.Interfaces.ICacheableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatusEffectService implements ICacheableService {

    @Autowired
    private StatusEffectRepository statusEffectRepository;

    private final Map<String, StatusEffect> statusEffectCache = new HashMap<>();

    public StatusEffect createStatusEffect(StatusEffect statusEffect) {
        StatusEffect savedEffect = statusEffectRepository.save(statusEffect);
        statusEffectCache.put(savedEffect.getId(), savedEffect);
        return savedEffect;
    }

    public StatusEffect getStatusEffect(String id) {
        StatusEffect cachedEffect = statusEffectCache.get(id);
        if (cachedEffect != null) {
            return cachedEffect;
        }
        StatusEffect effect = statusEffectRepository.findById(id).orElse(null);
        if (effect != null) {
            statusEffectCache.put(id, effect);
        }
        return effect;
    }

    public List<StatusEffect> getAllStatusEffects() {
        List<StatusEffect> effects = statusEffectRepository.findAll();
        effects.forEach(effect -> statusEffectCache.put(effect.getId(), effect));
        return effects;
    }

    public void applyStatusEffect(Combat combat, String playerId, String statusEffectId, int duration) {
        StatusEffect effect = getStatusEffect(statusEffectId);
        if (effect != null) {
            combat.addStatusEffect(playerId, effect, duration);
        }
    }

    public void applyStatusEffect(Combat combat, String playerId, StatusEffect statusEffect, int duration) {
            combat.addStatusEffect(playerId, statusEffect, duration);
    }



    public Map<String, List<StatusEffectInfo>> getActiveStatusEffects(Combat combat) {
        Map<String, List<StatusEffectInfo>> activeEffects = new HashMap<>();

        for (String playerId : combat.getPlayerIds()) {
            Map<String, CombatStatusContainer> playerEffects = combat.getPlayerStatusEffects().get(playerId);
            if (playerEffects != null) {
                List<StatusEffectInfo> effectInfoList = new ArrayList<>();

                for (Map.Entry<String, CombatStatusContainer> entry : playerEffects.entrySet()) {
                    StatusEffect effect = getStatusEffect(entry.getKey());
                    int duration = entry.getValue().getRemainingDuration(effect);

                    StatusEffectInfo info = new StatusEffectInfo(effect, duration);
                    effectInfoList.add(info);
                }

                activeEffects.put(playerId, effectInfoList);
            }
        }

        return activeEffects;
    }

    public StatusEffect getStatusEffectByShortDisplayNameNoCache(String searchDisplayName) {
    return statusEffectRepository.findStatusEffectByShortDisplayName(searchDisplayName);
    }

    @Override
    public void clearCache() {
        statusEffectCache.clear();
    }

    @Override
    public String getServiceName() {
        return "StatusEffectService";
    }
}