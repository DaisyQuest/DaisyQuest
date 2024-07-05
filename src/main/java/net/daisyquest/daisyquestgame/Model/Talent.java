package net.daisyquest.daisyquestgame.Model;

public enum Talent {
    FIREBALL_MASTERY("fireball_mastery.svg"),
    ICEBALL_MASTERY("iceball_mastery.svg"),
    THUNDER_MASTERY("thunder_mastery.svg"),
    CRITICAL_STRIKE("critical_strike.svg"),
    DODGE("dodge.svg"),
    RESOURCE_EFFICIENCY("resource_efficiency.svg.svg"),
    EXTRA_LOOT("extra_loot.svg"),
    MANA_REGENERATION("mana_regeneration.svg"),
    HEALTH_BOOST("health_boost.svg"),
    SPELL_POWER("spell_power.svg");

    private final String spriteFilename;

    Talent(String spriteFilename) {
        this.spriteFilename = spriteFilename;
    }

    public String getSpriteFilename() {
        return spriteFilename;
    }
}

