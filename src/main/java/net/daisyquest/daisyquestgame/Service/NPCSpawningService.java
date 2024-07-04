package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.WorldMap;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Service.Initializer.PlayerInitializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Random;

@Service
public class NPCSpawningService {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private WorldMapService worldMapService;

    @Autowired ItemService itemService;

    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void spawnNPCs() {
        WorldMap worldMap = worldMapService.getWorldMap();
        int worldWidth = worldMap.getWidth() * WorldMapService.LAND_SIZE;
        int worldHeight = worldMap.getHeight() * WorldMapService.LAND_SIZE;

        // Spawn 1-3 NPCs each time
        int npcCount = new Random().nextInt(3) + 1;

        for (int i = 0; i < npcCount; i++) {
            Player npc = createNPC(worldWidth, worldHeight);
            playerRepository.save(npc);
        }
    }

    private Player createNPC(int worldWidth, int worldHeight) {
        Player npc = new Player();
        npc.setNPC(true);
        npc.setDuelable(true);
        npc.setUsername("Skeleton");
        npc.setWorldPositionX(new Random().nextInt(1000));
        npc.setWorldPositionY(new Random().nextInt(1000));
        npc.setSubspriteFace("enemy_skeleton");
        npc.setSubspriteEyes("enemy_skeleton");
        npc.setSubspriteBackground("enemy_skeleton");
        npc.setSubspriteHairHat("enemy_skeleton");
        npc.setLevel(3);
        npc.setAttributes(PlayerInitializer.getInitializedCombatMapForNPC(100, 20));
        npc.setCurrentMana(100);
        npc.setMaxMana(100);
        npc.setKnownSpells(new ArrayList<>());
        npc.setInventory(itemService.generateDropsFromNPC(npc.getId()));
        // Set other NPC attributes (level, health, etc.)
        return npc;
    }
}
