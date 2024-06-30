package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.BuildingType;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BuildingTypeRepository extends MongoRepository<BuildingType, String> {

}
