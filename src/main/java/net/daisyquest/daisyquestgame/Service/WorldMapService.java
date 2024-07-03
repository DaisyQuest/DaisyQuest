package net.daisyquest.daisyquestgame.Service;


import net.daisyquest.daisyquestgame.Model.Land;
import net.daisyquest.daisyquestgame.Model.LandType;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.WorldMap;
import net.daisyquest.daisyquestgame.Repository.LandRepository;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Repository.WorldMapRepository;
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

        // Query for players within these boundaries
        return playerRepository.findByWorldPositionXBetweenAndWorldPositionYBetween(leftX, rightX, topY, bottomY);
    }

    public Land getLandAtPosition(int x, int y) {
        WorldMap worldMap = getWorldMap();
        int landX = (x / LAND_SIZE) % worldMap.getWidth();
        int landY = (y / LAND_SIZE) % worldMap.getHeight();
        return landRepository.findByXCoordinateAndYCoordinate(landX, landY);
    }
    }
