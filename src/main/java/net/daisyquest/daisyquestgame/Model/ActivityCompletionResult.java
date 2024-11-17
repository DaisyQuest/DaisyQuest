package net.daisyquest.daisyquestgame.Model;


import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ActivityCompletionResult {
    private int experienceGained;
    private Map<String, Integer> attributeIncreases;
    private List<Reward> rewards;

    @Data
    public static class Reward {
        private String name;
        private int amount;
    }
}