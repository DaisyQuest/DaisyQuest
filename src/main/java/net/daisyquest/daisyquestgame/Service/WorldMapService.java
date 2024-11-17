package net.daisyquest.daisyquestgame.Service;


import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import net.daisyquest.daisyquestgame.Controller.CooldownActiveException;
import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAmount;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class WorldMapService {
    private final Map<String, ActiveInteraction> activeInteractions = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(10);




    public static final int LAND_SIZE = 10000; // Size of each land tile in pixels
    @Autowired
    private WorldMapRepository worldMapRepository;

    @Autowired
    private LandRepository landRepository;

    @Autowired
    PlayerInventoryRepository playerInventoryRepository;

    @Autowired
    SubmapRepository submapRepository;
    private final Random random = new Random();
    private final Map<String, SubmapEntrance> submapEntrances = new HashMap<>();
    @Autowired
    private ItemRepository itemService;

    @Transactional
    public WorldMap getOrCreateWorldMap(int width, int height) {
        List<WorldMap> existingMaps = worldMapRepository.findAll();
        if (!existingMaps.isEmpty()) {
            return existingMaps.get(0);
        }
        return initializeWorldMap(width, height);
    }

    private WorldMap initializeWorldMap(int width, int height) {
        WorldMap worldMap = new WorldMap();
        worldMap.setWidth(width);
        worldMap.setHeight(height);
        worldMap = worldMapRepository.save(worldMap);

        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                Land land = new Land();
                land.setXCoordinate(x);
                land.setYCoordinate(y);
                land.setLandType(getRandomLandType());
                land.setForSale(true);
                Map<String, Integer> costs = new HashMap<>();
                costs.put("Mana Crystals", 5);
                land.setSalePrice(costs);
                land.setWorldMap(worldMap);
                landRepository.save(land);
            }
        }

        return worldMap;
    }


    public Land getLandByCoordinates(String worldMapId, int x, int y) {
        return landRepository.findByWorldMapIdAndCoordinates(worldMapId, x, y);
    }

    @Transactional
    public Land updateLand(Land land) {
        return landRepository.save(land);
    }

    public WorldMap getWorldMap(String worldMapId) {
        return worldMapRepository.findById(worldMapId)
                .orElseThrow(() -> new IllegalArgumentException("World Map not found"));
    }

    private LandType getRandomLandType() {
        return LandType.values()[random.nextInt(LandType.values().length)];
    }

    //MOVEMENT:


    @Autowired
    private PlayerRepository playerRepository;

    public WorldMap getWorldMap() {
        return worldMapRepository.findAll().get(0); // Assuming there's only one world map
    }


    public Land getLandAtPosition(int x, int y) {
        WorldMap worldMap = getWorldMap();
        int landX = (x / LAND_SIZE) % worldMap.getWidth();
        int landY = (y / LAND_SIZE) % worldMap.getHeight();
        return landRepository.findByXCoordinateAndYCoordinate(landX, landY);
    }


    @PostConstruct
    public void initializeSubmapEntrances() {
        addSubmapEntrance("60d5ec9f82c2a8c9a8b9e1a1", 10000, 10000); // Peaceful Meadow
        addSubmapEntrance("60d5ec9f82c2a8c9a8b9e1a2", 10500, 10500); // Mystic Cave
        addSubmapEntrance("60d5ec9f82c2a8c9a8b9e1a3", 11000, 11000); // Player House
    }

    private void addSubmapEntrance(String submapId, int x, int y) {
        submapEntrances.put(submapId, new SubmapEntrance(submapId, x, y));
    }

    public boolean isPlayerNearSubmapEntrance(int playerX, int playerY) {
        for (SubmapEntrance entrance : submapEntrances.values()) {
            double distance = calculateDistance(playerX, playerY, entrance.getX(), entrance.getY());
            if (distance <= 5.0) { // 5.0 is the threshold distance
                return true;
            }
        }
        return false;
    }


    @Autowired
    private MapItemRepository mapItemRepository;

    public List<MapItem> findMapItemsInViewport(int centerX, int centerY, int viewportWidth, int viewportHeight) {
        WorldMap worldMap = getWorldMap();
        int worldPixelWidth = worldMap.getWidth() * LAND_SIZE;
        int worldPixelHeight = worldMap.getHeight() * LAND_SIZE;

        // Calculate the viewport boundaries
        int leftX = Math.max(0, centerX - viewportWidth / 2);
        int rightX = Math.min(worldPixelWidth - 1, centerX + viewportWidth / 2);
        int topY = Math.max(0, centerY - viewportHeight / 2);
        int bottomY = Math.min(worldPixelHeight - 1, centerY + viewportHeight / 2);

        // Query for map items within these boundaries
        return mapItemRepository.findItemsInWorldMapRange(leftX, rightX, topY, bottomY);
    }


    public String getSubmapIdNearPlayer(int playerX, int playerY) {
        for (SubmapEntrance entrance : submapEntrances.values()) {
            double distance = calculateDistance(playerX, playerY, entrance.getX(), entrance.getY());
            if (distance <= 5.0) { // 5.0 is the threshold distance
                return entrance.getSubmapId();
            }
        }
        return null;
    }


    public List<SubmapEntranceDTO> getSubmapEntrances() {
        return submapEntrances.values().stream()
                .map(entrance -> new SubmapEntranceDTO(entrance.getSubmapId(), entrance.getX(), entrance.getY()))
                .collect(Collectors.toList());
    }

    @Autowired
    PlayerService playerService;

    @Transactional
    public boolean pickupItem(String itemId, String playerId) {
        MapItem mapItem = mapItemRepository.findById(itemId).orElse(null);
        Player player = playerService.getPlayer(playerId);

        if (mapItem == null || player == null) {
            return false;
        }

        // Check if the player is close enough to the item
        boolean isCloseEnough = isPlayerCloseToItem(player, mapItem);
        if (!isCloseEnough) {
            return false;
        }

        // Add the item to the player's inventory
        playerService.addItemToInventory(player.getId(), mapItem.getItem(), mapItem.getQuantity());

        // Remove the item from the map
        if (mapItem.isDestroyOnLoot()) {
            mapItem.setQuantity(mapItem.getQuantity() - mapItem.getDestroyOnLootAmount());
            if (mapItem.getQuantity() <= 0) {
                mapItemRepository.delete(mapItem);
            } else {
                mapItemRepository.save(mapItem);
            }
        } else {
            mapItem.getLootedByPlayerIds().add(playerId);
            mapItemRepository.save(mapItem);
        }

        return true;
    }

    private boolean isPlayerCloseToItem(Player player, MapItem mapItem) {
        int playerX, playerY, itemX, itemY;
        if (player.getCurrentSubmapId() != null) {
            playerX = player.getSubmapCoordinateX();
            playerY = player.getSubmapCoordinateY();
            itemX = mapItem.getSubmapCoordinateX();
            itemY = mapItem.getSubmapCoordinateY();
        } else {
            playerX = player.getWorldPositionX();
            playerY = player.getWorldPositionY();
            itemX = mapItem.getWorldMapCoordinateX();
            itemY = mapItem.getWorldMapCoordinateY();
        }

        double distance = Math.sqrt(Math.pow(itemX - playerX, 2) + Math.pow(itemY - playerY, 2));
        return distance <= 50; // Adjust this value as needed
    }

    private static final int INTERACTION_RANGE = 1000; // Tiles

    @Autowired
    private WorldObjectRepository worldObjectRepository;


    @Autowired
    private ActiveInteractionRepository activeInteractionRepository;


    public List<WorldObject> findWorldObjectsInViewport(
            int centerX, int centerY, int viewportWidth, int viewportHeight) {
        int minX = centerX - (viewportWidth / 2);
        int maxX = centerX + (viewportWidth / 2);
        int minY = centerY - (viewportHeight / 2);
        int maxY = centerY + (viewportHeight / 2);

        return worldObjectRepository.findByxPosBetweenAndyPosBetween(minX, maxX, minY, maxY);
    }

    public Player movePlayer(String playerId, int newX, int newY) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));

        // Check if player has an active interaction
        Optional<ActiveInteraction> activeInteraction =
                activeInteractionRepository.findByPlayerIdAndStatus(
                        playerId, ActiveInteraction.InteractionStatus.IN_PROGRESS);

        if (activeInteraction.isPresent()) {
            throw new IllegalStateException("Cannot move while in an interaction");
        }

        // Validate movement
        validateMovement(player, newX, newY);

        // Update player position
        player.setWorldPositionX(newX);
        player.setWorldPositionY(newY);
        return playerRepository.save(player);
    }

    public List<Player> getPlayersInViewport(
            int centerX, int centerY, int viewportWidth, int viewportHeight) {
        int minX = centerX - (viewportWidth / 2);
        int maxX = centerX + (viewportWidth / 2);
        int minY = centerY - (viewportHeight / 2);
        int maxY = centerY + (viewportHeight / 2);

        return playerRepository.findByWorldPositionXBetweenAndWorldPositionYBetween(minX, maxX, minY, maxY);
    }

    public InteractionResult startWorldObjectInteraction(
            String playerId,
            String objectId,
            InteractionType interactionType,
            Map<String, Object> interactionData) {

        // Validate inputs and get the player and object...
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));

        WorldObject object = worldObjectRepository.findById(objectId)
                .orElseThrow(() -> new IllegalArgumentException("World object not found"));
        // Validate basic interaction requirements
        validateInteractionPossible(player, object);  // Fixed: Remove duplicate validation method

        // Check for existing active interaction
        Optional<ActiveInteraction> existingInteraction = activeInteractionRepository
                .findByPlayerIdAndStatus(playerId, ActiveInteraction.InteractionStatus.IN_PROGRESS);



        if (existingInteraction.isPresent()) {
            throw new IllegalStateException("Player already has an active interaction");
        }

        ActiveInteraction existingInteraction2 = activeInteractions.get(playerId);

        if (existingInteraction2 != null) {
            throw new IllegalStateException("Player already has an active interaction");
        }

        // Handle cooldown
        if (object.getCooldownMs() > 0) {
            LocalDateTime now = LocalDateTime.now();
            long elapsedMs = ChronoUnit.MILLIS.between(
                    object.getCreatedDateTime(), now);

            if (elapsedMs < object.getCooldownMs()) {
                throw new CooldownActiveException(object.getCooldownMs() - elapsedMs);
            }
        }

        // Verify interaction type matches object's type
        if (object.getWorldObjectType().getInteractionType() != interactionType) {
            throw new IllegalArgumentException("Invalid interaction type for this object");
        }



        // Fix: Get duration from world object type
        long interactionDurationMs = Optional.ofNullable(object.getWorldObjectType())
                .map(WorldObjectType::getInteractionDurationMs)
                .orElseThrow(() -> new IllegalArgumentException("Interaction duration not specified"));

        long startTime = System.currentTimeMillis();
        long endTime = startTime + interactionDurationMs;

        String interactionId = UUID.randomUUID().toString();

        ActiveInteraction activeInteraction = new ActiveInteraction(
                interactionId,
                playerId,
                objectId,
                interactionType,
                LocalDateTime.now(),
                LocalDateTime.now().plusNanos(interactionDurationMs * 1000000),
                ActiveInteraction.InteractionStatus.IN_PROGRESS,
                new HashMap<>()
        );
        activeInteractions.put(interactionId, activeInteraction);

        // Schedule the interaction completion
        scheduler.schedule(() -> completeInteraction(interactionId), interactionDurationMs, TimeUnit.MILLISECONDS);

        // Initialize state based on requirements and rewards from the interaction option
        Map<String, Object> state = new HashMap<>();
        InteractionOption option = object.getWorldObjectType().getInteractionOption();

        if (option != null) {
            // Store requirements for validation during progress updates
            state.put("requirements", option.getRequirements());
            // Store rewards for distribution on completion
            state.put("rewards", option.getRewards());
        }

        // Add any additional interaction-specific state
        state.putAll(initializeInteractionState(interactionType,object, player, interactionData));
        activeInteraction.setStateData(state);

        // Save the interaction
       // activeInteractionRepository.save(activeInteraction);

        // Update world object state
        object.setUsed(true);
        object.setCreatedDateTime(LocalDateTime.now());
        worldObjectRepository.save(object);

        return new InteractionResult(
                true,
                "Interaction started successfully",
                activeInteraction.getId(),
                interactionType,  // Fixed: Use the passed interactionType
                state
        );
    }
    private void completeInteraction(String interactionId) {
        ActiveInteraction interaction = activeInteractions.remove(interactionId);
        if (interaction != null) {
            // Retrieve the player and object
            Player player = playerRepository.findById(interaction.getPlayerId())
                    .orElse(null);
            WorldObject object = worldObjectRepository.findById(interaction.getWorldObjectId())
                    .orElse(null);

            if (player != null && object != null) {
                // Process the interaction completion
                processInteractionCompletion(player, object, interaction);

            }
        }
    }

    private void processInteractionCompletion(Player player, WorldObject object, ActiveInteraction interaction) {
        // Example: Grant experience rewards
        InteractionOption option = object.getWorldObjectType().getInteractionOption();
        if (option != null) {
            Map<String, Object> rewards = option.getRewards();
            if (rewards != null) {
                Integer experience = (Integer) rewards.get("experience");
                if (experience != null) {
                    // Assuming you have a method to add experience to the player
                    String skillName = "combat"; // Retrieve the skill name from the interaction data
                    player.addExperience(skillName, experience);
                    playerRepository.save(player);
                }
            }
        }

        // Update the object state if needed
        // For example, set cooldowns or mark as used
        object.setUsed(true);
        worldObjectRepository.save(object);
        interaction.setStatus(ActiveInteraction.InteractionStatus.COMPLETED);
        activeInteractionRepository.save(interaction);

        // Optionally, notify the client about completion (e.g., via WebSocket or other mechanisms)
    }

    public InteractionProgress getInteractionProgress(String interactionId) {
        ActiveInteraction interaction = activeInteractions.get(interactionId);
        if (interaction == null) {
            interaction = activeInteractionRepository.findById(interactionId).get();
        }

        long currentTime = System.currentTimeMillis();
        Duration totalDuration = Duration.between(interaction.getStartTime(), interaction.getEndTime());
        long totalDurationMs = totalDuration.toMillis();
      //  long elapsedTime = currentTime - interaction.getStartTime();

        Duration elapsedDuration = Duration.between(interaction.getStartTime(), LocalDateTime.now());
        long elapsedTimeMs = elapsedDuration.toMillis();
        double progress = Math.min(1.0, (double) elapsedTimeMs / totalDurationMs);

        return new InteractionProgress(
                interaction.getId(),
                interaction.getPlayerId(),
                interaction.getWorldObjectId(),
                interaction.getInteractionType(),
                progress,
                interaction.getStartTime(),
                interaction.getEndTime()
        );
    }
    @PreDestroy
    public void shutdownScheduler() {
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
                if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                    System.err.println("Scheduler did not terminate");
                }
            }
        } catch (InterruptedException ie) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    public InteractionResult updateInteractionProgress(
            String interactionId,
            Map<String, Object> progressData) {
        ActiveInteraction interaction = activeInteractionRepository.findById(interactionId)
                .orElseThrow(() -> new IllegalArgumentException("Interaction not found"));

        if (interaction.getStatus() != ActiveInteraction.InteractionStatus.IN_PROGRESS) {
            throw new IllegalStateException("Interaction is no longer active");
        }

        // Check if interaction has expired
        if (LocalDateTime.now().isAfter(interaction.getEndTime())) {
            interaction.setStatus(ActiveInteraction.InteractionStatus.FAILED);
            activeInteractionRepository.save(interaction);
            throw new IllegalStateException("Interaction has expired");
        }

        // Get the related world object and player for processing
        WorldObject worldObject = worldObjectRepository.findById(interaction.getWorldObjectId())
                .orElseThrow(() -> new IllegalStateException("World object not found"));

        Player player = playerRepository.findById(interaction.getPlayerId())
                .orElseThrow(() -> new IllegalStateException("Player not found"));

        // Process the interaction
        InteractionResult result = processInteractionProgress(interaction, progressData);

        // If completed, distribute rewards
        if (result.isCompleted()) {
            InteractionOption option = worldObject.getWorldObjectType().getInteractionOption();
            if (option != null && option.getRewards() != null) {
                // Handle rewards
                distributeRewards(player, option.getRewards());
            }

            // Update interaction status
            interaction.setStatus(ActiveInteraction.InteractionStatus.COMPLETED);
            activeInteractionRepository.save(interaction);
        }

        return result;
    }

    private void distributeRewards(Player player, Map<String, Object> rewards) {
        // Handle experience rewards
        if (rewards.containsKey("experience")) {
            Map<String, Integer> expRewards = (Map<String, Integer>) rewards.get("experience");
            for (Map.Entry<String, Integer> entry : expRewards.entrySet()) {
                Attribute skill = player.getAttributes().get(entry.getKey());
                if (skill != null) {
                    skill.setExperience(skill.getExperience() + entry.getValue());
                }
            }
        }

        // Handle item rewards
        if (rewards.containsKey("items")) {
            Map<String, Integer> itemRewards = (Map<String, Integer>) rewards.get("items");
            for (Map.Entry<String, Integer> entry : itemRewards.entrySet()) {
                Item item = itemService.findItemByName(entry.getKey());
                if (item != null) {
                    try {
                        playerService.addItemToInventory(player.getId(), item, entry.getValue());
                    } catch (InventoryFullException e) {
                        // Handle inventory full situation
                        // Could create a ground item, send a message to player, etc.
                    }
                }
            }
        }

        // Save player changes
        playerRepository.save(player);
    }

    public void cancelInteraction(String interactionId) {
        ActiveInteraction interaction = activeInteractionRepository.findById(interactionId)
                .orElseThrow(() -> new IllegalArgumentException("Interaction not found"));

        interaction.setStatus(ActiveInteraction.InteractionStatus.CANCELLED);
        activeInteractionRepository.save(interaction);

        // Additional cleanup if needed based on interaction type
        handleInteractionCancellation(interaction);
    }

    private Map<String, Object> initializeInteractionState(
            InteractionType type, WorldObject object, Player player,
            Map<String, Object> interactionData) {
        Map<String, Object> state = new HashMap<>();

        switch (type) {
            case CONTAINER:
                return initializeContainerState(object);
            case TRAVEL:
                return initializeTravelState(object);
            case SKILL:
                return initializeSkillState(object, player, interactionData);
            case QUEST:
                return initializeQuestState(object, player);
            case INSTANT:
            case CONTINUOUS:
                state.put("startTime", LocalDateTime.now());
                state.put("duration", object.getWorldObjectType().getInteractionDurationMs());
                return state;
            default:
                return state;
        }
    }

    private InteractionResult processInteractionProgress(
            ActiveInteraction interaction, Map<String, Object> progressData) {
        switch (interaction.getInteractionType()) {
            case CONTAINER:
                return processContainerInteraction(interaction, progressData);
            case TRAVEL:
                return processTravelInteraction(interaction, progressData);
            case SKILL:
                return processSkillInteraction(interaction, progressData);
            case QUEST:
                return processQuestInteraction(interaction, progressData);
            case CONTINUOUS:
                return processContinuousInteraction(interaction, progressData);
            case INSTANT:
                return processInstantInteraction(interaction, progressData);
            default:
                throw new IllegalArgumentException("Unsupported interaction type");
        }
    }
    private void validateInteractionPossible(Player player, WorldObject worldObject) {
        WorldObjectType type = worldObject.getWorldObjectType();

        // Check if object is interactable
        if (!type.isInteractable()) {
            throw new IllegalStateException("This object is not interactable");
        }

        // Check distance
        double distance = calculateDistance(
                player.getWorldPositionX(),
                player.getWorldPositionY(),
                worldObject.getXPos(),
                worldObject.getYPos()
        );

        if (distance > INTERACTION_RANGE) {
            throw new IllegalStateException("Too far from object to interact");
        }

        // Validate requirements using the Requirements system
        InteractionOption option = type.getInteractionOption();
        if (option != null && option.getRequirements() != null) {
            if (!option.getRequirements().checkAll(player)) {
                List<String> unmetRequirements = option.getRequirements().getUnmetRequirements(player);
                throw new IllegalStateException(
                        "Requirements not met: " + String.join(", ", unmetRequirements)
                );
            }
        }
    }
    private void validateMovement(Player player, int newX, int newY) {
        // Check if the new position is within map bounds
        if (!isWithinMapBounds(newX, newY)) {
            throw new IllegalArgumentException("Position outside map bounds");
        }

        // Check if the new position is traversable
        if (!isTraversable(newX, newY)) {
            throw new IllegalArgumentException("Position is not traversable");
        }

        // Calculate maximum allowed movement distance
        int maxDistance = 1; // Allow diagonal movement
        if (calculateDistance(player.getWorldPositionX(), player.getWorldPositionY(), newX, newY) > maxDistance) {
            throw new IllegalArgumentException("Movement distance too large");
        }
    }

    private double calculateDistance(int x1, int y1, int x2, int y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    private boolean isWithinMapBounds(int x, int y) {
        return x >= 0 && x < getWorldMap().getWidth() &&
                y >= 0 && y < getWorldMap().getHeight();
    }

    private boolean isTraversable(int x, int y) {
        // Check world objects at position
        List<WorldObject> objects = worldObjectRepository.findByXPosAndYPos(x, y);
        return objects.stream().noneMatch(obj ->
                obj.getWorldObjectType().getTraversalType() == WorldObjectTraversalType.NONE);
    }

    // Placeholder methods for type-specific initialization
    private Map<String, Object> initializeContainerState(WorldObject object) {
        // Initialize container contents, permissions, etc.
        return new HashMap<>();
    }

    private Map<String, Object> initializeTravelState(WorldObject object) {
        // Initialize travel destination, requirements, etc.
        return new HashMap<>();
    }


    private Map<String, Object> initializeQuestState(WorldObject object, Player player) {
        // Initialize quest state, objectives, etc.
        return new HashMap<>();
    }

    // Placeholder methods for type-specific processing
    private InteractionResult processContainerInteraction(
            ActiveInteraction interaction, Map<String, Object> progressData) {
        // Handle container interactions (open, close, transfer items)
        return new InteractionResult(true, "Container interaction processed",
                interaction.getId(), InteractionType.CONTAINER, new HashMap<>());
    }

    private InteractionResult processTravelInteraction(
            ActiveInteraction interaction, Map<String, Object> progressData) {
        // Handle travel between locations
        return new InteractionResult(true, "Travel processed",
                interaction.getId(), InteractionType.TRAVEL, new HashMap<>());
    }

    private InteractionResult processQuestInteraction(
            ActiveInteraction interaction, Map<String, Object> progressData) {
        // Handle quest interactions
        return new InteractionResult(true, "Quest interaction processed",
                interaction.getId(), InteractionType.QUEST, new HashMap<>());
    }

    private InteractionResult processContinuousInteraction(
            ActiveInteraction interaction, Map<String, Object> progressData) {
        // Handle continuous interactions
        return new InteractionResult(true, "Continuous interaction processed",
                interaction.getId(), InteractionType.CONTINUOUS, new HashMap<>());
    }

    private InteractionResult processInstantInteraction(
            ActiveInteraction interaction, Map<String, Object> progressData) {
        // Handle instant interactions
        return new InteractionResult(true, "Instant interaction processed",
                interaction.getId(), InteractionType.INSTANT, new HashMap<>());
    }

    private void handleInteractionCancellation(ActiveInteraction interaction) {
        // Cleanup based on interaction type
        switch (interaction.getInteractionType()) {
            case CONTAINER:
                // Close container, return items, etc.
                break;
            case SKILL:
                // Reset skill progress, return resources, etc.
                break;
            case QUEST:
                // Reset quest state if needed
                break;
            // Add other type-specific cleanup
        }
    }

    // Validation methods for specific interaction types
//    private void validateSkillRequirements(Player player, WorldObject worldObject) {
//        WorldObjectType type = worldObject.getWorldObjectType();
//        String requiredSkill = (String) type.getInteractionOption().getRequirements().get("skill");
//        int requiredLevel = (int) type.getInteractionOption().getRequirements().get("level");
//
//        Attribute playerSkill = player.getAttributes().get(requiredSkill);
//        if (playerSkill == null || playerSkill.getLevel() < requiredLevel) {
//            throw new IllegalStateException(
//                    String.format("Requires %s level %d", requiredSkill, requiredLevel)
//            );
//        }
//    }

    private Map<String, Object> initializeSkillState(
            WorldObject object, Player player, Map<String, Object> interactionData) {

            // Extract the SkillRequirement from the Requirements object
        List<SkillRequirement> skillRequirements = Optional.ofNullable(object)
                .map(WorldObject::getWorldObjectType)
                .map(WorldObjectType::getInteractionOption)
                .map(InteractionOption::getRequirements)
                .map(reqs -> reqs.getRequirements().stream()
                        .filter(req -> req instanceof SkillRequirement)
                        .map(req -> (SkillRequirement) req)
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());



        Object experienceReward = Optional.ofNullable(object)
                .map(WorldObject::getWorldObjectType)
                .map(WorldObjectType::getInteractionOption)
                .map(InteractionOption::getRewards)
                .map(rew -> rew.get("experience"))
                .orElse(0);

        Object itemReward = Optional.ofNullable(object)
                .map(WorldObject::getWorldObjectType)
                .map(WorldObjectType::getInteractionOption)
                .map(InteractionOption::getRewards)
                .map(rew -> rew.get("item"))
                .orElse("defaultItem");

        return Map.of(
                "skillName", skillRequirements.isEmpty() ? "" : String.join(", ", skillRequirements.stream().map(o->o.getSkillId()).collect(Collectors.toList())),
                "experienceReward", experienceReward,
                "itemReward", itemReward
        );
    }

    private InteractionResult processSkillInteraction(
            ActiveInteraction interaction, Map<String, Object> progressData) {
        Map<String, Object> state = interaction.getStateData();
        Player player = playerRepository.findById(interaction.getPlayerId())
                .orElseThrow(() -> new IllegalStateException("Player not found"));

        // Update skill experience
        String skillName = (String) state.get("skillName");
        int expReward = (int) state.get("experienceReward");
        Attribute skill = player.getAttributes().get(skillName);
        skill.setExperience(skill.getExperience() + expReward);

        // Save progress
        player.getAttributes().put(skillName, skill);
        playerRepository.save(player);

        // If interaction is complete, handle rewards
        if (progressData.get("completed") != null && (boolean) progressData.get("completed")) {
            String itemRewardName = (String) state.get("itemReward");
            if (itemRewardName != null) {
                Item reward = itemService.findItemByName(itemRewardName);
                // Add reward handling logic here
            }

            return InteractionResult.completed(
                    "Skill action complete",
                    interaction.getId(),
                    InteractionType.SKILL,
                    Map.of("experienceGained", expReward)
            );
        }

        return new InteractionResult(
                true,
                "Progress made",
                interaction.getId(),
                InteractionType.SKILL,
                Map.of("experienceGained", expReward)
        );
    }

    private void validateQuestRequirements(Player player, WorldObject worldObject) {
        // Check quest prerequisites, player status, etc.
    }

    private void validateContainerAccess(Player player, WorldObject worldObject) {
        // Check permissions, keys required, etc.
    }

    private void validateTravelRequirements(Player player, WorldObject worldObject) {
        // Check travel requirements, destination accessibility, etc.
    }

    public InteractionResult handleWorldObjectInteraction(String playerId, String objectId, InteractionType interactionType) {
            return new InteractionResult();
    }




    // Inner class to represent a submap entrance
    @Getter
    private static class SubmapEntrance {
        private final String submapId;
        private final int x;
        private final int y;

        public SubmapEntrance(String submapId, int x, int y) {
            this.submapId = submapId;
            this.x = x;
            this.y = y;
        }

    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class InteractionProgress {
        private String interactionId;
        private String playerId;
        private String objectId;
        private InteractionType interactionType;
        private double progress; // 0.0 to 1.0
        private LocalDateTime startTime;
        private LocalDateTime endTime;

        // Constructor, getters, and setters
    }
}


