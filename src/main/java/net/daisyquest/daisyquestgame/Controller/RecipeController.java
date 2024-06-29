package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.Recipe;
import net.daisyquest.daisyquestgame.Service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    @Autowired
    private RecipeService recipeService;

    @GetMapping("/discovered")
    public ResponseEntity<List<Recipe>> getDiscoveredRecipes() {
        List<Recipe> discoveredRecipes = recipeService.getDiscoveredRecipes();
        return ResponseEntity.ok(discoveredRecipes);
    }

    // ... other endpoints ...
}