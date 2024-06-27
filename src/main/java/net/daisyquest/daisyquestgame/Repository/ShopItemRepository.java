package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.ShopItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShopItemRepository extends MongoRepository<ShopItem, String> {
    // You can add custom query methods here if needed
}
