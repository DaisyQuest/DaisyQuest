package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.PlayerInventory;
import net.daisyquest.daisyquestgame.Model.WorldMap;
import net.daisyquest.daisyquestgame.Repository.PlayerInventoryRepository;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Service.Initializer.PlayerInitializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class NPCSpawningService {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private WorldMapService worldMapService;

    @Autowired ItemService itemService;

    @Autowired
    private PlayerInventoryRepository playerInventoryRepository;

    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void spawnNPCs() {
        WorldMap worldMap = worldMapService.getWorldMap();
        int worldWidth = worldMap.getWidth() * WorldMapService.LAND_SIZE;
        int worldHeight = worldMap.getHeight() * WorldMapService.LAND_SIZE;

        // Spawn 1-3 NPCs each time
        int npcCount = new Random().nextInt(3) + 1;

        for (int i = 0; i < npcCount; i++) {
            //todo: clean this up.
            Player npc = createNPC(worldWidth, worldHeight);
            if(i == 1){
                npc.setCurrentSubmapId("60d5ec9f82c2a8c9a8b9e1a2");
                npc.setSubmapCoordinateX(100);
                npc.setSubmapCoordinateY(100);
            }

            npc = playerRepository.save(npc);
            npc.setInventory(new PlayerInventory(npc.getId(), 10));
            npc.getInventory().setEquipmentProperties(equipmentPropertyService.getInitialEquipmentPropertiesForPlayer());
            npc.getInventory().addItem(itemService.getItemByName("Bone Sword"), 1);
            playerInventoryRepository.save(npc.getInventory());
            playerRepository.save(npc);
        }
    }
    @Autowired
    EquipmentPropertyService equipmentPropertyService;

    @Autowired
    SpellService spellService;
    private Player createNPC(int worldWidth, int worldHeight) {
        Player npc = new Player();
        npc.setNPC(true);
        npc.setDuelable(true);
        npc.setUsername("Skeleton");
        npc.setWorldPositionX(new Random().nextInt(20000));
        npc.setWorldPositionY(new Random().nextInt(20000));
        npc.setSubspriteFace("enemy_skeleton");
        npc.setSubspriteEyes("enemy_skeleton");
        npc.setSubspriteBackground("enemy_skeleton");
        npc.setSubspriteHairHat("enemy_skeleton");
        Random r = new Random(System.currentTimeMillis());
        int x = r.nextInt(15);
        npc.setLevel(x);

        npc.setAttributes(PlayerInitializer.getInitializedCombatMapForNPC(x, x));
        npc.setCurrentMana(1000);
        npc.setMaxMana(1000);
        npc.setKnownSpells(List.of(spellService.getSpell("skeleton_rot")));
        // Set other NPC attributes (level, health, etc.)

        System.err.println(npc.getUsername() + " spawned at (X: " + npc.getWorldPositionX() + " Y: "+ npc.getWorldPositionY() + ")");

        return npc;
    }
}

