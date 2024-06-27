package net.daisyquest.daisyquestgame.Service;

import lombok.extern.java.Log;
import net.daisyquest.daisyquestgame.Model.Combat;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.Action;
import net.daisyquest.daisyquestgame.Model.Spell;
import net.daisyquest.daisyquestgame.Repository.CombatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CombatService {
    private static final Logger logger = LoggerFactory.getLogger(CombatService.class);
    @Autowired
    private CombatRepository combatRepository;

    @Autowired
    private PlayerService playerService;

    @Autowired
    private Random random;

    @Autowired
    private SpellService spellService;

    private static final int TURN_DURATION_SECONDS = 5;
    private static final int COMBAT_EXPIRATION_MINUTES = 2;
    private static final int INITIAL_HEALTH = 100;
    private static final int INITIAL_ACTION_POINTS = 1;
    private static final int MAX_TURNS = 100;

    public Combat startCombat(List<String> playerIds, Map<String, String> playerTeams) {
        logger.info("Starting new combat with players: {}", playerIds);
        Combat combat = new Combat();
        combat.setPlayerIds(playerIds);
        combat.setPlayerTeams(playerTeams);
        combat.setActive(true);
        combat.setTurnNumber(1);
        combat.setTurnDurationSeconds(TURN_DURATION_SECONDS);
        combat.setCreatedAt(Instant.now());

        Map<String, Integer> playerHealth = new HashMap<>();
        Map<String, Integer> playerActionPoints = new HashMap<>();
        for (String playerId : playerIds) {
            playerHealth.put(playerId, INITIAL_HEALTH);
            playerActionPoints.put(playerId, INITIAL_ACTION_POINTS);
        }
        combat.setPlayerHealth(playerHealth);
        combat.setPlayerActionPoints(playerActionPoints);

        combat.setCurrentTurnPlayerId(playerIds.get(0));
        combat.setTurnStartTime(Instant.now().toEpochMilli());

        Combat savedCombat = combatRepository.save(combat);
        logger.info("Combat started: {}", savedCombat);
        return savedCombat;
    }

    public Combat performAction(String combatId, Action action) {
        logger.info("Performing action for combat {}: {}", combatId, action);
        Combat combat = getCombat(combatId);
        if (combat == null || !combat.isActive()) {
            logger.warn("Combat not found or not active: {}", combatId);
            throw new IllegalStateException("Combat not found or not active");
        }

        String currentPlayerId = combat.getCurrentTurnPlayerId();
        logger.info("Current turn: {}", currentPlayerId);

        if (isAIPlayer(currentPlayerId)) {
            action = generateAIAction(combat, currentPlayerId);
            logger.info("Generated AI action: {}", action);
        } else if (action == null) {
            logger.warn("Null action provided for human player");
            throw new IllegalArgumentException("Action cannot be null for human players");
        } else if (!currentPlayerId.equals(action.getPlayerId())) {
            logger.warn("Action attempted by wrong player. Expected: {}, Actual: {}", currentPlayerId, action.getPlayerId());
            throw new IllegalStateException("It's not this player's turn");
        }
        // Perform the action
        switch (action.getType()) {
            case ATTACK:
                performAttack(combat, action);
                break;
            case SPECIAL_ATTACK:
                performSpecialAttack(combat, action);
                break;
            case SPELL:
                performSpell(combat, action);
                break;
            case TACTICS:
                performTactics(combat, action);
                break;
        }

        // Deduct action points
        int remainingActionPoints = combat.getPlayerActionPoints().get(currentPlayerId) - action.getActionPoints();
        combat.getPlayerActionPoints().put(currentPlayerId, remainingActionPoints);

        // Check if the turn should end
        if (remainingActionPoints == 0 || isTimeLimitExceeded(combat)) {
            logger.info("Ending turn for player {}", currentPlayerId);
            endTurn(combat);
        }

        // Check if combat should end
        if (shouldCombatEnd(combat)) {
            logger.info("Combat {} should end", combatId);
            endCombat(combat);
        }

        Combat updatedCombat = combatRepository.save(combat);
        logger.info("Updated combat state: {}", updatedCombat);
        return updatedCombat;
    }

    public Combat getCombat(String combatId) {
        return combatRepository.findById(combatId).orElse(null);
    }

    private boolean isAIPlayer(String playerId) {
        return playerId.startsWith("AI");  // Assuming AI players have IDs starting with "AI"
    }

    private Action generateAIAction(Combat combat, String aiPlayerId) {
        // Simple AI decision making
        List<String> possibleTargets = combat.getPlayerIds().stream()
                .filter(id -> !id.equals(aiPlayerId) && combat.getPlayerHealth().get(id) > 0)
                .collect(Collectors.toList());

        if (possibleTargets.isEmpty()) {
            throw new IllegalStateException("No valid targets for AI action");
        }

        String targetId = possibleTargets.get(random.nextInt(possibleTargets.size()));
        Action.ActionType actionType = Action.ActionType.values()[random.nextInt(Action.ActionType.values().length)];

        return new Action(aiPlayerId, actionType, targetId, 1, null);  // Assuming all actions cost 1 AP for simplicity
    }
    private void performAttack(Combat combat, Action action) {
        int damage = calculateDamage(action.getPlayerId(), 10, 20);
        applyDamage(combat, action.getTargetPlayerId(), damage);
    }

    private void performSpecialAttack(Combat combat, Action action) {
        int damage = calculateDamage(action.getPlayerId(), 15, 30);
        applyDamage(combat, action.getTargetPlayerId(), damage);
    }

    private void performSpell(Combat combat, Action action) {
        Player caster = playerService.getPlayer(action.getPlayerId());
        Spell spell = spellService.getSpell(action.getSpellId());

        if (!canCastSpell(combat, caster, spell)) {
            return;
         //   throw new IllegalStateException("Cannot cast spell: insufficient mana or on cooldown");
        }

        applySpellEffect(combat, caster, action.getTargetPlayerId(), spell);
        updateSpellCooldown(combat, caster.getId(), spell);
        updatePlayerMana(caster, spell.getManaCost());
    }

    private boolean canCastSpell(Combat combat, Player caster, Spell spell) {
        if(spell == null) return false;
        if (caster.getCurrentMana() < spell.getManaCost()) {
            return false;
        }

        Map<String, Integer> playerCooldowns = combat.getSpellCooldowns().get(caster.getId());
        if (playerCooldowns != null && playerCooldowns.containsKey(spell.getId())) {
            return playerCooldowns.get(spell.getId()) <= 0;
        }

        return true;
    }

    private void applySpellEffect(Combat combat, Player caster, String targetPlayerId, Spell spell) {
        switch (spell.getEffect()) {
            case DAMAGE:
                int damage = calculateSpellDamage(caster, spell);
                logger.info("Spell Damage: " + damage);
                applyDamage(combat, targetPlayerId, damage);
                break;
            case HEAL:
                int healing = calculateSpellHealing(caster, spell);
                applyHealing(combat, targetPlayerId, healing);
                break;
            case BUFF:
                // Implement buff logic
                break;
            case DEBUFF:
                // Implement debuff logic
                break;
        }
    }

    private void applyHealing(Combat combat, String targetPlayerId, int healing) {

    }

    private int calculateSpellHealing(Player caster, Spell spell) {
        return 10;
    }

    private int calculateSpellDamage(Player caster, Spell spell) {
        return 95;
    }

    private void updateSpellCooldown(Combat combat, String playerId, Spell spell) {
        combat.getSpellCooldowns().computeIfAbsent(playerId, k -> new HashMap<>())
                .put(spell.getId(), spell.getCooldown());
    }

    private void updatePlayerMana(Player player, int manaCost) {
        player.setCurrentMana(Math.max(0, player.getCurrentMana() - manaCost));
        playerService.updatePlayer(player);
    }

    // ... implement other helper methods like calculateSpellDamage, calculateSpellHealing, etc. ...

// Run every second
    public void updateCooldowns() {
        List<Combat> activeCombats = combatRepository.findByActiveTrue();
        for (Combat combat : activeCombats) {
            combat.getSpellCooldowns().forEach((playerId, cooldowns) ->
                    cooldowns.replaceAll((spellId, cooldown) -> Math.max(0, cooldown - 1)));
            combatRepository.save(combat);
        }
    }


    private void performTactics(Combat combat, Action action) {
        // Implement tactical actions (e.g., increase defense, prepare for next turn)
    }

    private int calculateDamage(String playerId, int minDamage, int maxDamage) {
        if(playerId.startsWith("AI")){
            return minDamage + (int)(Math.random() * (maxDamage - minDamage + 1)) + 5;
        }

        Player player = playerService.getPlayer(playerId);
        int attackAttribute = player.getAttributes().get("combat").getLevel();
        return minDamage + (int)(Math.random() * (maxDamage - minDamage + 1)) + (attackAttribute / 10);
    }

    private void applyDamage(Combat combat, String targetPlayerId, int damage) {
        int currentHealth = combat.getPlayerHealth().get(targetPlayerId);
        int newHealth = Math.max(0, currentHealth - damage);
        combat.getPlayerHealth().put(targetPlayerId, newHealth);
    }

    private boolean isTimeLimitExceeded(Combat combat) {
        long currentTime = Instant.now().toEpochMilli();
        return (currentTime - combat.getTurnStartTime()) / 1000 > combat.getTurnDurationSeconds();
    }

    private void endTurn(Combat combat) {
        int currentPlayerIndex = combat.getPlayerIds().indexOf(combat.getCurrentTurnPlayerId());
        int nextPlayerIndex = (currentPlayerIndex + 1) % combat.getPlayerIds().size();
        combat.setCurrentTurnPlayerId(combat.getPlayerIds().get(nextPlayerIndex));
        combat.setTurnStartTime(Instant.now().toEpochMilli());
        combat.setTurnNumber(combat.getTurnNumber() + 1);

        // Reset action points for the new player
        combat.getPlayerActionPoints().put(combat.getCurrentTurnPlayerId(), INITIAL_ACTION_POINTS);
        updateCooldowns();
        //reload for cooldowns.. must better way
       combat.getSpellCooldowns().putAll(combatRepository.findById(combat.getId()).get().getSpellCooldowns());
        // End combat if max turns reached
        if (combat.getTurnNumber() > MAX_TURNS) {
            endCombat(combat);
        }
    }

    private boolean shouldCombatEnd(Combat combat) {
        long alivePlayers = combat.getPlayerHealth().values().stream().filter(health -> health > 0).count();
        logger.info("Checking if combat should end. Alive players: {}", alivePlayers);
        return alivePlayers <= 1;
    }
    private void endCombat(Combat combat) {
        logger.info("Ending combat: {}", combat.getId());
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
            if(playerId.startsWith("AI")) continue;
            Player player = playerService.getPlayer(playerId);
            if (winners.contains(playerId)) {
                player.setTotalExperience(player.getTotalExperience() + 100);
            } else {
                int currentGold = player.getCurrencies().getOrDefault("gold", 0);
                player.getCurrencies().put("gold", currentGold / 2);
            }
            playerService.updatePlayer(player);
        }
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    public void cleanupExpiredCombats() {
        Instant expirationThreshold = Instant.now().minusSeconds(COMBAT_EXPIRATION_MINUTES * 60);
        List<Combat> expiredCombats = combatRepository.findByActiveTrueAndCreatedAtBefore(expirationThreshold);
        for (Combat combat : expiredCombats) {
            endCombat(combat);
            combatRepository.save(combat);
        }
    }
    @Scheduled(fixedRate = 5000)
    public void processAITurns() {
        List<Combat> activeCombats = combatRepository.findByActiveTrue();
        logger.info("Processing AI turns for {} active combats", activeCombats.size());
        for (Combat combat : activeCombats) {
            String currentPlayerId = combat.getCurrentTurnPlayerId();
            if (isAIPlayer(currentPlayerId)) {
                logger.info("Processing AI turn for combat {} and player {}", combat.getId(), currentPlayerId);
                try {
                    performAction(combat.getId(), null);
                } catch (Exception e) {
                    logger.error("Error processing AI turn for combat " + combat.getId(), e);
                }
            }
        }
    }
}
