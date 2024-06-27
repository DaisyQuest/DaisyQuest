package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.Currency;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CurrencyRepository extends MongoRepository<Currency, String> {
    // You can add custom query methods here if needed
}