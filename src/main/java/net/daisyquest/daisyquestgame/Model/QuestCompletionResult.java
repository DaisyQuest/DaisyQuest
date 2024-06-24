package net.daisyquest.daisyquestgame.Model;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;
import java.util.List;

public class QuestCompletionResult {
    @Getter @Setter
    private int experienceGained;
    @Getter @Setter

    private Map<String, Integer> attributeIncreases;
    @Getter @Setter
    private List<Reward> rewards;

    // Getters and setters...

    public static class Reward {
        @Getter @Setter

        private String name;
        @Getter @Setter

        private int amount;

        // Getters and setters...
    }
}