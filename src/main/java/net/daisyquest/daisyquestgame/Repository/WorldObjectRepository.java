package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.WorldObject;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface WorldObjectRepository extends MongoRepository<WorldObject, String> {

    @Query("{'xPos': {$gte: ?0, $lte: ?1}, 'yPos': {$gte: ?2, $lte: ?3}}")
    List<WorldObject> findByxPosBetweenAndyPosBetween(int minX, int maxX, int minY, int maxY);

    // Helper methods for specific locations
    List<WorldObject> findByXPosAndYPos(int x, int y);
}
