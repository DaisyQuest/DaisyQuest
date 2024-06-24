package net.daisyquest.daisyquestgame.Model;


import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Data
@Document(collection = "activities")
public class Activity {
    @Id
    private String id;
    private String name;
    private String description;
    private int duration;
    private Map<String, Integer> requirements;
    private int experienceReward;
    private Map<String, Integer> attributeRewards;
    private Map<String, Integer> itemRewards;
}