package net.daisyquest.daisyquestgame.Service;


import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.Quest;
import net.daisyquest.daisyquestgame.Model.QuestCompletionResult;
import net.daisyquest.daisyquestgame.Repository.QuestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QuestService {
    @Autowired
    private QuestRepository questRepository;
    @Autowired
    private PlayerService playerService;
    @Autowired
    private ItemService itemService;
    public Quest createQuest(Quest quest) {
        return questRepository.save(quest);
    }

    public Quest getQuest(String id) {
        return questRepository.findById(id).orElse(null);
    }

    public List<Quest> getAllQuests() {
        return questRepository.findAll();
    }

    public Quest updateQuest(Quest quest) {
        return questRepository.save(quest);
    }

    public void deleteQuest(String id) {
        questRepository.deleteById(id);
    }

    public Quest startQuest(String questId, String playerId) {
        Quest quest = questRepository.findById(questId).orElse(null);
        Player player = playerService.getPlayer(playerId);

        if (quest != null && player != null) {
            // Here you might want to check if the player meets the requirements to start the quest
            // For simplicity, we're just returning the quest
            return quest;
        }
        return null;
    }

    public QuestCompletionResult completeQuest(String questId, String playerId) {
        Quest quest = questRepository.findById(questId).orElse(null);
        Player player = playerService.getPlayer(playerId);

        if (quest != null && player != null) {
            QuestCompletionResult result = new QuestCompletionResult();

            // Calculate experience gain
            int experienceGained = quest.getExperienceReward();
            result.setExperienceGained(experienceGained);
            player.setTotalExperience(player.getTotalExperience() + experienceGained);

            // Calculate attribute increases
            Map<String, Integer> attributeIncreases = new HashMap<>();
            for (Map.Entry<String, Integer> entry : quest.getAttributeRewards().entrySet()) {
                String attribute = entry.getKey();
                int increase = entry.getValue();
                player.getAttributes().get(attribute).setExperience(
                        player.getAttributes().get(attribute).getExperience() + increase
                );
                attributeIncreases.put(attribute, increase);
            }
            result.setAttributeIncreases(attributeIncreases);

            // Add item rewards
            List<QuestCompletionResult.Reward> rewards = new ArrayList<>();
            if (quest.getItemRewards() != null) {
                for (Map.Entry<String, Integer> entry : quest.getItemRewards().entrySet()) {
                    String itemName = entry.getKey();
                    int quantity = entry.getValue();

                    Item item = itemService.getItemByName(itemName.replaceAll("\"", ""));
                    if (item != null) {
                        playerService.addItemToInventory(player, item, quantity);

                        QuestCompletionResult.Reward reward = new QuestCompletionResult.Reward();
                        reward.setName(itemName);
                        reward.setAmount(quantity);
                        rewards.add(reward);
                    }
                }
            }
            result.setRewards(rewards);

            // Save the updated player
            playerService.updatePlayer(player);

            return result;
        }
        return null;
    }
}