package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
public class StatusEffectInfo {
    // Getters and setters
    private StatusEffect statusEffect;
        private int duration;

        public StatusEffectInfo(StatusEffect statusEffect, int duration) {
            this.statusEffect = statusEffect;
            this.duration = duration;
        }
        public StatusEffectInfo(){

        }
}

