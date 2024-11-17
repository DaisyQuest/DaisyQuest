package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.SpecialAttack;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SpecialAttackRepository extends MongoRepository<SpecialAttack, String> {
    SpecialAttack findSpecialAttackBySpecialAttackId(String specialAttackId);
}
