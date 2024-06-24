package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.Activity;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private PlayerService playerService;

    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

    public Activity startActivity(String activityId, String playerId) {
        Activity activity = activityRepository.findById(activityId).orElse(null);
        Player player = playerService.getPlayer(playerId);

        if (activity != null && player != null) {
            // Check if player meets requirements
            // For simplicity, we're just returning the activity here
            return activity;
        }
        return null;
    }

    public Activity completeActivity(String activityId, String playerId) {
        Activity activity = activityRepository.findById(activityId).orElse(null);
        Player player = playerService.getPlayer(playerId);

        if (activity != null && player != null) {
            // Update player's experience and attributes
            player.setTotalExperience(player.getTotalExperience() + activity.getExperienceReward());

            activity.getAttributeRewards().forEach((attribute, value) -> {
                if (player.getAttributes().containsKey(attribute)) {
                    int currentExp = player.getAttributes().get(attribute).getExperience();
                    player.getAttributes().get(attribute).setExperience(currentExp + value);
                }
            });

            // For simplicity, we're not handling item rewards here

            playerService.updatePlayer(player);
            return activity;
        }
        return null;
    }
}