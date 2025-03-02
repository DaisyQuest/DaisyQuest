package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import lombok.Getter;

@Getter
public enum StatusEffectPropertyType {
    DAMAGE_PRE_TURN,
    DAMAGE_POST_TURN,
    DAMAGE_ON_ACTION,
    HEALING_PRE_TURN,
    HEALING_POST_TURN,
    VAMPIRISM_FLAT_INTEGER,
    VAMPIRISM_PERCENT_DAMAGE,
    BUFF_PERCENTAGE,
    BUFF_FLAT_INTEGER,
    DEBUFF_PERCENTAGE,
    DEBUFF_FLAT_INTEGER,
    DISABLE,
    POST_COMBAT
}
