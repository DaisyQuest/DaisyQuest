package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "reward_containers")
public class RewardContainer {
    private String id;
    private List<Reward> rewards = new ArrayList<>();
    private Map<String, Double> multipliers = new HashMap<>(); // For applying multipliers to specific reward types or IDs
    private String playerId;
    // Other methods as needed
}
