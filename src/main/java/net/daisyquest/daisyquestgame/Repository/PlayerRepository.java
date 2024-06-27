package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.Player;
import org.springframework.data.mongodb.repository.MongoRepository;

    public interface PlayerRepository extends MongoRepository<Player, String> {
        Player findByUsername(String username);
        boolean existsByUsername(String username);
    }

