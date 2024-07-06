package net.daisyquest.daisyquestgame.Service;


import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class WorldMapService {
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

    @Transactional
    public Player movePlayer(String playerId, int newX, int newY) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));

        WorldMap worldMap = getWorldMap();
        int worldPixelWidth = worldMap.getWidth() * LAND_SIZE;
        int worldPixelHeight = worldMap.getHeight() * LAND_SIZE;

        // Wrap around the world if necessary
        newX = (newX + worldPixelWidth) % worldPixelWidth;
        newY = (newY + worldPixelHeight) % worldPixelHeight;

        player.setWorldPositionX(newX);
        player.setWorldPositionY(newY);
        return playerRepository.save(player);
    }

    public List<Player> getPlayersInViewport(int centerX, int centerY, int viewportWidth, int viewportHeight) {
        WorldMap worldMap = getWorldMap();
        int worldPixelWidth = worldMap.getWidth() * LAND_SIZE;
        int worldPixelHeight = worldMap.getHeight() * LAND_SIZE;

        // Calculate the viewport boundaries
        int leftX = Math.max(0, centerX - viewportWidth / 2);
        int rightX = Math.min(worldPixelWidth - 1, centerX + viewportWidth / 2);
        int topY = Math.max(0, centerY - viewportHeight / 2);
        int bottomY = Math.min(worldPixelHeight - 1, centerY + viewportHeight / 2);
        //todo:cleanup
        // Query for players within these boundaries
        var x = playerRepository.findByWorldPositionXBetweenAndWorldPositionYBetween(leftX, rightX, topY, bottomY);
        for(Player p : x){
            p.setInventory(playerInventoryRepository.findByPlayerId(p.getId()));
        }
        return x;
        }

    public Land getLandAtPosition(int x, int y) {
        WorldMap worldMap = getWorldMap();
        int landX = (x / LAND_SIZE) % worldMap.getWidth();
        int landY = (y / LAND_SIZE) % worldMap.getHeight();
        return landRepository.findByXCoordinateAndYCoordinate(landX, landY);
    }


    public boolean isPlayerNearSubmapEntrance(Player player, String submapId) {
        Submap submap = submapRepository.findById(submapId)
                .orElseThrow(() -> new IllegalArgumentException("Submap not found with id: " + submapId));


        //TODO: FIX
        // Calculate the distance between the player and the submap entrance
    //    double distance = calculateDistance(player.getWorldPositionX(), player.getWorldPositionY(),
        //        submap.getEntranceX(), submap.getEntranceY());

        // Define a threshold distance for submap entrance (e.g., 5 units)

        double distance = 1;
        double threshold = 5.0;


        return distance <= threshold;
    }

    private double calculateDistance(int x1, int y1, int x2, int y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    }
