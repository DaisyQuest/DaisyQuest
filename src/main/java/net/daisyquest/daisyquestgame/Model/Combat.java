package net.daisyquest.daisyquestgame.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "combats")
public class Combat {
    @Id
    private String id;
    private List<String> playerIds;
    private Map<String, String> playerTeams;
    private String currentTurnPlayerId;
    private int turnNumber;
    private boolean active;
    private long turnStartTime;
    private int turnDurationSeconds;
    private Map<String, Integer> playerHealth;
    private Map<String, Integer> playerActionPoints;
    private Instant createdAt;
    private Map<String, Map<String, Integer>> spellCooldowns = new HashMap<>(); // New field for tracking spell cooldowns

}
