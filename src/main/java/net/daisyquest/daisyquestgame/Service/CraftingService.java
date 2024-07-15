package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Service.Failure.AttributeRequirementNotMetException;
import net.daisyquest.daisyquestgame.Service.Failure.InsufficientItemsException;
import net.daisyquest.daisyquestgame.Service.Failure.RecipeNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class CraftingService {
    private static final Logger logger = LoggerFactory.getLogger(CraftingService.class);

    @Autowired
    private PlayerService playerService;

    @Autowired
    private ItemService itemService;

    @Autowired
    private RecipeService recipeService;

    /**
     * Crafts an item for a player based on the provided recipe ingredients.
     *
     * @param playerId The ID of the player crafting the item
     * @param itemIdsAndAmounts A map of item IDs and their quantities to be used in crafting
     * @return The name of the successfully crafted item
     * @throws PlayerNotFoundException if the player is not found
     * @throws RecipeNotFoundException if no matching recipe is found
     * @throws InsufficientItemsException if the player doesn't have the required items
     * @throws AttributeRequirementNotMetException if the player doesn't meet the attribute requirements
     * @throws InventoryFullException if the player's inventory is full
     */
    @Transactional
    public String craftItem(String playerId, Map<String, Integer> itemIdsAndAmounts) {
        Player player = playerService.getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }

        Recipe matchingRecipe = findMatchingRecipe(itemIdsAndAmounts);
        if (matchingRecipe == null) {
            throw new RecipeNotFoundException("No matching recipe found for the provided ingredients");
        }

        if (matchingRecipe.getDiscoveredBy() == null) {
            matchingRecipe.setDiscoveredBy(player.getUsername());
            matchingRecipe.setDiscoveryDateTime(Instant.now().toEpochMilli());
            recipeService.updateRecipe(matchingRecipe);
        }

        PlayerInventory inventory = player.getInventory();
        if (!playerHasRequiredItems(inventory, itemIdsAndAmounts)) {
            throw new InsufficientItemsException("Player does not have the required items for crafting");
        }

        if (!playerMeetsAttributeRequirements(player, matchingRecipe.getAttributeRequirements())) {
            throw new AttributeRequirementNotMetException("Player does not meet the attribute requirements for crafting");
        }

        removeItemsFromInventory(inventory, itemIdsAndAmounts);

        Item resultItem = itemService.getItem(matchingRecipe.getResultItemId());
        if (resultItem == null) {
            throw new ItemNotFoundException("Result item not found with id: " + matchingRecipe.getResultItemId());
        }

        try {
            inventory.addItem(resultItem, 1);
        } catch (InventoryFullException e) {
            // Rollback the removed items
            for (Map.Entry<String, Integer> entry : itemIdsAndAmounts.entrySet()) {
                Item item = itemService.getItem(entry.getKey());
                inventory.addItem(item, entry.getValue());
            }
            throw new InventoryFullException("Crafting failed. Player's inventory is full.");
        }

        for (String a : matchingRecipe.getAttributeExperienceRewardAmounts().keySet()) {
            // Convert attribute key to lowercase
            String attributeKey = a.toLowerCase();

            // Get the reward amount for this attribute
            Integer rewardAmount = matchingRecipe.getAttributeExperienceRewardAmounts().get(a);

            // Check if the player already has this attribute
            if (player.getAttributes().containsKey(attributeKey)) {
                // If the attribute exists, add the reward amount to the existing amount
                Attribute currentAttribute = player.getAttributes().get(attributeKey);
                currentAttribute.setExperience(currentAttribute.getExperience() + rewardAmount);
            } else {
                // If the attribute does not exist, create a new one and add it to the map
                Attribute newAttribute = new Attribute();
                newAttribute.setExperience(rewardAmount);
                player.getAttributes().put(attributeKey, newAttribute);
            }
        }


        playerService.updatePlayer(player);
        logger.info("Player {} successfully crafted: {}", playerId, resultItem.getName());
        return "Successfully crafted: " + resultItem.getName();
    }

    private Recipe findMatchingRecipe(Map<String, Integer> itemIdsAndAmounts) {
        List<Recipe> allRecipes = recipeService.getAllRecipes();
        return allRecipes.stream()
                .filter(recipe -> recipe.getRequiredItemIdsAndAmounts().equals(itemIdsAndAmounts))
                .findFirst()
                .orElse(null);
    }

    private boolean playerHasRequiredItems(PlayerInventory inventory, Map<String, Integer> itemIdsAndAmounts) {
        for (Map.Entry<String, Integer> entry : itemIdsAndAmounts.entrySet()) {
            if (!inventory.hasItem(entry.getKey(), entry.getValue())) {
                return false;
            }
        }
        return true;
    }

    private boolean playerMeetsAttributeRequirements(Player player, Map<String, Integer> attributeRequirements) {
        for (Map.Entry<String, Integer> entry : attributeRequirements.entrySet()) {
            String attributeName = entry.getKey().toLowerCase();
            Integer requiredLevel = entry.getValue();
            Attribute playerAttribute = player.getAttributes().get(attributeName);

            if (playerAttribute == null || playerAttribute.getLevel() < requiredLevel) {
                return false;
            }
        }
        return true;
    }

    private void removeItemsFromInventory(PlayerInventory inventory, Map<String, Integer> itemIdsAndAmounts) {
        for (Map.Entry<String, Integer> entry : itemIdsAndAmounts.entrySet()) {
            String itemId = entry.getKey();
            int amountToRemove = entry.getValue();
            inventory.removeItem(itemId, amountToRemove);
        }
    }
}