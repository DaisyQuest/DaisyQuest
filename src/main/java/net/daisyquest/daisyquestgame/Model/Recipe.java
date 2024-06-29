package net.daisyquest.daisyquestgame.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
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
    private String resultItemId;
}