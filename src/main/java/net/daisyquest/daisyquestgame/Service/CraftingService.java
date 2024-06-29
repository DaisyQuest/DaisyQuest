package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.Recipe;
import net.daisyquest.daisyquestgame.Service.ItemService;
import net.daisyquest.daisyquestgame.Service.PlayerService;
import net.daisyquest.daisyquestgame.Service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// CraftingService.java
@Service
public class CraftingService {
    @Autowired
    private PlayerService playerService;

    @Autowired
    private ItemService itemService;

    @Autowired
    private RecipeService recipeService;

    public String craftItem(String playerId, Map<String, Integer> itemIdsAndAmounts) {
        Player player = playerService.getPlayer(playerId);
        if (player == null) {
            return "Player not found.";
        }

        Recipe matchingRecipe = findMatchingRecipe(itemIdsAndAmounts, player);
        if (matchingRecipe == null) {
            return "No matching recipe found.";
        }
        if (matchingRecipe.getDiscoveredBy() == null) {
            matchingRecipe.setDiscoveredBy(player.getUsername());
            matchingRecipe.setDiscoveryDateTime(Instant.now().toEpochMilli());
            recipeService.updateRecipe(matchingRecipe);
        }
        if (!playerHasRequiredItems(player, itemIdsAndAmounts)) {
            return "Player does not have the required items.";
        }

        if (!playerMeetsAttributeRequirements(player, matchingRecipe.getAttributeRequirements())) {
            return "Player does not meet the attribute requirements.";
        }

        removeItemsFromInventory(player, itemIdsAndAmounts);

        Item resultItem = itemService.getItem(matchingRecipe.getResultItemId());
        if (resultItem == null) {
            return "Crafting failed. Result item not found.";
        }

        player.getInventory().add(resultItem);
        playerService.updatePlayer(player);

        return "Successfully crafted: " + resultItem.getName();
    }

    private Recipe findMatchingRecipe(Map<String, Integer> itemIdsAndAmounts, Player player) {
        List<Recipe> allRecipes = recipeService.getAllRecipes();

        return allRecipes.stream()
                .filter(recipe -> recipe.getRequiredItemIdsAndAmounts().equals(itemIdsAndAmounts))
                .findFirst()
                .orElse(null);
    }

    private boolean playerHasRequiredItems(Player player, Map<String, Integer> itemIdsAndAmounts) {
        Map<String, Long> playerItemCounts = player.getInventory().stream()
                .collect(Collectors.groupingBy(Item::getId, Collectors.counting()));

        for (Map.Entry<String, Integer> entry : itemIdsAndAmounts.entrySet()) {
            String itemId = entry.getKey();
            int requiredAmount = entry.getValue();
            long playerAmount = playerItemCounts.getOrDefault(itemId, 0L);

            if (playerAmount < requiredAmount) {
                return false;
            }
        }

        return true;
    }

    private boolean playerMeetsAttributeRequirements(Player player, Map<String, Integer> attributeRequirements) {
        for (Map.Entry<String, Integer> entry : attributeRequirements.entrySet()) {
            String attributeName = entry.getKey();
            Integer requiredLevel = entry.getValue();

            if (player.getAttributes().get(attributeName).getLevel() < requiredLevel) {
                return false;
            }
        }

        return true;
    }

    private void removeItemsFromInventory(Player player, Map<String, Integer> itemIdsAndAmounts) {
        for (Map.Entry<String, Integer> entry : itemIdsAndAmounts.entrySet()) {
            String itemId = entry.getKey();
            final int[] amountToRemove = {entry.getValue()};

            player.getInventory().removeIf(item -> {
                if (item.getId().equals(itemId) && amountToRemove[0] > 0) {
                    amountToRemove[0]--;
                    return true;
                }
                return false;
            });
        }
    }
}
