package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.TroopType;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TroopTypeRepository extends MongoRepository<TroopType, String> {}
