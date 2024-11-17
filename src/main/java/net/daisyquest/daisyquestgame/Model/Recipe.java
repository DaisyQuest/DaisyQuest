package net.daisyquest.daisyquestgame.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "recipes")
public class Recipe {
    @Id
    private String id;
    private String name;
    private Map<String, Integer> requiredItemIdsAndAmounts;
    private Map<String, Integer> attributeRequirements;
    private Map<String, Integer> attributeExperienceRewardAmounts; //ATTRIBUTE_NAME -> AMOUNT
    private String resultItemId;
    private String discoveredBy;
    private long discoveryDateTime;
}