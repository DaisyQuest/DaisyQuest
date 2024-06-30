package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.TroopTitle;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TroopTitleRepository extends MongoRepository<TroopTitle, String> {
    List<TroopTitle> findAllByOrderByMinKillCountAsc();
}
