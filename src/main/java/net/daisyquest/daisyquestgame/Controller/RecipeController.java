package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.AttributeTemplate;
import net.daisyquest.daisyquestgame.Model.Recipe;
import net.daisyquest.daisyquestgame.Repository.AttributeTemplateRepository;
import net.daisyquest.daisyquestgame.Service.ItemService;
import net.daisyquest.daisyquestgame.Service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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
    @Autowired
    private ItemService itemService;

    @Autowired
    private AttributeTemplateRepository attributeTemplateRepository;
    @PostMapping
    public ResponseEntity<?> create( @RequestBody RecipeDTO recipeDTO, BindingResult bindingResult) {
        Map<String, Object> response = new HashMap<>();

        // Validate input


        try {
            // Validate result item exists
            if (!itemService.existsById(recipeDTO.getResultItemId())) {
                response.put("error", "Result item not found");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            // Validate required items exist
            for (String itemId : recipeDTO.getRequiredItemIdsAndAmounts().keySet()) {
                if (!itemService.existsById(itemId)) {
                    response.put("error", "Required item not found: " + itemId);
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
            }

            // Validate attributes exist
            Set<String> validAttributes = attributeTemplateRepository.findAll().stream().map(AttributeTemplate::getName).collect(Collectors.toSet());
            for (String attr : recipeDTO.getAttributeRequirements().keySet()) {
                if (!validAttributes.contains(attr)) {
                    response.put("error", "Invalid attribute: " + attr);
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
            }
            for (String attr : recipeDTO.getAttributeExperienceRewardAmounts().keySet()) {
                if (!validAttributes.contains(attr)) {
                    response.put("error", "Invalid attribute for experience reward: " + attr);
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
            }
            Recipe recipe = new Recipe();
            recipe.setName(recipeDTO.getName());
            recipe.setAttributeRequirements(recipeDTO.getAttributeRequirements());
            recipe.setDiscoveredBy(recipeDTO.getDiscoveredBy());
            recipe.setRequiredItemIdsAndAmounts(recipeDTO.getRequiredItemIdsAndAmounts());
            recipe.setAttributeExperienceRewardAmounts(recipeDTO.getAttributeExperienceRewardAmounts());
            recipe.setResultItemId(recipeDTO.getResultItemId());
            // Create recipe
            Recipe createdRecipe = recipeService.createRecipe(recipe);

            response.put("message", "Recipe created successfully");
            response.put("recipe", createdRecipe);
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (Exception e) {
            response.put("error", "An error occurred while creating the recipe: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // ... other endpoints ...
}