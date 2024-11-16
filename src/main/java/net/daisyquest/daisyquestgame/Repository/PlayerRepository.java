package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.Player;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PlayerRepository extends MongoRepository<Player, String> {
        Player findByUsername(String username);
        Player findTopByCurrentMana(int numOfBest);
        boolean existsByUsername(String username);

         List<Player> findByCurrentSubmapId(String submapId);

    List<Player> findByWorldPositionXBetweenAndWorldPositionYBetween(int minX, int maxX, int minY, int maxY);
}

