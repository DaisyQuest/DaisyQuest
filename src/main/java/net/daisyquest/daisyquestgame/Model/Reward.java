package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "rewards")
@Data
public class Reward {
    private RewardType type;
    private String rewardId; // Could be currency ID, resource ID, item ID, or attribute name
    private int quantity;
    public Reward(){

    }
    public Reward(RewardType rewardType, String hitpoints, int hitpointsExperience) {
        type = rewardType;
        rewardId = hitpoints;
        quantity = 100;
    }

    // Constructor, getters, and setters


}
