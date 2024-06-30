package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.SimulationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SimulationLogRepository  extends MongoRepository<SimulationLog, String> {
    Page<SimulationLog> findByCastleId(String p_castleId, PageRequest pageRequest);
}
