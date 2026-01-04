package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Service.WorldSimulationService.CombatFailureReason;
import net.daisyquest.daisyquestgame.Service.WorldSimulationService.MoveFailureReason;
import net.daisyquest.daisyquestgame.Service.WorldSimulationService.TickResult;
import net.daisyquest.daisyquestgame.Service.WorldSimulationService.WorldSimulationState;
import org.junit.jupiter.api.Test;

import java.util.EnumSet;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class WorldSimulationServiceTest {

    private final WorldSimulationService service = new WorldSimulationService();

    @Test
    void movesOneStepPerTickWithDeterministicPathing() {
        WorldSimulationState state = service.createState();
        WorldEntity entity = buildEntity("player-1", 0, 0, 0);
        service.registerEntity(state, entity);

        Submap submap = buildSubmap("submap-1", 5, 5, 3);
        entity.setSubmapId(submap.getId());

        service.submitMoveRequest(state, entity.getId(), new MoveRequest(2, 1, 0, MoveIntent.MOVE));

        TickResult firstTick = service.tick(state, null, submap, null);
        assertThat(firstTick.getMovementOutcomes()).hasSize(1);
        assertThat(entity.getX()).isEqualTo(1);
        assertThat(entity.getY()).isEqualTo(0);

        TickResult secondTick = service.tick(state, null, submap, null);
        assertThat(secondTick.getMovementOutcomes()).hasSize(1);
        assertThat(entity.getX()).isEqualTo(2);
        assertThat(entity.getY()).isEqualTo(0);

        TickResult thirdTick = service.tick(state, null, submap, null);
        assertThat(entity.getX()).isEqualTo(2);
        assertThat(entity.getY()).isEqualTo(1);
        assertThat(thirdTick.getTickNumber()).isEqualTo(3);
    }

    @Test
    void rejectsMoveOutsideSubmapBounds() {
        WorldSimulationState state = service.createState();
        WorldEntity entity = buildEntity("player-1", 0, 0, 0);
        Submap submap = buildSubmap("submap-1", 3, 3, 1);
        entity.setSubmapId(submap.getId());
        service.registerEntity(state, entity);

        service.submitMoveRequest(state, entity.getId(), new MoveRequest(5, 0, 0, MoveIntent.MOVE));

        TickResult tick = service.tick(state, null, submap, null);
        assertThat(tick.getMovementOutcomes()).hasSize(1);
        assertThat(tick.getMovementOutcomes().get(0).getFailureReason())
                .isEqualTo(MoveFailureReason.OUT_OF_BOUNDS);
        assertThat(entity.getX()).isZero();
    }

    @Test
    void validatesAgainstWorldMapWhenNoSubmapProvided() {
        WorldSimulationState state = service.createState();
        WorldEntity entity = buildEntity("player-1", 0, 0, 0);
        service.registerEntity(state, entity);

        WorldMap worldMap = new WorldMap();
        worldMap.setWidth(2);
        worldMap.setLength(2);
        worldMap.setHeight(1);

        service.submitMoveRequest(state, entity.getId(), new MoveRequest(1, 1, 0, MoveIntent.MOVE));

        TickResult tick = service.tick(state, worldMap, null, null);
        assertThat(tick.getMovementOutcomes()).hasSize(1);
        assertThat(entity.getX()).isEqualTo(1);
        assertThat(entity.getY()).isEqualTo(0);
    }

    @Test
    void blocksTraversalWhenWorldObjectIsImpassable() {
        WorldSimulationState state = service.createState();
        WorldEntity entity = buildEntity("player-1", 0, 0, 0);
        entity.setTraversalCapabilities(EnumSet.of(WorldObjectTraversalType.FREE));
        service.registerEntity(state, entity);

        Submap submap = buildSubmap("submap-1", 3, 3, 1);
        entity.setSubmapId(submap.getId());

        WorldObjectType type = new WorldObjectType();
        type.setTraversalType(WorldObjectTraversalType.NONE);
        WorldObject worldObject = new WorldObject();
        worldObject.setWorldObjectType(type);
        worldObject.setXPos(1);
        worldObject.setYPos(0);
        worldObject.setZPos(0);
        service.registerWorldObject(state, worldObject);

        service.submitMoveRequest(state, entity.getId(), new MoveRequest(1, 0, 0, MoveIntent.MOVE));

        TickResult tick = service.tick(state, null, submap, null);
        assertThat(tick.getMovementOutcomes()).hasSize(1);
        assertThat(tick.getMovementOutcomes().get(0).getFailureReason())
                .isEqualTo(MoveFailureReason.BLOCKED_TRAVERSAL);
        assertThat(entity.getX()).isZero();
    }

    @Test
    void rejectsMoveWhenEntityIsInDifferentSubmap() {
        WorldSimulationState state = service.createState();
        WorldEntity entity = buildEntity("player-1", 0, 0, 0);
        entity.setSubmapId("submap-a");
        service.registerEntity(state, entity);

        Submap submap = buildSubmap("submap-b", 3, 3, 1);

        service.submitMoveRequest(state, entity.getId(), new MoveRequest(1, 0, 0, MoveIntent.MOVE));

        TickResult tick = service.tick(state, null, submap, null);
        assertThat(tick.getMovementOutcomes()).hasSize(1);
        assertThat(tick.getMovementOutcomes().get(0).getFailureReason())
                .isEqualTo(MoveFailureReason.INVALID_SUBMAP);
        assertThat(entity.getX()).isZero();
    }

    @Test
    void startsCombatOnInteractionWithEligibleTarget() {
        WorldSimulationState state = service.createState();
        Submap submap = buildSubmap("submap-1", 5, 5, 1);

        WorldEntity attacker = buildEntity("player-1", 0, 0, 0);
        attacker.setSubmapId(submap.getId());
        WorldEntity defender = buildEntity("npc-1", 1, 0, 0);
        defender.setSubmapId(submap.getId());
        defender.setEntityType(WorldEntityType.NPC);

        service.registerEntity(state, attacker);
        service.registerEntity(state, defender);

        service.submitMoveRequest(state, attacker.getId(), new MoveRequest(1, 0, 0, MoveIntent.INTERACT));

        TickResult tick = service.tick(state, null, submap, null);
        assertThat(tick.getCombatOutcomes()).hasSize(1);
        assertThat(tick.getCombatOutcomes().get(0).getCombatId()).isNotNull();
        assertThat(state.getCombats()).hasSize(1);
        assertThat(attacker.getCurrentCombatId()).isNotNull();
        assertThat(defender.getCurrentCombatId()).isNotNull();
        assertThat(state.getCombatLogs()).hasSize(1);
    }

    @Test
    void rejectsCombatWhenTargetIsNotEligible() {
        WorldSimulationState state = service.createState();
        Submap submap = buildSubmap("submap-1", 5, 5, 1);

        WorldEntity attacker = buildEntity("player-1", 0, 0, 0);
        attacker.setSubmapId(submap.getId());
        WorldEntity defender = buildEntity("npc-1", 1, 0, 0);
        defender.setSubmapId(submap.getId());
        defender.setDuelable(false);

        service.registerEntity(state, attacker);
        service.registerEntity(state, defender);

        service.submitMoveRequest(state, attacker.getId(), new MoveRequest(1, 0, 0, MoveIntent.INTERACT));

        TickResult tick = service.tick(state, null, submap, null);
        assertThat(tick.getCombatOutcomes()).hasSize(1);
        assertThat(tick.getCombatOutcomes().get(0).getFailureReason())
                .isEqualTo(CombatFailureReason.NOT_ELIGIBLE);
        assertThat(state.getCombats()).isEmpty();
    }

    @Test
    void preventsMovementWhenLandPartitionsAreInvalid() {
        WorldSimulationState state = service.createState();
        Submap submap = buildSubmap("submap-1", 5, 5, 1);

        WorldEntity entity = buildEntity("player-1", 0, 0, 0);
        entity.setSubmapId(submap.getId());
        service.registerEntity(state, entity);

        Land land = new Land();
        land.setPartitions(List.of(new LandPartition(1.5, 1)));

        service.submitMoveRequest(state, entity.getId(), new MoveRequest(1, 0, 0, MoveIntent.MOVE));

        TickResult tick = service.tick(state, null, submap, land);
        assertThat(tick.getMovementOutcomes()).hasSize(1);
        assertThat(tick.getMovementOutcomes().get(0).getFailureReason())
                .isEqualTo(MoveFailureReason.INVALID_PARTITION);
        assertThat(entity.getX()).isZero();
    }

    @Test
    void resolvesSimultaneousCommandsDeterministically() {
        WorldSimulationState state = service.createState();
        Submap submap = buildSubmap("submap-1", 5, 5, 1);

        WorldEntity first = buildEntity("entity-a", 0, 0, 0);
        WorldEntity second = buildEntity("entity-b", 0, 1, 0);
        first.setSubmapId(submap.getId());
        second.setSubmapId(submap.getId());

        service.registerEntity(state, first);
        service.registerEntity(state, second);

        MoveRequest sharedTarget = new MoveRequest(1, 0, 0, MoveIntent.MOVE);
        service.submitMoveRequest(state, first.getId(), sharedTarget);
        service.submitMoveRequest(state, second.getId(), sharedTarget);

        TickResult tick = service.tick(state, null, submap, null);
        assertThat(tick.getMovementOutcomes()).hasSize(2);
        assertThat(first.getX()).isEqualTo(1);
        assertThat(second.getX()).isZero();
        assertThat(tick.getMovementOutcomes().stream()
                .anyMatch(outcome -> outcome.getFailureReason() == MoveFailureReason.OCCUPIED))
                .isTrue();
    }

    @Test
    void conflictingInteractionsOnlyStartSingleCombat() {
        WorldSimulationState state = service.createState();
        Submap submap = buildSubmap("submap-1", 5, 5, 1);

        WorldEntity target = buildEntity("entity-b", 1, 0, 0);
        WorldEntity first = buildEntity("entity-a", 0, 0, 0);
        WorldEntity second = buildEntity("entity-c", 1, 0, 0);
        target.setSubmapId(submap.getId());
        first.setSubmapId(submap.getId());
        second.setSubmapId(submap.getId());

        service.registerEntity(state, target);
        service.registerEntity(state, first);
        service.registerEntity(state, second);

        MoveRequest interact = new MoveRequest(1, 0, 0, MoveIntent.INTERACT);
        service.submitMoveRequest(state, first.getId(), interact);
        service.submitMoveRequest(state, second.getId(), interact);

        TickResult tick = service.tick(state, null, submap, null);
        assertThat(state.getCombats()).hasSize(1);
        assertThat(tick.getCombatOutcomes()).hasSize(2);
        assertThat(tick.getCombatOutcomes().stream()
                .anyMatch(outcome -> outcome.getFailureReason() == CombatFailureReason.NOT_ELIGIBLE))
                .isTrue();
    }

    @Test
    void interactionFailsWhenNoTargetIsPresent() {
        WorldSimulationState state = service.createState();
        Submap submap = buildSubmap("submap-1", 5, 5, 1);

        WorldEntity entity = buildEntity("entity-a", 0, 0, 0);
        entity.setSubmapId(submap.getId());
        service.registerEntity(state, entity);

        service.submitMoveRequest(state, entity.getId(), new MoveRequest(1, 0, 0, MoveIntent.INTERACT));

        TickResult tick = service.tick(state, null, submap, null);
        assertThat(tick.getCombatOutcomes()).hasSize(1);
        assertThat(tick.getCombatOutcomes().get(0).getFailureReason())
                .isEqualTo(CombatFailureReason.NO_TARGET);
    }

    private WorldEntity buildEntity(String id, int x, int y, int z) {
        WorldEntity entity = new WorldEntity();
        entity.setId(id);
        entity.setName(id);
        entity.setEntityType(WorldEntityType.PLAYER);
        entity.setX(x);
        entity.setY(y);
        entity.setZ(z);
        return entity;
    }

    private Submap buildSubmap(String id, int width, int length, int height) {
        Submap submap = new Submap();
        submap.setId(id);
        submap.setWidth(width);
        submap.setLength(length);
        submap.setHeight(height);
        return submap;
    }
}
