package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Repository.PlayerInventoryRepository;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Service.Initializer.PlayerInitializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;


@Service
public class NPCSpawningService {
    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private WorldMapService worldMapService;

    @Autowired
    private ItemService itemService;

    @Autowired
    private PlayerInventoryRepository playerInventoryRepository;

    @Autowired
    private EquipmentPropertyService equipmentPropertyService;

    @Autowired
    private SpellService spellService;

    @Autowired
    private NPCTemplateService npcTemplateService;

    private Random random = new Random();

    @Scheduled(fixedRate = 600000) // Run every 5 minutes
    public void spawnNPCs() {
        WorldMap worldMap = worldMapService.getWorldMap();
        int worldWidth = worldMap.getWidth() * WorldMapService.LAND_SIZE;
        int worldHeight = worldMap.getHeight() * WorldMapService.LAND_SIZE;

        // Spawn 1-3 NPCs each time
        int npcCount = random.nextInt(2) + 1;
        List<NPCTemplate> availableTemplates = npcTemplateService.getAllTemplates();

        for (int i = 0; i < npcCount; i++) {
            NPCTemplate template = availableTemplates.get(random.nextInt(availableTemplates.size()));
            Player npc = createNPC(template, worldWidth, worldHeight);

            if (i == 1) {
                npc.setCurrentSubmapId("60d5ec9f82c2a8c9a8b9e1a2");
                npc.setSubmapCoordinateX(100);
                npc.setSubmapCoordinateY(100);
            }

            npc = playerRepository.save(npc);
            npc.setInventory(new PlayerInventory(npc.getId(), 10));
            npc.getInventory().setEquipmentProperties(equipmentPropertyService.getInitialEquipmentPropertiesForPlayer());

            // Add items based on drop rates
            for (Map.Entry<String, BigDecimal> entry : template.getItems().entrySet()) {
                if (random.nextDouble() < entry.getValue().doubleValue()) {
                    npc.getInventory().addItem(itemService.getItemByName(entry.getKey()), 1);
                }
            }

            playerInventoryRepository.save(npc.getInventory());
            playerRepository.save(npc);
        }
    }

    private Player createNPC(NPCTemplate template, int worldWidth, int worldHeight) {
        Player npc = new Player();
        npc.setNPC(true);
        npc.setDuelable(template.isDuelable());
        npc.setUsername(template.getName());
        npc.setWorldPositionX(random.nextInt(worldWidth));
        npc.setWorldPositionY(random.nextInt(worldHeight));
        npc.setSubspriteFace(template.getSprite());
        npc.setSubspriteEyes(template.getSprite());
        npc.setSubspriteBackground(template.getSprite());
        npc.setSubspriteHairHat(template.getSprite());

        int level = random.nextInt(15);
        npc.setLevel(level);
        npc.setAttributes(PlayerInitializer.getInitializedCombatMapForNPC(level, level));
        npc.setCurrentMana(template.getCurrentMana());
        npc.setMaxMana(template.getMaxMana());

        List<Spell> knownSpells = new ArrayList<>();
        for (String spellName : template.getSpells()) {
            knownSpells.add(spellService.getSpellByName(spellName));
        }
        npc.setKnownSpells(knownSpells);

        System.out.println(npc.getUsername() + " spawned at (X: " + npc.getWorldPositionX() + " Y: " + npc.getWorldPositionY() + ")");
        return npc;
    }
}


