package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Service.ActiveInteraction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ActiveInteractionRepository extends MongoRepository<ActiveInteraction, String> {
    Optional<ActiveInteraction> findByPlayerIdAndStatus(String playerId, ActiveInteraction.InteractionStatus interactionStatus);
}
