package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EquipmentProperty {
    @org.springframework.data.annotation.Id
    String id;
    String name;
    String shortName;
    PropertyType type;
    int defaultAmount;
    double amountMultiplicative;

    public enum PropertyType {
        ADDITITIVE, MULTIPLICATIVE, NON_QUANTITATIVE, HIDDEN
    }
}
