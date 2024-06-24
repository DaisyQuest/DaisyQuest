package net.daisyquest.daisyquestgame.Service;


import net.daisyquest.daisyquestgame.Activity.ActivityHandler;
import net.daisyquest.daisyquestgame.Model.Activity;
import net.daisyquest.daisyquestgame.Model.Attribute;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.Quest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class PlayerProgressionService {

    @Autowired
    private PlayerService playerService;

    @Autowired
    private QuestService questService;
    @Autowired
    private ApplicationContext context;
    private static final int BASE_XP_PER_LEVEL = 100;
    private static final double LEVEL_SCALING_FACTOR = 1.5;

    public void gainExperience(Player player, int amount) {
        player.setTotalExperience(player.getTotalExperience() + amount);
        checkLevelUp(player);
        playerService.updatePlayer(player);
    }

    private void checkLevelUp(Player player) {
        int currentLevel = player.getLevel();
        int xpForNextLevel = calculateXPForLevel(currentLevel + 1);

        while (player.getTotalExperience() >= xpForNextLevel) {
            player.setLevel(player.getLevel() + 1);
            // You could add more effects here, like increasing base stats
            xpForNextLevel = calculateXPForLevel(player.getLevel() + 1);
        }
    }

    private int calculateXPForLevel(int level) {
        return (int) (BASE_XP_PER_LEVEL * Math.pow(level, LEVEL_SCALING_FACTOR));
    }

    public void completeActivity(Player player, Activity activity) {
        // Get the appropriate ActivityHandler
        ActivityHandler handler = (ActivityHandler) context.getBean(activity.getHandlerClass());

        // Execute the activity using the handler
        handler.handleActivity(player, activity);

        // Check for level ups and update the player
        checkLevelUp(player);
        playerService.updatePlayer(player);
    }


    private void checkAttributeLevelUp(Attribute attribute) {
        while (attribute.getExperience() >= calculateXPForLevel(attribute.getLevel() + 1)) {
            attribute.setLevel(attribute.getLevel() + 1);
        }
    }

    public boolean completeQuest(Player player, String questId) {
        Quest quest = questService.getQuest(questId);
        if (quest == null || player.getCompletedQuests().contains(questId)) {
            return false;
        }

        // Check if player meets the quest requirements
        for (Map.Entry<String, Integer> requirement : quest.getRequirements().entrySet()) {
            Attribute playerAttribute = player.getAttributes().get(requirement.getKey());
            if (playerAttribute == null || playerAttribute.getLevel() < requirement.getValue()) {
                return false;
            }
        }

        // Apply quest rewards
        gainExperience(player, quest.getExperienceReward());
        for (Map.Entry<String, Integer> reward : quest.getRewards().entrySet()) {
            Attribute playerAttribute = player.getAttributes().get(reward.getKey());
            if (playerAttribute != null) {
                playerAttribute.setExperience(playerAttribute.getExperience() + reward.getValue());
                checkAttributeLevelUp(playerAttribute);
            }
        }

        player.getCompletedQuests().add(questId);
        playerService.updatePlayer(player);
        return true;
    }

    public void awardAchievement(Player player, String achievementId) {
        if (!player.getAchievements().contains(achievementId)) {
            player.getAchievements().add(achievementId);
            // You could add more effects here, like giving rewards for achievements
            playerService.updatePlayer(player);
        }
    }
}