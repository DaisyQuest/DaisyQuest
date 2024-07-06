package net.daisyquest.daisyquestgame.Model;


import lombok.Data;
import java.util.HashMap;
import java.util.Map;

@Data
public class CombatStatusContainer {
    private String playerId;
    private Map<String, Integer> statusEffectDurations;

    public CombatStatusContainer(String playerId) {
        this.playerId = playerId;
        this.statusEffectDurations = new HashMap<>();
    }

    public CombatStatusContainer(String playerId, StatusEffect statusEffect, int duration) {
        this(playerId);
        this.addStatusEffect(statusEffect, duration);
    }

    public void addStatusEffect(StatusEffect statusEffect, int duration) {
        statusEffectDurations.put(statusEffect.getId(), duration);
    }

    public void removeStatusEffect(StatusEffect statusEffect) {
        statusEffectDurations.remove(statusEffect.getId());
    }

    public void updateStatusEffectDuration(StatusEffect statusEffect, int newDuration) {
        if (statusEffectDurations.containsKey(statusEffect.getId())) {
            statusEffectDurations.put(statusEffect.getId(), newDuration);
        }
    }

    public void decrementDurations() {
        statusEffectDurations.entrySet().removeIf(entry -> {
            entry.setValue(entry.getValue() - 1);
            return entry.getValue() <= 0;
        });
    }

    public boolean hasStatusEffect(StatusEffect statusEffect) {
        return statusEffectDurations.containsKey(statusEffect.getId());
    }

    public int getRemainingDuration(StatusEffect statusEffect) {
        if(statusEffect == null){
            return 0;
        }
        return statusEffectDurations.getOrDefault(statusEffect.getId(), 0);
    }

    public CombatStatusContainer(){

    }
}