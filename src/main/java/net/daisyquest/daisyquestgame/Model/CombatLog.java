package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "combatLogs")
public class CombatLog {
    @Id
    private String id;
    private String combatId;
    private int turnNumber;
    private String actorId;
    private String actionType;
    private String targetId;
    private String description;
    private boolean isNeutral;
    private Instant timestamp;
}