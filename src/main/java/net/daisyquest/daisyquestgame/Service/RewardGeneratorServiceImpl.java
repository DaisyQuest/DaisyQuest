package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.Chest;
import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Model.Reward;
import net.daisyquest.daisyquestgame.Model.RewardType;
import net.daisyquest.daisyquestgame.Repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class RewardGeneratorServiceImpl implements RewardGeneratorService {

    private static final int HITPOINTS_EXPERIENCE = 1000;
    private static final int MIN_ITEM_QUANTITY = 1;
    private static final int MAX_ITEM_QUANTITY = 5;

    @Autowired
    private ItemRepository itemRepository;

    private final Random random = new Random();

    @Override
    public List<Reward> generateRewardsForChest(Chest chest) {
        List<Reward> rewards = new ArrayList<>();

        // Add hitpoints experience reward
        rewards.add(new Reward(RewardType.ATTRIBUTE_EXPERIENCE, "hitpoints", HITPOINTS_EXPERIENCE));

        // Add item rewards
        List<Item> allItems = itemRepository.findAll();
        int numberOfItemRewards = random.nextInt(3) + 1; // 1 to 3 item rewards

        for (int i = 0; i < numberOfItemRewards; i++) {
            Item randomItem = allItems.get(random.nextInt(allItems.size()));
            int quantity = random.nextInt(MAX_ITEM_QUANTITY - MIN_ITEM_QUANTITY + 1) + MIN_ITEM_QUANTITY;
            rewards.add(new Reward(RewardType.ITEM, randomItem.getId(), quantity));
        }

        // You can add chest-specific logic here if needed
        // For example, if the chest has a rarity or type, you can adjust rewards accordingly

        return rewards;
    }

    @Override
    public List<Reward> generateDailyRewards() {
        List<Item> allItems = itemRepository.findAll();
        int numberOfItemRewards = random.nextInt(3) + 1; // 1 to 3 item rewards
        Item randomItem = allItems.get(random.nextInt(allItems.size()));

       return List.of(new Reward(RewardType.ITEM, randomItem.getId(), 1));
    }
}