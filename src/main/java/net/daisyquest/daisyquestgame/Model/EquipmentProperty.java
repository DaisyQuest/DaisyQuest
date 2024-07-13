package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EquipmentProperty {
    public EquipmentProperty(String id, String name, String shortName, PropertyType type, int defaultAmount, double amountMultiplicative) {
        this.id = id;
        this.name = name;
        this.shortName = shortName;
        this.type = type;
        this.defaultAmount = defaultAmount;
        this.amountMultiplicative = amountMultiplicative;
    }

    @org.springframework.data.annotation.Id
    String id;
    String name;
    String shortName;
    PropertyType type;
    int defaultAmount;
    double amountMultiplicative;

    List<String> spellUnlockIds = new ArrayList<>();
    List<String> specialAttackUnlocksIds = new ArrayList<>();

    public enum PropertyType {
        ADDITITIVE, MULTIPLICATIVE, NON_QUANTITATIVE, HIDDEN
    }
}
