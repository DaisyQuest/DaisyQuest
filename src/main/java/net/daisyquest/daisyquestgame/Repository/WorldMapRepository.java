package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.WorldMap;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WorldMapRepository extends MongoRepository<WorldMap, String> {
}