package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.Recipe;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RecipeRepository extends MongoRepository<Recipe, String> {
    Recipe findByName(String name);
}