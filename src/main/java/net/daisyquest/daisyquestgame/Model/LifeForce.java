package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import lombok.Getter;

@Data
public class LifeForce {
    LifeForce.TYPE type;
    int maxAmount;
    int currentAmount;
    int modifiedMaxAmount;

    @Getter
    public enum TYPE {
        HITPOINTS("Hitpoints", "HP", "FF0000"), MANA("Mana", "MANA","0000FF" );
        String name;
        String shortName;
        String color;
        String sprite;

        TYPE(String name, String shortName, String colorRGB){
            this.name = name;
            this.shortName = shortName;
            this.color = colorRGB;
        }
    }


}
