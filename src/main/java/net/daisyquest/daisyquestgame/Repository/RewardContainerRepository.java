package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.RewardContainer;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RewardContainerRepository extends MongoRepository<RewardContainer, String> {
    List<RewardContainer> findByPlayerId(String playerId);
}