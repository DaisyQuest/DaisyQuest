package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.Shop;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShopRepository extends MongoRepository<Shop, String> {
    Shop findByOwnerId(String ownerId);
}
