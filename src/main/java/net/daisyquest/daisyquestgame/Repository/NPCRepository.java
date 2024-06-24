package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.NPC;
import org.springframework.data.mongodb.repository.MongoRepository;

    public interface NPCRepository extends MongoRepository<NPC, String> {
    }

