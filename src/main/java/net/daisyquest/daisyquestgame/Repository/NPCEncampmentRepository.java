package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.NPCEncampment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

// NPCEncampmentRepository.java
@Repository
public interface NPCEncampmentRepository extends MongoRepository<NPCEncampment, String> {
}