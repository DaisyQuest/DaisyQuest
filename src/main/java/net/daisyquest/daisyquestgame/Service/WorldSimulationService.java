package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class WorldSimulationService {

    public WorldSimulationState createState() {
        return new WorldSimulationState();
    }

    public void registerEntity(WorldSimulationState state, WorldEntity entity) {
        state.entities.put(entity.getId(), entity);
    }

    public void registerWorldObject(WorldSimulationState state, WorldObject worldObject) {
        state.worldObjects.add(worldObject);
    }

    public void submitMoveRequest(WorldSimulationState state, String entityId, MoveRequest request) {
        state.pendingMoveRequests.put(entityId, request);
    }

    public TickResult tick(WorldSimulationState state, WorldMap worldMap, Submap submap, Land land) {
        state.pendingMoveRequests.forEach(state.activeMoveRequests::put);
        state.pendingMoveRequests.clear();

        List<String> entityOrder = new ArrayList<>(state.entities.keySet());
        Collections.sort(entityOrder);

        Map<String, WorldEntity> entities = state.entities;
        Set<String> occupied = new HashSet<>();
        for (WorldEntity entity : entities.values()) {
            occupied.add(positionKey(entity.getX(), entity.getY(), entity.getZ(), entity.getSubmapId()));
        }

        TickResult result = new TickResult();

        for (String entityId : entityOrder) {
            WorldEntity entity = entities.get(entityId);
            MoveRequest request = state.activeMoveRequests.get(entityId);
            if (entity == null || request == null) {
                continue;
            }

            MovementValidation validation = validateMoveTarget(entity, request, worldMap, submap, land);
            if (!validation.valid) {
                result.movementOutcomes.add(MovementOutcome.failure(entityId, validation.failureReason));
                state.activeMoveRequests.remove(entityId);
                continue;
            }

            if (entity.getX() == request.getTargetX()
                    && entity.getY() == request.getTargetY()
                    && entity.getZ() == request.getTargetZ()) {
                handleInteractionIfNeeded(state, result, entity, request);
                state.activeMoveRequests.remove(entityId);
                continue;
            }

            Position nextStep = determineNextStep(entity, request);

            if (isTraversalBlocked(state, entity, nextStep)) {
                result.movementOutcomes.add(MovementOutcome.failure(entityId, MoveFailureReason.BLOCKED_TRAVERSAL));
                state.activeMoveRequests.remove(entityId);
                continue;
            }

            String nextKey = positionKey(nextStep.x, nextStep.y, nextStep.z, entity.getSubmapId());
            if (occupied.contains(nextKey)) {
                result.movementOutcomes.add(MovementOutcome.failure(entityId, MoveFailureReason.OCCUPIED));
                continue;
            }

            occupied.remove(positionKey(entity.getX(), entity.getY(), entity.getZ(), entity.getSubmapId()));
            entity.setX(nextStep.x);
            entity.setY(nextStep.y);
            entity.setZ(nextStep.z);
            occupied.add(nextKey);

            result.movementOutcomes.add(MovementOutcome.moved(entityId, nextStep.x, nextStep.y, nextStep.z));

            if (entity.getX() == request.getTargetX()
                    && entity.getY() == request.getTargetY()
                    && entity.getZ() == request.getTargetZ()) {
                handleInteractionIfNeeded(state, result, entity, request);
                state.activeMoveRequests.remove(entityId);
            }
        }

        result.tickNumber = ++state.tickNumber;
        return result;
    }

    private MovementValidation validateMoveTarget(WorldEntity entity, MoveRequest request, WorldMap worldMap,
                                                  Submap submap, Land land) {
        if (submap != null) {
            if (!Objects.equals(entity.getSubmapId(), submap.getId())) {
                return MovementValidation.failure(MoveFailureReason.INVALID_SUBMAP);
            }
            if (!isWithinBounds(request.getTargetX(), request.getTargetY(), request.getTargetZ(),
                    submap.getWidth(), submap.getLength(), submap.getHeight())) {
                return MovementValidation.failure(MoveFailureReason.OUT_OF_BOUNDS);
            }
        } else if (worldMap != null) {
            if (!isWithinBounds(request.getTargetX(), request.getTargetY(), request.getTargetZ(),
                    worldMap.getWidth(), worldMap.getLength(), worldMap.getHeight())) {
                return MovementValidation.failure(MoveFailureReason.OUT_OF_BOUNDS);
            }
        }

        if (land != null && land.getPartitions() != null && !land.getPartitions().isEmpty()) {
            double totalArea = land.getPartitions().stream().mapToDouble(LandPartition::getArea).sum();
            boolean invalidPartition = land.getPartitions().stream().anyMatch(p -> p.getArea() <= 0);
            if (totalArea > 1.0 || invalidPartition) {
                return MovementValidation.failure(MoveFailureReason.INVALID_PARTITION);
            }
        }

        return MovementValidation.success();
    }

    private boolean isWithinBounds(int x, int y, int z, int width, int length, int height) {
        return x >= 0 && y >= 0 && z >= 0
                && x < width
                && y < length
                && z < height;
    }

    private Position determineNextStep(WorldEntity entity, MoveRequest request) {
        int x = entity.getX();
        int y = entity.getY();
        int z = entity.getZ();
        if (x != request.getTargetX()) {
            return new Position(x + Integer.signum(request.getTargetX() - x), y, z);
        }
        if (y != request.getTargetY()) {
            return new Position(x, y + Integer.signum(request.getTargetY() - y), z);
        }
        if (z != request.getTargetZ()) {
            return new Position(x, y, z + Integer.signum(request.getTargetZ() - z));
        }
        return null;
    }

    private boolean isTraversalBlocked(WorldSimulationState state, WorldEntity entity, Position nextStep) {
        for (WorldObject object : state.worldObjects) {
            if (object.getXPos() == nextStep.x && object.getYPos() == nextStep.y && object.getZPos() == nextStep.z) {
                WorldObjectType type = object.getWorldObjectType() != null ? object.getWorldObjectType() : object.getType();
                if (type != null && !entity.canTraverse(type.getTraversalType())) {
                    return true;
                }
            }
        }
        return false;
    }

    private void handleInteractionIfNeeded(WorldSimulationState state, TickResult result,
                                           WorldEntity entity, MoveRequest request) {
        if (request.getIntent() != MoveIntent.INTERACT) {
            return;
        }
        Optional<WorldEntity> target = state.entities.values().stream()
                .filter(other -> !other.getId().equals(entity.getId()))
                .filter(other -> other.getX() == request.getTargetX()
                        && other.getY() == request.getTargetY()
                        && other.getZ() == request.getTargetZ()
                        && Objects.equals(other.getSubmapId(), entity.getSubmapId()))
                .findFirst();

        if (target.isEmpty()) {
            result.combatOutcomes.add(CombatOutcome.failure(entity.getId(), null, CombatFailureReason.NO_TARGET));
            return;
        }

        WorldEntity targetEntity = target.get();
        if (!isCombatEligible(entity, targetEntity)) {
            result.combatOutcomes.add(CombatOutcome.failure(entity.getId(), targetEntity.getId(),
                    CombatFailureReason.NOT_ELIGIBLE));
            return;
        }

        Combat combat = createCombat(entity, targetEntity);
        state.combats.put(combat.getId(), combat);
        entity.setCurrentCombatId(combat.getId());
        targetEntity.setCurrentCombatId(combat.getId());

        CombatLog log = new CombatLog();
        log.setId(UUID.randomUUID().toString());
        log.setCombatId(combat.getId());
        log.setTurnNumber(combat.getTurnNumber());
        log.setActorId(entity.getId());
        log.setTargetId(targetEntity.getId());
        log.setActionType("COMBAT_START");
        log.setDescription(entity.getName() + " engaged " + targetEntity.getName());
        log.setNeutral(false);
        log.setTimestamp(Instant.now());
        state.combatLogs.put(log.getId(), log);

        result.combatOutcomes.add(CombatOutcome.started(combat.getId(), entity.getId(), targetEntity.getId()));
    }

    private boolean isCombatEligible(WorldEntity instigator, WorldEntity target) {
        if (!instigator.isDuelable() || !target.isDuelable()) {
            return false;
        }
        if (!instigator.isAlive() || !target.isAlive()) {
            return false;
        }
        return instigator.getCurrentCombatId() == null && target.getCurrentCombatId() == null;
    }

    private Combat createCombat(WorldEntity instigator, WorldEntity target) {
        Combat combat = new Combat();
        combat.setId(UUID.randomUUID().toString());
        combat.setPlayerIds(List.of(instigator.getId(), target.getId()));
        combat.setActive(true);
        combat.setTurnNumber(1);
        combat.setCurrentTurnPlayerId(instigator.getId());
        combat.setCreatedAt(Instant.now());
        combat.setPlayerHealthStarting(Map.of(
                instigator.getId(), instigator.getMaxHealth(),
                target.getId(), target.getMaxHealth()));
        combat.setPlayerHealth(Map.of(
                instigator.getId(), instigator.getCurrentHealth(),
                target.getId(), target.getCurrentHealth()));
        combat.setPlayerActionPoints(new HashMap<>());
        return combat;
    }

    private String positionKey(int x, int y, int z, String submapId) {
        return submapId + ":" + x + ":" + y + ":" + z;
    }

    private static class Position {
        private final int x;
        private final int y;
        private final int z;

        private Position(int x, int y, int z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }

    public static class WorldSimulationState {
        private final Map<String, WorldEntity> entities = new HashMap<>();
        private final Map<String, MoveRequest> pendingMoveRequests = new HashMap<>();
        private final Map<String, MoveRequest> activeMoveRequests = new HashMap<>();
        private final List<WorldObject> worldObjects = new ArrayList<>();
        private final Map<String, Combat> combats = new HashMap<>();
        private final Map<String, CombatLog> combatLogs = new HashMap<>();
        private int tickNumber;

        public Map<String, WorldEntity> getEntities() {
            return entities;
        }

        public List<WorldObject> getWorldObjects() {
            return worldObjects;
        }

        public Map<String, Combat> getCombats() {
            return combats;
        }

        public Map<String, CombatLog> getCombatLogs() {
            return combatLogs;
        }

        public int getTickNumber() {
            return tickNumber;
        }
    }

    public static class TickResult {
        private final List<MovementOutcome> movementOutcomes = new ArrayList<>();
        private final List<CombatOutcome> combatOutcomes = new ArrayList<>();
        private int tickNumber;

        public List<MovementOutcome> getMovementOutcomes() {
            return movementOutcomes;
        }

        public List<CombatOutcome> getCombatOutcomes() {
            return combatOutcomes;
        }

        public int getTickNumber() {
            return tickNumber;
        }
    }

    public enum MoveFailureReason {
        OUT_OF_BOUNDS,
        INVALID_PARTITION,
        INVALID_SUBMAP,
        BLOCKED_TRAVERSAL,
        OCCUPIED,
    }

    public enum CombatFailureReason {
        NO_TARGET,
        NOT_ELIGIBLE
    }

    public static class MovementOutcome {
        private final String entityId;
        private final boolean moved;
        private final MoveFailureReason failureReason;
        private final Integer x;
        private final Integer y;
        private final Integer z;

        private MovementOutcome(String entityId, boolean moved, MoveFailureReason failureReason,
                                Integer x, Integer y, Integer z) {
            this.entityId = entityId;
            this.moved = moved;
            this.failureReason = failureReason;
            this.x = x;
            this.y = y;
            this.z = z;
        }

        public static MovementOutcome moved(String entityId, int x, int y, int z) {
            return new MovementOutcome(entityId, true, null, x, y, z);
        }

        public static MovementOutcome failure(String entityId, MoveFailureReason reason) {
            return new MovementOutcome(entityId, false, reason, null, null, null);
        }

        public String getEntityId() {
            return entityId;
        }

        public boolean isMoved() {
            return moved;
        }

        public MoveFailureReason getFailureReason() {
            return failureReason;
        }

        public Integer getX() {
            return x;
        }

        public Integer getY() {
            return y;
        }

        public Integer getZ() {
            return z;
        }
    }

    public static class CombatOutcome {
        private final String combatId;
        private final String instigatorId;
        private final String targetId;
        private final CombatFailureReason failureReason;

        private CombatOutcome(String combatId, String instigatorId, String targetId, CombatFailureReason failureReason) {
            this.combatId = combatId;
            this.instigatorId = instigatorId;
            this.targetId = targetId;
            this.failureReason = failureReason;
        }

        public static CombatOutcome started(String combatId, String instigatorId, String targetId) {
            return new CombatOutcome(combatId, instigatorId, targetId, null);
        }

        public static CombatOutcome failure(String instigatorId, String targetId, CombatFailureReason reason) {
            return new CombatOutcome(null, instigatorId, targetId, reason);
        }

        public String getCombatId() {
            return combatId;
        }

        public String getInstigatorId() {
            return instigatorId;
        }

        public String getTargetId() {
            return targetId;
        }

        public CombatFailureReason getFailureReason() {
            return failureReason;
        }
    }

    private static class MovementValidation {
        private final boolean valid;
        private final MoveFailureReason failureReason;

        private MovementValidation(boolean valid, MoveFailureReason failureReason) {
            this.valid = valid;
            this.failureReason = failureReason;
        }

        private static MovementValidation success() {
            return new MovementValidation(true, null);
        }

        private static MovementValidation failure(MoveFailureReason reason) {
            return new MovementValidation(false, reason);
        }
    }
}
