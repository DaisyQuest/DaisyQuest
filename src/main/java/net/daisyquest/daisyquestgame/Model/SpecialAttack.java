package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "special_attacks")
public class SpecialAttack {
    @Id
    private String id;
    private String specialAttackId;
    private String name;
    private String description;
    private int cooldown;
    private int attackQuantity;
    private List<StatusEffectApplication> statusEffects;
    private String specialAttackSpritePath;
    public void addStatusEffectApplication(StatusEffect statusEffect, int duration) {
        this.statusEffects.add(new SpecialAttack.StatusEffectApplication(statusEffect, duration));
    }
    @Data
    @AllArgsConstructor
    public static class StatusEffectApplication {
        private StatusEffect statusEffect;
        private int duration;
    }
}
