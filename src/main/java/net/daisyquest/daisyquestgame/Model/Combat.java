package net.daisyquest.daisyquestgame.Model;

import net.daisyquest.daisyquestgame.Service.StatusEffectService;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "combats")
public class Combat {
    @Id
    private String id;
    private List<String> playerIds;
    private Map<String, String> playerTeams = new HashMap<>();
    private String currentTurnPlayerId;
    private int turnNumber;
    private boolean active;
    private long turnStartTime;
    private int turnDurationSeconds;
    private Map<String, Integer> playerHealth;
    private Map<String, Integer> playerHealthStarting;
    private Map<String, Integer> playerActionPoints;
    private Map<String, Map<String, Integer>> playerEquipmentBonuses = new HashMap<>();


    private Instant createdAt;
    private List<String> combatLogIds = new ArrayList<>(); // New field to store references to combat logs
    private Map<String, Map<String, Integer>> spellCooldowns = new HashMap<>(); // New field for tracking spell cooldowns
    private TurnPhase currentPhase = TurnPhase.START_PHASE;
    private Map<String, Map<String, CombatStatusContainer>> playerStatusEffects = new HashMap<>();

    public void progressPhase() {
        switch (currentPhase) {
            case START_PHASE:
                currentPhase = TurnPhase.PLAYER_PHASE;
                break;
            case PLAYER_PHASE:
                currentPhase = TurnPhase.END_PHASE;
                break;
            case END_PHASE:
                currentPhase = TurnPhase.START_PHASE;
                turnNumber++;
                // Logic to move to next player's turn
                break;
        }
    }

    public void addStatusEffect(String playerId, StatusEffect effect, int duration) {
        playerStatusEffects
                .computeIfAbsent(playerId, k -> new HashMap<>())
                .put(effect.getId(), new CombatStatusContainer(playerId, effect, duration));
    }

    public void removeStatusEffect(String playerId, StatusEffect effect) {
        Map<String, CombatStatusContainer> playerEffects = playerStatusEffects.get(playerId);
        if (playerEffects != null) {
            playerEffects.remove(effect.getId());
        }
    }



    public void applyDamage(String playerId, int amount) {
        int currentHealth = playerHealth.get(playerId);
        playerHealth.put(playerId, Math.max(0, currentHealth - amount));
    }

    private void applyHealing(String playerId, int amount) {
        int currentHealth = playerHealth.get(playerId);
        int maxHealth = playerHealthStarting.get(playerId);
        playerHealth.put(playerId, Math.min(maxHealth, currentHealth + amount));
    }

}
