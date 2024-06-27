package net.daisyquest.daisyquestgame.Service;


import net.daisyquest.daisyquestgame.Model.Combat;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.Action;
import net.daisyquest.daisyquestgame.Repository.CombatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CombatService {

    @Autowired
    private CombatRepository combatRepository;

    @Autowired
    private PlayerService playerService;

    public Combat startCombat(List<String> playerIds, Map<String, String> playerTeams) {
        Combat combat = new Combat();
        combat.setPlayerIds(playerIds);
        combat.setPlayerTeams(playerTeams);
        combat.setActive(true);
        combat.setTurnNumber(1);
        combat.setTurnDurationSeconds(30); // 30 seconds per turn

        // Initialize player health and action points
        Map<String, Integer> playerHealth = new HashMap<>();
        Map<String, Integer> playerActionPoints = new HashMap<>();
        for (String playerId : playerIds) {
            Player player = playerService.getPlayer(playerId);
            playerHealth.put(playerId, player.getAttributes().get("hitpoints").getLevel()); // Assume all players start with 100 health
            playerActionPoints.put(playerId, 2); // Start with 2 action points
        }
        combat.setPlayerHealth(playerHealth);
        combat.setPlayerActionPoints(playerActionPoints);

        // Set the first player's turn
        combat.setCurrentTurnPlayerId(playerIds.get(0));
        combat.setTurnStartTime(System.currentTimeMillis());

        return combatRepository.save(combat);
    }

    public Combat getCombat(String combatId) {
        return combatRepository.findById(combatId).orElse(null);
    }

    public Combat performAction(String combatId, Action action) {
        Combat combat = getCombat(combatId);
        if (combat == null || !combat.isActive()) {
            throw new IllegalStateException("Combat not found or not active");
        }

        if (!combat.getCurrentTurnPlayerId().equals(action.getPlayerId())) {
            throw new IllegalStateException("It's not this player's turn");
        }

        if (combat.getPlayerActionPoints().get(action.getPlayerId()) < action.getActionPoints()) {
            throw new IllegalStateException("Not enough action points");
        }

        // Perform the action (simplified for now)
        switch (action.getType()) {
            case ATTACK:
                int damage = 10; // Simplified damage calculation
                int newHealth = combat.getPlayerHealth().get(action.getTargetPlayerId()) - damage;
                combat.getPlayerHealth().put(action.getTargetPlayerId(), Math.max(0, newHealth));
                break;
            // Implement other action types...
        }

        // Deduct action points
        int remainingActionPoints = combat.getPlayerActionPoints().get(action.getPlayerId()) - action.getActionPoints();
        combat.getPlayerActionPoints().put(action.getPlayerId(), remainingActionPoints);

        // Check if the turn should end
        if (remainingActionPoints == 0 || isTimeLimitExceeded(combat)) {
            endTurn(combat);
        }

        // Check if combat should end
        if (shouldCombatEnd(combat)) {
            endCombat(combat);
        }

        return combatRepository.save(combat);
    }

    private boolean isTimeLimitExceeded(Combat combat) {
        long currentTime = System.currentTimeMillis();
        return (currentTime - combat.getTurnStartTime()) / 1000 > combat.getTurnDurationSeconds();
    }

    private void endTurn(Combat combat) {
        int currentPlayerIndex = combat.getPlayerIds().indexOf(combat.getCurrentTurnPlayerId());
        int nextPlayerIndex = (currentPlayerIndex + 1) % combat.getPlayerIds().size();
        combat.setCurrentTurnPlayerId(combat.getPlayerIds().get(nextPlayerIndex));
        combat.setTurnStartTime(System.currentTimeMillis());
        combat.setTurnNumber(combat.getTurnNumber() + 1);

        // Reset action points for the new player
        combat.getPlayerActionPoints().put(combat.getCurrentTurnPlayerId(), 2);
    }

    private boolean shouldCombatEnd(Combat combat) {
        if (combat.getPlayerTeams().isEmpty()) {
            // Free-for-all: combat ends when only one player is alive
            return combat.getPlayerHealth().values().stream().filter(health -> health > 0).count() <= 1;
        } else {
            // Team battle: combat ends when all players of a team are defeated
            Set<String> remainingTeams = combat.getPlayerHealth().entrySet().stream()
                    .filter(entry -> entry.getValue() > 0)
                    .map(entry -> combat.getPlayerTeams().get(entry.getKey()))
                    .collect(Collectors.toSet());
            return remainingTeams.size() <= 1;
        }
    }

    private void endCombat(Combat combat) {
        combat.setActive(false);

        // Determine winner(s)
        List<String> winners;
        if (combat.getPlayerTeams().isEmpty()) {
            winners = combat.getPlayerHealth().entrySet().stream()
                    .filter(entry -> entry.getValue() > 0)
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());
        } else {
            String winningTeam = combat.getPlayerHealth().entrySet().stream()
                    .filter(entry -> entry.getValue() > 0)
                    .map(entry -> combat.getPlayerTeams().get(entry.getKey()))
                    .findFirst().orElse(null);
            winners = combat.getPlayerTeams().entrySet().stream()
                    .filter(entry -> entry.getValue().equals(winningTeam))
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());
        }

        // Grant rewards to winners and penalize losers
        for (String playerId : combat.getPlayerIds()) {
            Player player = playerService.getPlayer(playerId);
            if (winners.contains(playerId)) {
                player.setTotalExperience(player.getTotalExperience() + 100); // Grant 100 XP for winning
            } else {
                // Subtract half of the loser's currency (assuming a "gold" currency)
                int currentGold = player.getCurrencies().getOrDefault("gold", 0);
                player.getCurrencies().put("gold", currentGold / 2);
            }
            playerService.updatePlayer(player);
        }
    }
}
