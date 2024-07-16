package net.daisyquest.daisyquestgame.Controller;

import lombok.Data;

import java.util.Map;

@Data
public class RecipeDTO {

    private String name;


    private String resultItemId;


    private String discoveredBy;


    private Map<String, Integer> requiredItemIdsAndAmounts;


    private Map<String, Integer> attributeRequirements;


    private Map<String, Integer> attributeExperienceRewardAmounts;

}
