package net.daisyquest.daisyquestgame.Model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "simulation_logs")
public class SimulationLog {
    @Id
    private String id;
    private String castleId;
    private LocalDateTime timestamp;
    private List<String> events;
    private int initialDefenderCount;
    private int finalDefenderCount;
    private int initialAttackerCount;
    private int finalAttackerCount;
    private boolean castleSurvived;
    private int damageToCastle;
}