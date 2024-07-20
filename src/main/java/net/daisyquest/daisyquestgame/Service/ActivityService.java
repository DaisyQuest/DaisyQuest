package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.Activity;
import net.daisyquest.daisyquestgame.Model.ActivityCompletionResult;
import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Repository.ActivityRepository;
import net.daisyquest.daisyquestgame.Repository.PlayerInventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ActivityService {
    @Autowired
    private ActivityRepository activityRepository;
    @Autowired
    private PlayerService playerService;
    @Autowired
    private ItemService itemService;
    @Autowired
    private PlayerInventoryRepository playerInventoryRepository;

    public Activity createActivity(Activity activity) {
        return activityRepository.save(activity);
    }

    public Activity getActivity(String id) {
        return activityRepository.findById(id).orElse(null);
    }

    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

    public Activity updateActivity(Activity activity) {
        return activityRepository.save(activity);
    }

    public void deleteActivity(String id) {
        activityRepository.deleteById(id);
    }

    public Activity startActivity(String activityId, String playerId) {
        Activity activity = activityRepository.findById(activityId).orElse(null);
        Player player = playerService.getPlayer(playerId);

        if (activity != null && player != null) {
            // Here you might want to check if the player meets the requirements to start the activity
            // For simplicity, we're just returning the activity
            return activity;
        }
        return null;
    }
    @Transactional
    public ActivityCompletionResult completeActivity(String activityId, String playerId) {
        Activity activity = activityRepository.findById(activityId).orElse(null);
        Player player = playerService.getPlayer(playerId);

        if (activity != null && player != null) {
            ActivityCompletionResult result = new ActivityCompletionResult();

            // Calculate experience gain
            int experienceGained = activity.getExperienceReward();
            result.setExperienceGained(experienceGained);
            player.setTotalExperience(player.getTotalExperience() + experienceGained);

            // Calculate attribute increases
            Map<String, Integer> attributeIncreases = new HashMap<>();
            for (Map.Entry<String, Integer> entry : activity.getAttributeRewards().entrySet()) {
                String attribute = entry.getKey();
                int increase = entry.getValue();

                playerService.addAttributeExperience(player, player.getAttributes().get(attribute).getName(), increase);
                attributeIncreases.put(attribute, increase);
            }
            result.setAttributeIncreases(attributeIncreases);

            // Add item rewards
            List<ActivityCompletionResult.Reward> rewards = new ArrayList<>();
            if (activity.getItemRewards() != null) {
                for (Map.Entry<String, Integer> entry : activity.getItemRewards().entrySet()) {
                    String itemName = entry.getKey();
                    int quantity = entry.getValue();

                    Item item = itemService.getItemByName(itemName.replaceAll("\"", ""));
                    if (item != null) {
                        playerService.addItemToInventory(player.getId(), item.getId(), quantity);

                        ActivityCompletionResult.Reward reward = new ActivityCompletionResult.Reward();
                        reward.setName(itemName);
                        reward.setAmount(quantity);
                        rewards.add(reward);
                    }
                }
            }
            result.setRewards(rewards);
            player.setInventory(playerInventoryRepository.findByPlayerId(playerId));

            // Save the updated player
            playerService.updatePlayer(player);

            return result;
        }
        return null;
    }
}