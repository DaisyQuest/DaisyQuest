package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.EquipmentProperty;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EquipmentPropertyService {
    List<EquipmentProperty> getInitialEquipmentPropertiesForPlayer(){
        List<EquipmentProperty> returnList = new ArrayList<>();
        EquipmentProperty meleeDamageBonus = new EquipmentProperty("Melee Damage Bonus",
                "Melee Bonus",
                "Melee +",
                EquipmentProperty.PropertyType.ADDITITIVE,
                0,
                0);
        returnList.add(meleeDamageBonus);
        EquipmentProperty spellDamageBonus = new EquipmentProperty("Spell Damage Bonus",
                "Spell Bonus",
                "Magic +",
                EquipmentProperty.PropertyType.ADDITITIVE,
                0,
                0
                );
        return returnList;

    }
E
}
