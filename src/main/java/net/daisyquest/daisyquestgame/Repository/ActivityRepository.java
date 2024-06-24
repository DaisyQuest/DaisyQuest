package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.Activity;
import org.springframework.data.mongodb.repository.MongoRepository;


import net.daisyquest.daisyquestgame.Model.Activity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ActivityRepository extends MongoRepository<Activity, String> {
}
