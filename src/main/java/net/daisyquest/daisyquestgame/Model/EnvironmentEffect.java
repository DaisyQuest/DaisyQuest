package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "environment_effects")
public class EnvironmentEffect {
        @Id
    String id;
    String name;
    String description;
    Map<String, Integer> attributeChangePercentageMap;
    Map<String, Integer> attributeChangeIntegerMap;
    List<StatusEffect> environmentStatusEffect;

}
