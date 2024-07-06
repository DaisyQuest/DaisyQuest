package net.daisyquest.daisyquestgame.Model;


import lombok.Data;

import java.util.ArrayList;
import java.util.List;


@Data
public class Spell {
    private String id;
    private String name;
    private String description;
    private int manaCost;
    private int cooldown;
    private SpellEffect effect;
    private List<StatusEffectApplication> statusEffects;

    public Spell() {
        this.statusEffects = new ArrayList<>();
    }

    public void addStatusEffectApplication(StatusEffect statusEffect, int duration) {
        this.statusEffects.add(new StatusEffectApplication(statusEffect, duration));
    }

    @Data
    public static class StatusEffectApplication {
        private StatusEffect statusEffect;
        private int duration;

        public StatusEffectApplication(StatusEffect statusEffect, int duration) {
            this.statusEffect = statusEffect;
            this.duration = duration;
        }
    }

    public void applyStatusEffects(Combat combat, String targetPlayerId) {
        for (StatusEffectApplication application : statusEffects) {
            combat.addStatusEffect(targetPlayerId, application.getStatusEffect(), application.getDuration());
        }
    }

    public enum SpellEffect {
        DAMAGE, HEAL, BUFF, DEBUFF
    }
}
