package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.Combat;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CombatRepository extends MongoRepository<Combat, String> {

}