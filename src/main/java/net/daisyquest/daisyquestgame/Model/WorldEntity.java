package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.EnumSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorldEntity {
    private String id;
    private String name;
    private WorldEntityType entityType;
    private boolean duelable = true;
    private boolean alive = true;
    private int currentMana;
    private int maxMana;
    private int currentHealth = 100;
    private int maxHealth = 100;
    private String submapId;
    private int x;
    private int y;
    private int z;
    private String currentCombatId;
    private Set<WorldObjectTraversalType> traversalCapabilities =
            EnumSet.of(WorldObjectTraversalType.FREE);

    public boolean canTraverse(WorldObjectTraversalType traversalType) {
        if (traversalType == null || traversalType == WorldObjectTraversalType.FREE) {
            return true;
        }
        return traversalCapabilities != null && traversalCapabilities.contains(traversalType);
    }

    public static WorldEntity fromPlayer(Player player) {
        WorldEntity entity = new WorldEntity();
        entity.setId(player.getId());
        entity.setName(player.getUsername());
        entity.setEntityType(WorldEntityType.PLAYER);
        entity.setDuelable(player.isDuelable());
        entity.setAlive(player.isAlive());
        entity.setCurrentMana(player.getCurrentMana());
        entity.setMaxMana(player.getMaxMana());
        entity.setSubmapId(player.getCurrentSubmapId());
        entity.setX(player.getSubmapCoordinateX());
        entity.setY(player.getSubmapCoordinateY());
        entity.setZ(player.getSubmapCoordinateZ());
        return entity;
    }

    public static WorldEntity fromNpcTemplate(NPCTemplate template, String entityId,
                                              String submapId, int x, int y, int z) {
        WorldEntity entity = new WorldEntity();
        entity.setId(entityId);
        entity.setName(template.getName());
        entity.setEntityType(WorldEntityType.NPC);
        entity.setDuelable(template.isDuelable());
        entity.setAlive(true);
        entity.setCurrentMana(template.getCurrentMana());
        entity.setMaxMana(template.getMaxMana());
        entity.setSubmapId(submapId);
        entity.setX(x);
        entity.setY(y);
        entity.setZ(z);
        return entity;
    }
}
