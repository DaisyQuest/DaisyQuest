package net.daisyquest.daisyquestgame.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Document(collection = "combats")
public class Combat {
    @Id
    private String id;
    private List<String> playerIds;
    private Map<String, String> playerTeams; // playerId -> teamId
    private String currentTurnPlayerId;
    private int turnNumber;
    private boolean isActive;
    private long turnStartTime;
    private int turnDurationSeconds;
    private Map<String, Integer> playerActionPoints;
    private Map<String, Integer> playerHealth;
}

