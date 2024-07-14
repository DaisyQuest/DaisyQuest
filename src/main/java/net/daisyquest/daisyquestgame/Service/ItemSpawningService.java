package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Model.MapItem;
import net.daisyquest.daisyquestgame.Model.WorldMap;
import net.daisyquest.daisyquestgame.Repository.ItemRepository;
import net.daisyquest.daisyquestgame.Repository.MapItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class ItemSpawningService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private MapItemRepository mapItemRepository;

    @Autowired
    private WorldMapService worldMapService;

    private final Random random = new Random();

    @Scheduled(fixedRate = 60000) // Run every 1 minute
    public void spawnItems() {
        WorldMap worldMap = worldMapService.getWorldMap();
        List<Item> allItems = itemRepository.findAll();
        int itemsToSpawn = random.nextInt(5) + 1; // Spawn 1-5 items

        for (int i = 0; i < itemsToSpawn; i++) {
            Item randomItem = allItems.get(random.nextInt(allItems.size()));

            int x = random.nextInt(worldMap.getWidth() * WorldMapService.LAND_SIZE);
            int y = random.nextInt(worldMap.getHeight() * WorldMapService.LAND_SIZE);

            MapItem mapItem = new MapItem();
            mapItem.setItem(randomItem);
            mapItem.setWorldMapCoordinateX(x);
            mapItem.setWorldMapCoordinateY(y);
            mapItem.setQuantity(1);
            System.err.println("<b>"+mapItem+"</b>");

            mapItemRepository.save(mapItem);
        }
    }
}
