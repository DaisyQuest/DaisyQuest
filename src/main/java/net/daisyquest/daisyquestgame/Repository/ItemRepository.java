package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.Item;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ItemRepository extends MongoRepository<Item, String> {

}

