package net.daisyquest.daisyquestgame.Model;


import lombok.Data;

@Data
public class Spell {
    private String id;
    private String name;
    private String description;
    private int manaCost;
    private int cooldown;
    private SpellEffect effect;

    public enum SpellEffect {
        DAMAGE, HEAL, BUFF, DEBUFF
    }
}
