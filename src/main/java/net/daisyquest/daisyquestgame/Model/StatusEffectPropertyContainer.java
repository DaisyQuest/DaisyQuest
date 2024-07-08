package net.daisyquest.daisyquestgame.Model;

import lombok.Data;

@Data
public class StatusEffectPropertyContainer {
    private String id;
    private String name;
    private StatusEffectPropertyType type;
    private String moreData;
    private int amount;
    private String formatString;

    public StatusEffectPropertyContainer(String id, String name, StatusEffectPropertyType type, String moreData, int amount, String formatString) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.moreData = moreData;
        this.amount = amount;
        this.formatString = formatString;
    }
}

