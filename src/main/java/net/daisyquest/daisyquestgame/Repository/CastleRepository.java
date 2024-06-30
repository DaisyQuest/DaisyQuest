package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.Castle;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CastleRepository extends MongoRepository<Castle, String> {
    Castle findByOwnerId(String ownerId);
}
