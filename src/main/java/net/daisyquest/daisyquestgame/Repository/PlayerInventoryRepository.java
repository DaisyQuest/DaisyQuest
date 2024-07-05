package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.PlayerInventory;
import net.daisyquest.daisyquestgame.Model.Shop;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PlayerInventoryRepository  extends MongoRepository<PlayerInventory, String> {
    PlayerInventory findByPlayerId(String playerId);

}
