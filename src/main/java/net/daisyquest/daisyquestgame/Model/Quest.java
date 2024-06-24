package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Data
@Document(collection = "quests")
public class Quest {
    @Id
    private String id;
    @Getter
    @Setter

    private String name;
    @Getter @Setter
    private String description;
    @Getter @Setter
    private Map<String, Integer> requirements;

    @Getter @Setter
    private int experienceReward;
    @Getter @Setter
    private int duration;

    @Getter @Setter
    private Map<String, Integer> attributeRewards;
    @Getter @Setter
    private Map<String, Integer> itemRewards;
}