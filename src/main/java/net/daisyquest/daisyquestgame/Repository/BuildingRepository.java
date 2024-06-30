package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.*;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BuildingRepository extends MongoRepository<Building, String> {}

