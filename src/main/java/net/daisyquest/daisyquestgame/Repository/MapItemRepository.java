package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.MapItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface MapItemRepository extends MongoRepository<MapItem, String> {
    @Query("{'worldMapCoordinateX': {$gte: ?0, $lte: ?1}, 'worldMapCoordinateY': {$gte: ?2, $lte: ?3}}")
    List<MapItem> findItemsInWorldMapRange(int minX, int maxX, int minY, int maxY);
}