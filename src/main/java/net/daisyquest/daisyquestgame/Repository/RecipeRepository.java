package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.Recipe;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RecipeRepository extends MongoRepository<Recipe, String> {
    Recipe findByName(String name);
    List<Recipe> findByDiscoveredByIsNotNull();

}