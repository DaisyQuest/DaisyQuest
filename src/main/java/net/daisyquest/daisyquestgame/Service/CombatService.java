package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Repository.CombatLogRepository;
import net.daisyquest.daisyquestgame.Repository.CombatRepository;
import net.daisyquest.daisyquestgame.Service.Temp.StatusEffectTestData;
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

    @Autowired
    private StatusEffectService statusEffectService;

    @Autowired
    StatusEffectTestData testData;



    private static final int TURN_DURATION_SECONDS = 5;
    private static final int COMBAT_EXPIRATION_MINUTES = 2;
    private static final int INITIAL_HEALTH = 100;
    private static final int INITIAL_ACTION_POINTS = 1;
    private static final int MAX_TURNS = 100;
    private static final int HP_COEFFICIENT = 15;
    @Autowired
    private SpecialAttackService specialAttackService;

    public Combat startCombat(List<String> playerIds, Map<String, String> playerTeams) {
        logger.info("Starting new combat with players: {}", playerIds);
        Combat combat = new Combat();
        List<String> allParticipantIds = new ArrayList<>(playerIds);
        Map<String, String> updatedPlayerTeams = new HashMap<>(playerTeams);
        Map<String, Integer> participantHealth = new HashMap<>();
        Map<String, Integer> participantActionPoints = new HashMap<>();

        for (String playerId : playerIds) {
            Player player = playerService.getPlayer(playerId);
            String playerTeam = updatedPlayerTeams.getOrDefault(playerId, "Team" + playerId);
            updatedPlayerTeams.put(playerId, playerTeam);

            // Initialize player health and action points
            participantHealth.put(playerId, player.getAttributes().get("hitpoints").getLevel() * HP_COEFFICIENT);
            participantActionPoints.put(playerId, INITIAL_ACTION_POINTS);

            // Initialize equipment bonuses for the player
            PlayerInventory pInventory = player.getInventory();
            combat.getPlayerEquipmentBonuses().put(playerId, pInventory.calculateEffectiveEquipmentBonuses());

            // Add controlled entities to the combat
            if (player.getPlayerControlledEntityIds() != null) {
                for (String controlledEntityId : player.getPlayerControlledEntityIds()) {
                    allParticipantIds.add(controlledEntityId);
                    updatedPlayerTeams.put(controlledEntityId, playerTeam);

                    // Initialize controlled entity health and action points
                    // You may need to adjust this based on how controlled entities' attributes are stored
                    Player controlledEntity = playerService.getPlayer(controlledEntityId);
                    participantHealth.put(controlledEntityId, controlledEntity.getAttributes().get("hitpoints").getLevel() * HP_COEFFICIENT);
                    participantActionPoints.put(controlledEntityId, INITIAL_ACTION_POINTS);

                    // Initialize equipment bonuses for controlled entities if applicable
                    // combat.getPlayerEquipmentBonuses().put(controlledEntityId, controlledEntity.calculateEffectiveEquipmentBonuses());
                }
            }
        }

        combat.setPlayerIds(allParticipantIds);
        combat.setActive(true);
        combat.setTurnNumber(1);
        combat.setTurnDurationSeconds(TURN_DURATION_SECONDS);
        combat.setCreatedAt(Instant.now());
        combat.setPlayerTeams(updatedPlayerTeams);
        combat.setPlayerHealth(participantHealth);
        combat.setPlayerHealthStarting(Map.copyOf(participantHealth));
        combat.setPlayerActionPoints(participantActionPoints);
        combat.setCurrentTurnPlayerId(allParticipantIds.get(0));
        combat.setTurnStartTime(Instant.now().toEpochMilli());

        Combat savedCombat = combatRepository.save(combat);
        logger.info("Combat started: {}", savedCombat);
        return savedCombat;
    }

    @Autowired
    private CombatLogRepository combatLogRepository;

    //STATUS EFFECT MIGRATION TEST START:

    public void applyPlayerStatusEffects(Combat combat, TurnPhase phase) {
        for (String playerId : combat.getPlayerIds()) {
            Map<String, CombatStatusContainer> playerEffects = combat.getPlayerStatusEffects().get(playerId);
            if (playerEffects == null) continue;

            for (Map.Entry<String, CombatStatusContainer> entry : playerEffects.entrySet()) {
                StatusEffect effect = statusEffectService.getStatusEffect(entry.getKey());
                CombatStatusContainer container = entry.getValue();

                for (StatusEffectPropertyContainer property : effect.getProperties()) {
                    switch (property.getType()) {
                        case DAMAGE_PRE_TURN:
                            if (phase == TurnPhase.START_PHASE) {
                                applyDamage(combat, playerId, property.getAmount());
                                createCombatLog(combat, "System", "STATUS_EFFECT", playerId,
                                        String.format("%s takes %d damage from %s", playerId, property.getAmount(), effect.getDisplayName()));
                            }
                            break;
                        case DAMAGE_POST_TURN:
                            if (phase == TurnPhase.END_PHASE) {
                                applyDamage(combat, playerId, property.getAmount());
                                createCombatLog(combat, "System", "STATUS_EFFECT", playerId,
                                        String.format("%s takes %d damage from %s", playerId, property.getAmount(), effect.getDisplayName()));
                            }
                            break;
                        case HEALING_PRE_TURN:
                            if (phase == TurnPhase.START_PHASE) {
                                applyHealing(combat, playerId, property.getAmount());
                                createCombatLog(combat, "System", "STATUS_EFFECT", playerId,
                                        String.format("%s heals %d HP from %s", playerId, property.getAmount(), effect.getDisplayName()));
                            }
                            break;
                        case HEALING_POST_TURN:
                            if (phase == TurnPhase.END_PHASE) {
                                applyHealing(combat, playerId, property.getAmount());
                                createCombatLog(combat, "System", "STATUS_EFFECT", playerId,
                                        String.format("%s heals %d HP from %s", playerId, property.getAmount(), effect.getDisplayName()));
                            }
                            break;
                        // Add other cases as needed
                    }
                }

                if (phase == TurnPhase.END_PHASE) {
                    container.decrementDurations();
                    createCombatLog(combat, "System", "STATUS_EFFECT", playerId,
                            String.format("%s duration decreased for %s", effect.getDisplayName(), playerId));
                }
            }

            if (phase == TurnPhase.END_PHASE) {
                playerEffects.entrySet().removeIf(entry -> {
                    boolean removed = entry.getValue().getRemainingDuration(statusEffectService.getStatusEffect(entry.getKey())) <= 0;
                    if (removed) {
                        createCombatLog(combat, "System", "STATUS_EFFECT", playerId,
                                String.format("%s expired for %s", statusEffectService.getStatusEffect(entry.getKey()).getDisplayName(), playerId));
                    }
                    return removed;
                });
            }
        }
    }
    private void createCombatLog(Combat combat, String actorId, String actionType, String targetId, String description) {
        CombatLog log = new CombatLog();
        log.setCombatId(combat.getId());
        log.setTurnNumber(combat.getTurnNumber());
        log.setActorId(actorId);
        log.setActionType(actionType);
        log.setTargetId(targetId);
        log.setDescription(description);
        log.setTimestamp(Instant.now());
        log.setNeutral(false);
        combatLogRepository.save(log);
        combat.getCombatLogIds().add(log.getId());
    }






    ///






    private String generateActionDescription(String actionType, String actorId, String targetId, String spellId) {
        // Implement logic to generate a human-readable description of the action
        // This is a placeholder implementation

        if(spellId != null){
            return  String.format("%s performed %s on %s", actorId,  spellService.getSpell(spellId).getName(), targetId);
        }

        return String.format("%s performed %s on %s", actorId, actionType.equals("NONE") ? "UNIMPLEMENTED_ACTION" : actionType, targetId);
    }

    // Add a method to retrieve combat logs
    public List<CombatLog> getCombatLogs(String combatId) {
        return combatLogRepository.findByCombatIdOrderByTimestampAsc(combatId);
    }

    public Combat performAction(String combatId, Action action) {
        Combat combat = getCombat(combatId);
        if (combat == null || !combat.isActive()) {
            throw new IllegalStateException("Combat not found or not active");
        }

        String currentPlayerId = combat.getCurrentTurnPlayerId();
        Player currentPlayer = playerService.getPlayer(currentPlayerId);

        // Check if the current player is controlled by another player
        if (currentPlayer.getControllerPlayerID() != null) {
            // For now, automatically select the "Attack" action
            action = new Action(currentPlayerId, Action.ActionType.ATTACK, selectRandomTarget(combat, currentPlayerId), 1, null);
        } else if (!currentPlayerId.equals(action.getPlayerId())) {
            throw new IllegalStateException("It's not this player's turn");
        }

        // Log the action
        createCombatLog(combat, action.getPlayerId(), action.getType().toString(), action.getTargetPlayerId(),
                generateActionDescription(action.getType().toString(), action.getPlayerId(), action.getTargetPlayerId(), action.getSpellId()));

        // Pre-action phase
        applyPlayerStatusEffects(combat, TurnPhase.PLAYER_PHASE);
        preActionPhase(combat, action);

        // Action phase
        actionPhase(combat, action);

        // Post-action phase
        postActionPhase(combat, action);

        // Check if the turn should end
        if (shouldEndTurn(combat)) {
            endTurn(combat);
        }

        // Check if combat should end
        if (shouldCombatEnd(combat)) {
            endCombat(combat);
        }

        return combatRepository.save(combat);
    }
    private void preActionPhase(Combat combat, Action action) {
        // Apply pre-action effects, e.g., interrupts, counter-attacks
        // You can add more logic here as needed
    }

    private void actionPhase(Combat combat, Action action) {
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
            case NONE:
                // Do nothing for NONE action
                break;
        }
    }

    private void postActionPhase(Combat combat, Action action) {
        // Apply post-action effects, e.g., damage-on-action status effects
        applyDamageOnActionEffects(combat, action.getPlayerId());

        // Deduct action points
        int remainingActionPoints = combat.getPlayerActionPoints().get(action.getPlayerId()) - action.getActionPoints();
        combat.getPlayerActionPoints().put(action.getPlayerId(), remainingActionPoints);
    }

    private void applyDamageOnActionEffects(Combat combat, String playerId) {
        Map<String, CombatStatusContainer> playerEffects = combat.getPlayerStatusEffects().get(playerId);
        if (playerEffects != null) {
            for (Map.Entry<String, CombatStatusContainer> entry : playerEffects.entrySet()) {
                StatusEffect effect = statusEffectService.getStatusEffect(entry.getKey());
                for (StatusEffectPropertyContainer property : effect.getProperties()) {
                    if (property.getType() == StatusEffectPropertyType.DAMAGE_ON_ACTION) {
                        combat.applyDamage(playerId, property.getAmount());
                    }
                }
            }
        }
    }

    public Combat getCombat(String combatId) {
        Combat c =  combatRepository.findById(combatId).orElse(null);
        if(c != null && c.getPlayerTeams() == null){
            c.setPlayerTeams(new HashMap<>());
        }
        return c;
    }

    private boolean isAIPlayer(String playerId) {
        return playerId.startsWith("AI") || playerService.getPlayer(playerId).isNPC();  // Assuming AI players have IDs starting with "AI"
    }

    private Action generateAIAction(Combat combat, String aiPlayerId) {
        logger.info("Generating AI action for player: {}", aiPlayerId);

        String aiTeam = combat.getPlayerTeams().get(aiPlayerId);

        // Filter out teammates and defeated players
        List<String> possibleTargets = combat.getPlayerIds().stream()
                .filter(id -> {
                    String targetTeam = combat.getPlayerTeams().get(id);
                    boolean isAlive = combat.getPlayerHealth().get(id) > 0;
                    boolean isDifferentTeam = aiTeam == null || !aiTeam.equals(targetTeam);
                    return !id.equals(aiPlayerId) && isAlive && isDifferentTeam;
                })
                .toList();

        if (possibleTargets.isEmpty()) {
            logger.warn("No valid targets for AI action. AI player: {}", aiPlayerId);
            return new Action(aiPlayerId, Action.ActionType.NONE, null, 0, null);
        }

        String targetId = possibleTargets.get(random.nextInt(possibleTargets.size()));
        Action.ActionType actionType = Action.ActionType.values()[random.nextInt(Action.ActionType.values().length)];

        // If the action type is SPELL, select a random spell
        String spellId = null;
        if (actionType == Action.ActionType.SPELL) {
            Player aiPlayer = playerService.getPlayer(aiPlayerId);
            List<Spell> availableSpells = aiPlayer.getKnownSpells();
            if (!availableSpells.isEmpty()) {
                Spell selectedSpell = availableSpells.get(random.nextInt(availableSpells.size()));
                spellId = selectedSpell.getId();
            } else {
                // If no spells are available, default to ATTACK
                actionType = Action.ActionType.ATTACK;
            }
        }else if(actionType == Action.ActionType.NONE){
            actionType = Action.ActionType.ATTACK;
        }

        logger.info("AI action generated. Type: {}, Target: {}, Spell: {}", actionType, targetId, spellId);
        return new Action(aiPlayerId, actionType, targetId, 1, spellId);
    }

    private void performAttack(Combat combat, Action action) {
        int damage = calculateDamage(action.getPlayerId(), 10, 20, getMeleeBonusOfAttackingPlayer(combat, action), 1);
        applyDamage(combat, action.getTargetPlayerId(), damage);
        createCombatLog(combat, action.getPlayerId(), "ATTACK", action.getTargetPlayerId(),
                String.format("%s deals %d damage to %s", action.getPlayerId(), damage, action.getTargetPlayerId()));
    }

    private static Integer getMeleeBonusOfAttackingPlayer(Combat combat, Action action) {
        try {
            return combat.getPlayerEquipmentBonuses().get(action.getPlayerId()).get("Melee Bonus");
        }catch(Exception e){
            return 0;
            }
        }
    private static Integer getMeleeBonusOfPlayerById(Combat c, String playerId) {
        return c.getPlayerEquipmentBonuses().get(playerId).get("Melee Bonus");
    }

    private static Integer getSpellBonusOfAttackingPlayer(Combat combat, Action action) {
        return combat.getPlayerEquipmentBonuses().get(action.getPlayerId()).get("Spell Bonus");
    }


    private void performSpecialAttack(Combat combat, Action action) {
        Player attacker = playerService.getPlayer(action.getPlayerId());
        SpecialAttack specialAttack = specialAttackService.getSpecialAttack(action.getSpecialAttackId());

        if (!canPerformSpecialAttack(combat, attacker, specialAttack)) {
            return;
        }

        applySpecialAttackEffect(combat, attacker, action.getTargetPlayerId(), specialAttack);
        updateSpecialAttackCooldown(combat, attacker.getId(), specialAttack);
    }

    private boolean canPerformSpecialAttack(Combat combat, Player attacker, SpecialAttack specialAttack) {
        if (specialAttack == null) return false;

        Map<String, Integer> playerCooldowns = combat.getSpellCooldowns().get(attacker.getId());
        if (playerCooldowns != null && playerCooldowns.containsKey(specialAttack.getId())) {
            return playerCooldowns.get(specialAttack.getId()) <= 0;
        }

        return true;
    }

    private void applySpecialAttackEffect(Combat combat, Player attacker, String targetPlayerId, SpecialAttack specialAttack) {
        for (int i = 0; i < specialAttack.getAttackQuantity(); i++) {
            int damage = calculateDamage(attacker.getId(), 5, 10, getMeleeBonusOfPlayerById(combat, attacker.getId()), 1);
            applyDamage(combat, targetPlayerId, damage);
            createCombatLog(combat, attacker.getId(), "SPECIAL_ATTACK", targetPlayerId,
                    String.format("%s deals %d damage to %s with %s (Hit %d/%d)",
                            attacker.getUsername(), damage, targetPlayerId, specialAttack.getName(), i + 1, specialAttack.getAttackQuantity()));
        }

        for (SpecialAttack.StatusEffectApplication sEA : specialAttack.getStatusEffects()) {
            statusEffectService.applyStatusEffect(combat, targetPlayerId, sEA.getStatusEffect(), sEA.getDuration());
        }
    }

    private void updateSpecialAttackCooldown(Combat combat, String playerId, SpecialAttack specialAttack) {
        combat.getSpellCooldowns().computeIfAbsent(playerId, k -> new HashMap<>())
                .put(specialAttack.getId(), specialAttack.getCooldown());
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
       for(Spell.StatusEffectApplication sEA : spell.getStatusEffects()){
           statusEffectService.applyStatusEffect(combat, targetPlayerId, sEA.getStatusEffect(), sEA.getDuration());
           System.err.println("Status Effect Applied");
       }


        switch (spell.getEffect()) {
            case DAMAGE:
                int damage = calculateSpellDamage(caster, spell, getSpellBonusOfAttackingPlayer(combat, caster.getId()));
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

    private static Integer getSpellBonusOfAttackingPlayer(Combat combat, String playerId) {
        return combat.getPlayerEquipmentBonuses().get(playerId).get("Spell Bonus");
    }

    private void applyHealing(Combat combat, String targetPlayerId, int healing) {

    }

    private int calculateSpellHealing(Player caster, Spell spell) {
        return 10;
    }

    private int calculateSpellDamage(Player caster, Spell spell, int bonusAmount) {
        return spell.getManaCost() * 2 + bonusAmount;
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
        if (!isAIPlayer(action.getTargetPlayerId()) || isAIPlayer(action.getPlayerId())) {
            // Only allow non-NPC players to capture NPC players
            return;
        }

        Player capturingPlayer = playerService.getPlayer(action.getPlayerId());
        Player targetNPC = playerService.getPlayer(action.getTargetPlayerId());

        if (attemptCapture(capturingPlayer, targetNPC)) {
            captureNPC(combat, capturingPlayer, targetNPC);
        } else {
            createCombatLog(combat, action.getPlayerId(), "CAPTURE_ATTEMPT", action.getTargetPlayerId(),
                    String.format("%s attempted to capture %s but failed!", capturingPlayer.getUsername(), targetNPC.getUsername()));
        }
    }

    private boolean attemptCapture(Player capturingPlayer, Player targetNPC) {
        // Check if the player has the required capture item
//        if (!playerHasCaptureItem(capturingPlayer)) {
//            return false;
//        }

        // Calculate capture chance
        double captureChance = calculateCaptureChance(capturingPlayer, targetNPC);

        // Determine if capture is successful
        return Math.random() < captureChance;
    }

    private boolean playerHasCaptureItem(Player player) {
        return player.getInventory().hasItem(CAPTURE_ITEM_ID);
    }
    private static final String CAPTURE_ITEM_ID = "npc-capture-device"; // ID of the item required for capture
    private static final double BASE_CAPTURE_CHANCE = 0.5; // 50%
    private double calculateCaptureChance(Player capturingPlayer, Player targetNPC) {
        // For now, we'll just return the base chance
        // In the future, this could be modified based on various factors
        return BASE_CAPTURE_CHANCE;
    }
    @Autowired
    private ItemService itemService;
    private void captureNPC(Combat combat, Player capturingPlayer, Player targetNPC) {
        // Remove capture item from player's inventory
        //capturingPlayer.getInventory().removeItem(itemService.getItem(CAPTURE_ITEM_ID), 1);

        // Update the captured NPC
        targetNPC.setControllerPlayerID(capturingPlayer.getId());
        playerService.updatePlayer(targetNPC);

        // Update the capturing player
        if (capturingPlayer.getPlayerControlledEntityIds() == null) {
            capturingPlayer.setPlayerControlledEntityIds(new ArrayList<>());
        }
        capturingPlayer.getPlayerControlledEntityIds().add(targetNPC.getId());
        playerService.updatePlayer(capturingPlayer);

        // End the combat
        createCombatLog(combat, capturingPlayer.getId(), "CAPTURE_SUCCESS", targetNPC.getId(),
                String.format("%s successfully captured %s!", capturingPlayer.getUsername(), targetNPC.getUsername()));
        endCombat(combat);
    }



    private String selectRandomTarget(Combat combat, String currentPlayerId) {
        List<String> possibleTargets = combat.getPlayerIds().stream()
                .filter(id -> !id.equals(currentPlayerId) && combat.getPlayerHealth().get(id) > 0)
                .collect(Collectors.toList());

        if (possibleTargets.isEmpty()) {
            throw new IllegalStateException("No valid targets available");
        }

        return possibleTargets.get(random.nextInt(possibleTargets.size()));
    }

    private int calculateDamage(String playerId, int minDamage, int maxDamage, int bonusAmountInteger, double bonusMultiplier) {
       //todo remove legacy check
        if(playerId.startsWith("AI")){
            return minDamage + (int)(Math.random() * (maxDamage - minDamage + 1)) + 5;
        }

        Player player = playerService.getPlayer(playerId);
        int attackAttribute = player.getAttributes().get("combat").getLevel();
        return minDamage + (int)(Math.random() * (maxDamage - minDamage + 1)) + (attackAttribute / 10) + bonusAmountInteger;
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

    private boolean shouldEndTurn(Combat combat) {
        String currentPlayerId = combat.getCurrentTurnPlayerId();
        return combat.getPlayerActionPoints().get(currentPlayerId) <= 0 || isTimeLimitExceeded(combat);
    }

    private void endTurn(Combat combat) {
        // Apply end phase effects
        applyPlayerStatusEffects(combat ,TurnPhase.END_PHASE);

        List<String> activePlayers = combat.getPlayerIds().stream()
                .filter(id -> combat.getPlayerHealth().get(id) > 0)
                .collect(Collectors.toList());

        if (activePlayers.isEmpty()) {
            logger.warn("No active players left in combat {}", combat.getId());
            endCombat(combat);
            return;
        }

        int currentPlayerIndex = activePlayers.indexOf(combat.getCurrentTurnPlayerId());
        int nextPlayerIndex = (currentPlayerIndex + 1) % activePlayers.size();
        String nextPlayerId = activePlayers.get(nextPlayerIndex);

        combat.setCurrentTurnPlayerId(nextPlayerId);
        combat.setTurnStartTime(Instant.now().toEpochMilli());
        combat.setTurnNumber(combat.getTurnNumber() + 1);

        // Reset action points for the new player
        combat.getPlayerActionPoints().put(nextPlayerId, INITIAL_ACTION_POINTS);

        // Update cooldowns
        updateCooldowns(combat);

        // Progress to the next phase (which will be START_PHASE for the new turn)
        combat.progressPhase();

        // Apply start phase effects for the new turn
       applyPlayerStatusEffects(combat, TurnPhase.START_PHASE);

        // End combat if max turns reached
        if (combat.getTurnNumber() > MAX_TURNS) {
            logger.info("Max turns reached for combat {}", combat.getId());
            endCombat(combat);
        } else {
            logger.info("Turn ended. New turn: {} for player: {}", combat.getTurnNumber(), nextPlayerId);
        }
    }
    private void updateCooldowns(Combat combat) {
        combat.getSpellCooldowns().forEach((playerId, cooldowns) ->
                cooldowns.replaceAll((spellId, cooldown) -> Math.max(0, cooldown - 1)));
    }

    private boolean shouldCombatEnd(Combat combat) {
        if (combat.getPlayerTeams().isEmpty()) {
            // Free-for-all mode
            long alivePlayers = combat.getPlayerHealth().values().stream().filter(health -> health > 0).count();
            logger.info("Checking if combat should end. Alive players: {}", alivePlayers);
            return alivePlayers <= 1;
        } else {
            // Team mode
            Set<String> aliveTeams = combat.getPlayerHealth().entrySet().stream()
                    .filter(entry -> entry.getValue() > 0)
                    .map(entry -> combat.getPlayerTeams().get(entry.getKey()))
                    .collect(Collectors.toSet());
            logger.info("Checking if combat should end. Alive teams: {}", aliveTeams.size());
            return aliveTeams.size() <= 1;
        }
    }

    @Autowired
    private NPCEncampmentService npcEncampmentService;


    private void endCombat(Combat combat) {
        logger.info("Ending combat: {}", combat.getId());
        combat.setActive(false);
        // Determine winners and losers
        List<String> winners;
        List<String> losers;
        if (combat.getPlayerTeams().isEmpty()) {
            winners = combat.getPlayerHealth().entrySet().stream()
                    .filter(entry -> entry.getValue() > 0)
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());
            losers = combat.getPlayerIds().stream()
                    .filter(id -> !winners.contains(id))
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
            losers = combat.getPlayerIds().stream()
                    .filter(id -> !winners.contains(id))
                    .collect(Collectors.toList());
        }

        Set<String> encampmentsToCheck = new HashSet<>();

        // Handle winners
        for (String winnerId : winners) {
            if (winnerId.startsWith("AI")) continue; // Skip AI winners
            Player winner = playerService.getPlayer(winnerId);
            winner.setTotalExperience(winner.getTotalExperience() + calculateExperienceGain(combat, winner));
            winner.setDuelable(true);
            playerService.updatePlayer(winner);
        }

        // Handle losers
        for (String loserId : losers) {
            if (loserId.startsWith("AI")) {
                handleNPCDefeat(combat, loserId);
                checkForEncampmentBoss(loserId, encampmentsToCheck);
            } else {
                Player loser = playerService.getPlayer(loserId);
                if (loser.isNPC()) {
                    loser.setWorldPositionX(-10000);
                    loser.setWorldPositionY(-10000);
                    loser.setSubmapCoordinateX(-10000);
                    loser.setSubmapCoordinateY(-10000);
                    loser.setCurrentSubmapId(null);
                    handleNPCDefeat(combat, loserId);
                    checkForEncampmentBoss(loserId, encampmentsToCheck);
                } else {
                    applyLossPenalty(loser);
                }
                loser.setDuelable(true);
                playerService.updatePlayer(loser);
            }
        }

        // Distribute NPC drops to winners
        distributeNPCDrops(combat, winners, losers);

        // Check and remove encampments if all bosses are defeated
        for (String encampmentId : encampmentsToCheck) {
            npcEncampmentService.checkAndRemoveEncampment(encampmentId);
        }
    }

    private void checkForEncampmentBoss(String npcId, Set<String> encampmentsToCheck) {
        List<NPCEncampment> encampments = npcEncampmentService.getAllEncampments();
        for (NPCEncampment encampment : encampments) {
            if (encampment.getBossPlayerIds().contains(npcId)) {
                encampmentsToCheck.add(encampment.getId());
                break;
            }
        }
    }

    private int calculateExperienceGain(Combat combat, Player winner) {
        // Implement your experience calculation logic here
        // This could be based on the level difference, number of opponents, etc.
        return 100; // Placeholder value
    }

    private void handleNPCDefeat(Combat combat, String npcId) {
        // Mark NPC for deletion
        playerService.markPlayerForDeletion(npcId);
        // Optionally, you can remove the NPC from the world map here
        // worldMapService.removeNPC(npcId);
    }

    private void applyLossPenalty(Player loser) {
        int currentGold = loser.getInventory().getCurrencies().getOrDefault("Shadow Essence", 0);
        loser.getInventory().getCurrencies().put("Shadow Essence", currentGold / 2);
        // You can add more penalties here if needed
    }

    private void distributeNPCDrops(Combat combat, List<String> winners, List<String> losers) {
        Map<Item, Integer> npcDrops = new HashMap<>();
        for (String loserId : losers) {
            if (!loserId.startsWith("AI")) {
                Player loser = playerService.getPlayer(loserId);
                for (InventorySlot slot : loser.getInventory().getInventorySlots()) {
                    if (slot.hasItem()) {
                        npcDrops.merge(slot.getItem(), slot.getQuantity(), Integer::sum);
                    }
                }
                // Clear the loser's inventory
                loser.getInventory().getInventorySlots().clear();
                playerService.updatePlayer(loser);
            }
        }

        if (!npcDrops.isEmpty() && !winners.isEmpty()) {
            List<Player> humanWinners = winners.stream()
                    .filter(id -> !id.startsWith("AI"))
                    .map(playerService::getPlayer)
                    .collect(Collectors.toList());

            if (!humanWinners.isEmpty()) {
                distributeDrops(npcDrops, humanWinners);
            }
        }
    }

    private void distributeDrops(Map<Item, Integer> drops, List<Player> winners) {
        int winnerCount = winners.size();
        for (Map.Entry<Item, Integer> drop : drops.entrySet()) {
            Item item = drop.getKey();
            int totalQuantity = drop.getValue();
            int baseQuantityPerWinner = totalQuantity / winnerCount;
            int remainingQuantity = totalQuantity % winnerCount;

            for (int i = 0; i < winnerCount; i++) {
                Player winner = winners.get(i);
                int quantityForThisWinner = baseQuantityPerWinner + (i < remainingQuantity ? 1 : 0);

                if (quantityForThisWinner > 0) {
                    try {
                        winner.getInventory().addItem(item, quantityForThisWinner);
                    } catch (InventoryFullException e) {
                        // If inventory is full, try to add as many as possible
                        int addedQuantity = addAsManyAsPossible(winner.getInventory(), item, quantityForThisWinner);
                        logger.warn("Could not add all items to winner's inventory. Added {} out of {}", addedQuantity, quantityForThisWinner);
                    }
                    playerService.updatePlayer(winner);
                }
            }
        }
    }

    private int addAsManyAsPossible(PlayerInventory inventory, Item item, int desiredQuantity) {
        int addedQuantity = 0;
        while (addedQuantity < desiredQuantity) {
            try {
                inventory.addItem(item, 1);
                addedQuantity++;
            } catch (InventoryFullException e) {
                break;
            }
        }
        return addedQuantity;
    }


    //STATUS CHANGES:








    @Scheduled(fixedRate = 60000) // Run every minute
    public void cleanupExpiredCombats() {
        Instant expirationThreshold = Instant.now().minusSeconds(COMBAT_EXPIRATION_MINUTES * 60);
        List<Combat> expiredCombats = combatRepository.findByActiveTrueAndCreatedAtBefore(expirationThreshold);
        for (Combat combat : expiredCombats) {
            endCombat(combat);
            combatRepository.save(combat);
        }
    }
    @Scheduled(fixedRate = 1000)
    public void processAITurns() {
        List<Combat> activeCombats = combatRepository.findByActiveTrue();
        logger.info("Processing AI turns for {} active combats", activeCombats.size());
        for (Combat combat : activeCombats) {
            String currentPlayerId = combat.getCurrentTurnPlayerId();
            if (isAIPlayer(currentPlayerId)) {
                logger.info("Processing AI turn for combat {} and player {}", combat.getId(), currentPlayerId);
                try {
                   Action a = generateAIAction(combat, currentPlayerId);
                    performAction(combat.getId(), a);
                } catch (Exception e) {
                    logger.error("Error processing AI turn for combat " + combat.getId(), e);
                }
            }
        }
    }

}
