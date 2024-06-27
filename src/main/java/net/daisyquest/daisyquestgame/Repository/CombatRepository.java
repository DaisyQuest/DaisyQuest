package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.Combat;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface CombatRepository extends MongoRepository<Combat, String> {
    List<Combat> findByActiveTrueAndCreatedAtBefore(Instant threshold);
    List<Combat> findByActiveTrue();
}