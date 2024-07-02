package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.CombatLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CombatLogRepository extends MongoRepository<CombatLog, String> {
    List<CombatLog> findByCombatIdOrderByTimestampAsc(String combatId);
}
