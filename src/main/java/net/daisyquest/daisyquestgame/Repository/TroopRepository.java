package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.Troop;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TroopRepository extends MongoRepository<Troop, String> {}
