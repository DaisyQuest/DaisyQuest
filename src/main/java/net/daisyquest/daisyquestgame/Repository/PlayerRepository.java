package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.Player;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PlayerRepository extends MongoRepository<Player, String> {
        Player findByUsername(String username);
        Player findTopByCurrentMana(int numOfBest);
        boolean existsByUsername(String username);
        List<Player> findByWorldPositionXBetweenAndWorldPositionYBetween(int x, int x2, int y, int y2);
    }

