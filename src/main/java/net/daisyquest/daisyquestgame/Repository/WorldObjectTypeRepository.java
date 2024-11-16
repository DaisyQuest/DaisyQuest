package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.WorldObjectType;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WorldObjectTypeRepository extends MongoRepository<WorldObjectType, String> {

}
