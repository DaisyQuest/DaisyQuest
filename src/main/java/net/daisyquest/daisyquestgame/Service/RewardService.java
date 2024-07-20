package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Model.Currency;
import net.daisyquest.daisyquestgame.Repository.*;
import net.daisyquest.daisyquestgame.Service.Failure.InvalidCurrencyException;
import net.daisyquest.daisyquestgame.Service.Failure.RewardNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

/**
 * The RewardService manages all reward-related operations in the DaisyQuest game.
 */
@Service
public class RewardService {
    private static final Logger logger = LoggerFactory.getLogger(RewardService.class);

    @Autowired
    private PlayerService playerService;

    @Autowired
    private RewardContainerRepository rewardContainerRepository;

    @Autowired
    private ChestRepository chestRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private RewardGeneratorService rewardGeneratorService;

    @Autowired
    private CurrencyRepository currencyRepository;

    /**
     * Opens a chest for a player and generates rewards.
     *
     * @param playerId The ID of the player opening the chest
     * @param chestId  The ID of the chest to open
     * @return A list of generated rewards
     * @throws PlayerNotFoundException if the player is not found
     * @throws ItemNotFoundException if the chest is not found
     * @throws IllegalArgumentException if the player doesn't own the chest
     */
    @Transactional
    public List<Reward> openChest(String playerId, String chestId) {
        Player player = playerService.getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }

        Item chestItem = itemRepository.findById(chestId)
                .orElseThrow(() -> new ItemNotFoundException("Chest not found with id: " + chestId));

        if (!chestItem.isChest()) {
            throw new IllegalArgumentException("Item is not a chest: " + chestId);
        }

        PlayerInventory inventory = player.getInventory();
        if (!inventory.hasItem(chestItem.getId())){
            throw new IllegalArgumentException("Player does not own this chest");
        }

        Chest chest = chestRepository.findById(chestId)
                .orElseThrow(() -> new ItemNotFoundException("Chest data not found for item: " + chestId));

        List<Reward> rewards = rewardGeneratorService.generateRewardsForChest(chest);

        RewardContainer container = new RewardContainer();
        container.setPlayerId(playerId);
        container.setRewards(rewards);
        container.setMultipliers(new HashMap<>());
        rewardContainerRepository.save(container);

        inventory.removeItem(chestId, 1);
        playerService.updatePlayer(player);

        logger.info("Player {} opened chest {}. Generated {} rewards.", playerId, chestId, rewards.size());
        return rewards;
    }

    /**
     * Claims a reward for a player.
     *
     * @param playerId           The ID of the player claiming the reward
     * @param rewardContainerId  The ID of the reward container to claim
     * @throws PlayerNotFoundException if the player is not found
     * @throws RewardNotFoundException if the reward container is not found
     * @throws IllegalArgumentException if the reward doesn't belong to the player
     */
    @Transactional
    public void claimReward(String playerId, String rewardContainerId) {
        Player player = playerService.getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }

        RewardContainer container = rewardContainerRepository.findById(rewardContainerId)
                .orElseThrow(() -> new RewardNotFoundException("Reward container not found with id: " + rewardContainerId));

        if (!container.getPlayerId().equals(playerId)) {
            throw new IllegalArgumentException("This reward does not belong to the player");
        }

        for (Reward reward : container.getRewards()) {
            applyRewardToPlayer(player, reward);
        }

        rewardContainerRepository.delete(container);
        playerService.updatePlayer(player);
        logger.info("Player {} claimed reward container {}.", playerId, rewardContainerId);
    }

    /**
     * Checks if a player can claim their daily reward.
     *
     * @param playerId The ID of the player
     * @return true if the player can claim their daily reward, false otherwise
     * @throws PlayerNotFoundException if the player is not found
     */
    public boolean canClaimDailyReward(String playerId) {
        Player player = playerService.getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }

        LocalDate lastClaimDate = player.getLastDailyRewardClaim();
        LocalDate today = LocalDate.now();

        return lastClaimDate == null || !lastClaimDate.equals(today);
    }

    /**
     * Claims the daily reward for a player.
     *
     * @param playerId The ID of the player claiming the daily reward
     * @throws PlayerNotFoundException if the player is not found
     * @throws IllegalStateException if the player has already claimed their daily reward
     */
    @Transactional
    public void claimDailyReward(String playerId) {
        Player player = playerService.getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }

        if (canClaimDailyReward(playerId)) {
            RewardContainer dailyReward = createDailyReward(player);
            rewardContainerRepository.save(dailyReward);
            player.setLastDailyRewardClaim(LocalDate.now());
            playerService.updatePlayer(player);
            logger.info("Player {} claimed daily reward.", playerId);
        } else {
            throw new IllegalStateException("Daily reward already claimed today");
        }
    }

    /**
     * Creates a daily reward for a player.
     *
     * @param player The player to create the daily reward for
     * @return A RewardContainer with the daily rewards
     */
    public RewardContainer createDailyReward(Player player) {
        RewardContainer container = new RewardContainer();
        container.setPlayerId(player.getId());
        container.setRewards(rewardGeneratorService.generateDailyRewards());
        return container;
    }

    /**
     * Applies a reward to a player.
     *
     * @param player The player to apply the reward to
     * @param reward The reward to apply
     */
    private void applyRewardToPlayer(Player player, Reward reward) {
        PlayerInventory inventory = player.getInventory();
        switch (reward.getType()) {
            case CURRENCY:
                Currency currency = currencyRepository.findById(reward.getRewardId())
                        .orElseThrow(() -> new InvalidCurrencyException("Currency not found with id: " + reward.getRewardId()));
                player.getInventory().getCurrencies().merge(currency.getId(), reward.getQuantity(), Integer::sum);
                break;
            case RESOURCE:
                player.setResources(player.getResources() + reward.getQuantity());
                break;
            case ITEM:
                Item item = itemRepository.findById(reward.getRewardId())
                        .orElseThrow(() -> new ItemNotFoundException("Item not found with id: " + reward.getRewardId()));
                try {
                    inventory.addItem(item, reward.getQuantity());
                } catch (InventoryFullException e) {
                    logger.warn("Player {}'s inventory is full. Could not add all of item {}.", player.getId(), item.getId());
                }
                break;
            case ATTRIBUTE_EXPERIENCE:
                Attribute attribute = player.getAttributes().get(reward.getRewardId());
                if (attribute != null) {
                    attribute.setExperience(attribute.getExperience() + reward.getQuantity());
                } else {
                    logger.warn("Attribute {} not found for player {}.", reward.getRewardId(), player.getId());
                }
                break;
        }
    }

    /**
     * Gets all unclaimed rewards for a player.
     *
     * @param playerId The ID of the player
     * @return A list of unclaimed RewardContainers
     */
    public List<RewardContainer> getUnclaimedRewards(String playerId) {
        return rewardContainerRepository.findByPlayerId(playerId);
    }

    // Test methods (should be removed or moved to a separate test service in production)

    @Transactional
    public Reward generateAndApplyRandomReward(String playerId) {
        Player player = playerService.getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }

        Reward randomReward = generateRandomReward();
        applyRewardToPlayer(player, randomReward);
        playerService.updatePlayer(player);

        logger.info("Generated and applied random reward for player {}.", playerId);
        return randomReward;
    }

    private Reward generateRandomReward() {
        RewardType[] types = RewardType.values();
        RewardType randomType = types[new Random().nextInt(types.length)];

        String rewardId;
        int quantity;

        switch (randomType) {
            case CURRENCY:
                List<Currency> currencies = currencyRepository.findAll();
                rewardId = currencies.get(new Random().nextInt(currencies.size())).getId();
                quantity = new Random().nextInt(100) + 1;
                break;
            case RESOURCE:
                rewardId = "generic_resource";
                quantity = new Random().nextInt(50) + 1;
                break;
            case ITEM:
                List<Item> items = itemRepository.findAll();
                rewardId = items.get(new Random().nextInt(items.size())).getId();
                quantity = new Random().nextInt(3) + 1;
                break;
            case ATTRIBUTE_EXPERIENCE:
                rewardId = "combat";
                quantity = new Random().nextInt(1000) + 100;
                break;
            default:
                throw new IllegalStateException("Unexpected reward type");
        }

        return new Reward(randomType, rewardId, quantity);
    }


    @Transactional
    public List<Reward> openRandomChest(String playerId) {
        Player player = playerService.getPlayer(playerId);
        if (player == null) {
            throw new PlayerNotFoundException("Player not found with id: " + playerId);
        }

        PlayerInventory inventory = player.getInventory();
        Item chestItem = inventory.getInventorySlots().stream()
                .filter(slot -> slot.hasItem() && slot.getItem().isChest())
                .map(InventorySlot::getItem)
                .findAny()
                .orElseGet(this::createRandomChest);

        if (!inventory.hasItem(chestItem.getId())) {
            try {
                inventory.addItem(chestItem, 1);
            } catch (InventoryFullException e) {
                throw new IllegalStateException("Cannot add random chest to inventory. Inventory is full.");
            }
            playerService.updatePlayer(player);
        }

        logger.info("Player {} opened a random chest.", playerId);
        return openChest(playerId, chestItem.getId());
    }

    private Item createRandomChest() {
        Item chestItem = new Item();
        chestItem.setId(UUID.randomUUID().toString());
        chestItem.setName("Random Test Chest");
        chestItem.setDescription("A chest created for testing purposes");
        chestItem.setChest(true);
        itemRepository.save(chestItem);

        Chest chest = new Chest();
        chest.setItemId(chestItem.getId());
        chest.setName("Random Test Chest");
        chest.setDescription("A chest created for testing purposes");
        chestRepository.save(chest);

        return chestItem;
    }
}