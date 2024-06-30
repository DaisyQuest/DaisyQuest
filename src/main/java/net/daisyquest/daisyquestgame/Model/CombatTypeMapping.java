package net.daisyquest.daisyquestgame.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.Map;

@Document(collection = "combat_type_mappings")
public class CombatTypeMapping {
    @Id
    private String id;
    private Map<String, Map<String, Double>> strengthWeaknessMap = new HashMap<>();

    public void addMapping(String attackTypeId, String defenseTypeId, double multiplier) {
        strengthWeaknessMap
                .computeIfAbsent(attackTypeId, k -> new HashMap<>())
                .put(defenseTypeId, multiplier);
    }

    public double getMultiplier(String attackTypeId, String defenseTypeId) {
        return strengthWeaknessMap
                .getOrDefault(attackTypeId, Map.of())
                .getOrDefault(defenseTypeId, 1.0);
    }
}
