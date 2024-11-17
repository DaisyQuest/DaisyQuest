package net.daisyquest.daisyquestgame.Service;

import lombok.Data;
import net.daisyquest.daisyquestgame.Model.InteractionType;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Document(collection = "active_interactions")
public class ActiveInteraction {
    private String id;
    private String playerId;
    private String worldObjectId;
    private InteractionType interactionType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private InteractionStatus status;
    private Map<String, Object> stateData; // Stores interaction-specific state

    public enum InteractionStatus {
        IN_PROGRESS, COMPLETED, CANCELLED, FAILED
    }
}