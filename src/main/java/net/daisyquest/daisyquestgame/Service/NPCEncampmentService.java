package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Repository.NPCEncampmentRepository;
import net.daisyquest.daisyquestgame.Repository.PlayerInventoryRepository;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Service.Initializer.PlayerInitializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class NPCEncampmentService {
    @Autowired
    private NPCEncampmentRepository encampmentRepository;
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

    @Scheduled(fixedRate = 12000000)
    public void spawnEncampments() {
        WorldMap worldMap = worldMapService.getWorldMap();
        int worldCenterX = worldMap.getWidth() * WorldMapService.LAND_SIZE / 2;
        int worldCenterY = worldMap.getHeight() * WorldMapService.LAND_SIZE / 2;

        // Spawn 1-3 encampments each time
        int encampmentCount = new Random().nextInt(3) + 1;
        for (int i = 0; i < encampmentCount; i++) {
            NPCEncampment encampment = createEncampment(worldCenterX, worldCenterY);
            encampmentRepository.save(encampment);
            spawnNPCsForEncampment(encampment);
        }
    }

    private static final int MIN_DISTANCE_FROM_CENTER = 75;
    private static final int MAX_DISTANCE_FROM_CENTER = 300;

    private NPCEncampment createEncampment(int worldCenterX, int worldCenterY) {
        NPCEncampment encampment = new NPCEncampment();
        encampment.setName("Skeleton Encampment"); // You can randomize this

        // Set position within MIN_DISTANCE_FROM_CENTER and MAX_DISTANCE_FROM_CENTER of the world center
        Random random = new Random(System.currentTimeMillis());
        int distance = random.nextInt(MAX_DISTANCE_FROM_CENTER - MIN_DISTANCE_FROM_CENTER) + MIN_DISTANCE_FROM_CENTER;
        double angle = random.nextDouble() * 2 * Math.PI;

        int distanceX = (int) (Math.cos(angle) * distance);
        int distanceY = (int) (Math.sin(angle) * distance);

        encampment.setCoordinateX(worldCenterX + distanceX);
        encampment.setCoordinateY(worldCenterY + distanceY);

        encampment.setSprite("encampment_sprite"); // Set appropriate sprite

        // Set rewards
        EncampmentRewardData rewards = new EncampmentRewardData();
        rewards.getItemToQuantityMap().put(itemService.getItemByName("Raw Ruby").getName(), 100);
        encampment.setRewards(rewards);

        return encampment;
    }


    private static final int NPC_SPACING = 125;
    private static final int ENCAMPMENT_RADIUS = 400;

    private void spawnNPCsForEncampment(NPCEncampment encampment) {
        List<Player> npcs = new ArrayList<>();
        List<Player> bosses = new ArrayList<>();

        // Spawn boss NPC near the center
        Player boss = createNPC(encampment.getCoordinateX(), encampment.getCoordinateY(), true);
        bosses.add(boss);

        // Spawn regular NPCs
        List<Point> npcPositions = generateNPCPositions(3, ENCAMPMENT_RADIUS, NPC_SPACING);
        for (Point position : npcPositions) {
            Player npc = createNPC(
                    encampment.getCoordinateX() + position.x,
                    encampment.getCoordinateY() + position.y,
                    false
            );
            npcs.add(npc);
        }

        encampment.setNpcsToSpawn(npcs);
        encampment.setBossNPCs(bosses);
        // Save all NPCs
        playerRepository.saveAll(npcs);
        bosses = playerRepository.saveAll(bosses);
        encampment.setBossPlayerIds(bosses.stream().map(Player::getId).collect(Collectors.toList()));
        encampmentRepository.save(encampment);
    }

    private List<Point> generateNPCPositions(int count, int radius, int minDistance) {
        List<Point> positions = new ArrayList<>();
        Random random = new Random(System.currentTimeMillis());

        for (int i = 0; i < count; i++) {
            Point newPosition;
            do {
                double angle = random.nextDouble() * 2 * Math.PI;
                int distance = random.nextInt(radius);
                int x = (int) (Math.cos(angle) * distance);
                int y = (int) (Math.sin(angle) * distance);
                newPosition = new Point(x, y);
            } while (!isValidPosition(newPosition, positions, minDistance));

            positions.add(newPosition);
        }

        return positions;
    }

    private boolean isValidPosition(Point newPosition, List<Point> existingPositions, int minDistance) {
        return existingPositions.stream().allMatch(p ->
                Math.hypot(p.x - newPosition.x, p.y - newPosition.y) >= minDistance
        );
    }

    private Player createNPC(int x, int y, boolean isBoss) {
        Player npc = new Player();
        npc.setNPC(true);
        npc.setDuelable(true);
        npc.setUsername(isBoss ? "Skeleton Lord" : "Skeleton");

        // Set position
        npc.setWorldPositionX(x);
        npc.setWorldPositionY(y);

        npc.setSubspriteFace(isBoss ? "otherworldly_beast" : "enemy_skeleton");
        npc.setSubspriteEyes(isBoss ? "otherworldly_beast" : "enemy_skeleton");
        npc.setSubspriteBackground(isBoss ? "otherworldly_beast" : "enemy_skeleton");
        npc.setSubspriteHairHat(isBoss ? "otherworldly_beast" : "enemy_skeleton");

        int baseLevel = isBoss ? 20 : 10;
        int level = baseLevel + new Random().nextInt(6); // 20-25 for boss, 10-15 for regular
        npc.setLevel(level);
        npc.setAttributes(PlayerInitializer.getInitializedCombatMapForNPC(level, level));
        npc.setCurrentMana(1000);
        npc.setMaxMana(1000);
        npc.setKnownSpells(List.of(spellService.getSpell("skeleton_rot")));

        npc = playerRepository.save(npc);

        // Set inventory and equipment
        npc.setInventory(new PlayerInventory(npc.getId(), 10));
        npc.getInventory().setEquipmentProperties(equipmentPropertyService.getInitialEquipmentPropertiesForPlayer());
        npc.getInventory().addItem(isBoss? itemService.getItemByName("Otherworldly Mace") : itemService.getItemByName("Bone Sword"), 1);
        playerInventoryRepository.save(npc.getInventory());

        return npc;
    }


    public void checkAndRemoveEncampment(String encampmentId) {
        NPCEncampment encampment = encampmentRepository.findById(encampmentId).orElse(null);
        if (encampment != null) {
            boolean allBossesDefeated = encampment.getBossNPCs().stream().allMatch(boss -> !playerRepository.existsById(boss.getId()));
            if (allBossesDefeated) {
                encampmentRepository.delete(encampment);
                // Remove any remaining regular NPCs
                encampment.getNpcsToSpawn().forEach(npc -> playerRepository.deleteById(npc.getId()));
            }
        }
    }

    public List<NPCEncampment> getAllEncampments() {
        return encampmentRepository.findAll();
    }

    public List<NPCEncampment> getEncampmentsInViewport(int centerX, int centerY, int viewportWidth, int viewportHeight) {
        int left = centerX - viewportWidth / 2;
        int right = centerX + viewportWidth / 2;
        int top = centerY - viewportHeight / 2;
        int bottom = centerY + viewportHeight / 2;

        return encampmentRepository.findAll().stream()
                .filter(e -> e.getCoordinateX() >= left && e.getCoordinateX() <= right
                        && e.getCoordinateY() >= top && e.getCoordinateY() <= bottom)
                .collect(Collectors.toList());
    }

    class Point {
        int x, y;

        Point(int x, int y) {
            this.x = x;
            this.y = y;
        }
    }
        public NPCEncampment getEncampmentById(String id) {
            return encampmentRepository.findById(id).orElse(null);
        }
    }


