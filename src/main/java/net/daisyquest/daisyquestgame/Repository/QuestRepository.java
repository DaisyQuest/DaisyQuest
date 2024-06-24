package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.Quest;
import org.springframework.data.mongodb.repository.MongoRepository;

    public interface QuestRepository extends MongoRepository<Quest, String> {

    }


