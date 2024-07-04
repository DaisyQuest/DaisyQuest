package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Model.Currency;
import net.daisyquest.daisyquestgame.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.time.LocalDate;
import java.util.*;
/**
 * The RewardService class manages all reward-related operations in the DaisyQuest game.
 * This service handles chest opening, reward claiming, daily rewards, and reward application to players.
 * <p>
 * Key functionalities include:
 * <ul>
 *     <li>Opening chests and generating rewards</li>
 *     <li>Claiming rewards and applying them to players</li>
 *     <li>Managing daily rewards</li>
 *     <li>Retrieving unclaimed rewards for players</li>
 * </ul>
 * <p>
 * The reward system is built around the concept of RewardContainers, which encapsulate
 * a set of Rewards. These containers can be generated from various sources (e.g., chests,
 * daily rewards) and are stored for players to claim later.
 * <p>
 * Rewards can be of different types (CURRENCY, RESOURCE, ITEM, ATTRIBUTE_EXPERIENCE),
 * and each type is handled differently when applied to a player.
 * <p>
 * The service interacts with several repositories to manage game entities:
 * <ul>
 *     <li>PlayerRepository: For player data management</li>
 *     <li>RewardContainerRepository: For storing and retrieving reward containers</li>
 *     <li>ChestRepository: For chest data management</li>
 *     <li>ItemRepository: For item data management</li>
 *     <li>CurrencyRepository: For currency data management</li>
 * </ul>
 * <p>
 * It also utilizes a RewardGeneratorService for creating rewards based on specific criteria.
 *
 * @author DaisyQuest Development Team
 * @version 1.0
 * @since 2023-06-30
 */

@Service
public class RewardService {
    @Autowired
    private PlayerRepository playerRepository;

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

    @Transactional
    public List<Reward> openChest(String playerId, String chestId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        Chest chest = chestRepository.findById(chestId)
                .orElseThrow(() -> new RuntimeException("Chest not found"));

        // Check if the player owns the chest
        if (player.getInventory().stream().noneMatch(o-> o.getId().equals(chest.getItemId()))) {
            throw new IllegalArgumentException("Player does not own this chest");
        }

        // Generate rewards based on chest type
        List<Reward> rewards = rewardGeneratorService.generateRewardsForChest(chest);

        // Create a new RewardContainer
        RewardContainer container = new RewardContainer();
        container.setPlayerId(playerId);
        container.setRewards(rewards);
        container.setMultipliers(new HashMap<>());
        rewardContainerRepository.save(container);

        // Remove the chest from the player's inventory


        Item chestToDelete = player.getInventory().stream().filter(o-> o.getId().equals(chest.getItemId())).findFirst().orElseThrow();
        player.getInventory().remove(chestToDelete);

        playerRepository.save(player);

        // Delete the chest item
        itemRepository.deleteById(chestId);

        return rewards;
    }


    //todo delete me:
    @Transactional
    public List<Reward> openChestTest(String playerId, String chestId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        Chest chest = chestRepository.findById(chestId)
                .orElse(new Chest());

        // Check if the player owns the chest
        if (player.getInventory().stream().noneMatch(o-> o.getId().equals(chest.getItemId()))) {
            throw new IllegalArgumentException("Player does not own this chest");
        }

        // Generate rewards based on chest type
        List<Reward> rewards = rewardGeneratorService.generateRewardsForChest(chest);

        // Create a new RewardContainer
        RewardContainer container = new RewardContainer();
        container.setPlayerId(playerId);
        container.setRewards(rewards);
        container.setMultipliers(new HashMap<>());
        rewardContainerRepository.save(container);

        // Remove the chest from the player's inventory


        Item chestToDelete = player.getInventory().stream().filter(o-> o.getId().equals(chest.getItemId())).findFirst().orElseThrow();
        player.getInventory().remove(chestToDelete);

        playerRepository.save(player);

        // Delete the chest item
        itemRepository.deleteById(chestId);

        return rewards;
    }

    //todo: delete above
    //TESTING


    public void claimReward(String playerId, String rewardContainerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));
        RewardContainer container = rewardContainerRepository.findById(rewardContainerId)
                .orElseThrow(() -> new RuntimeException("Reward container not found"));

        if (!container.getPlayerId().equals(playerId)) {
            throw new IllegalArgumentException("This reward does not belong to the player");
        }
        for (Reward reward : container.getRewards()) {
            applyRewardToPlayer(player, reward);
        }
        List<Reward> calculatedRewards = calculateRewards(player);
        for (Reward reward : calculatedRewards) {
            //
        }

        rewardContainerRepository.delete(container);
        playerRepository.save(player);
    }

    private List<Reward> calculateRewards(Player player) {
        return new ArrayList<>();
    }

    public boolean canClaimDailyReward(Player player) {
        LocalDate today = LocalDate.now();
        return player.getLastDailyRewardClaim() == null || player.getLastDailyRewardClaim().isBefore(today);
    }

    public void claimDailyReward(String playerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (canClaimDailyReward(player)) {
            RewardContainer dailyReward = createDailyReward(player);
            rewardContainerRepository.save(dailyReward);
            player.setLastDailyRewardClaim(LocalDate.now());
            playerRepository.save(player);
        } else {
            throw new IllegalStateException("Daily reward already claimed today");
        }
    }

    public RewardContainer createDailyReward(Player player) {
        // Logic to create daily reward
        RewardContainer container = new RewardContainer();
        container.setPlayerId(player.getId());
        // Set rewards based on your game's daily reward system
        return container;
    }

    private void applyRewardToPlayer(Player player, Reward reward) {
        switch (reward.getType()) {
            case CURRENCY:
                //player.addCurrency(reward.getRewardId(), reward.getQuantity());
                Optional<Currency> c = currencyRepository.findById(reward.getRewardId());
                c.ifPresent(currency -> player.getCurrencies().put(currency.getId(), reward.getQuantity()));
                break;
            case RESOURCE:
                player.setResources(player.getResources() + reward.getQuantity());
                break;
            case ITEM:
                if (itemRepository.findById(reward.getRewardId()).isPresent()) {
                    for (int i = 0; i < reward.getQuantity(); i++) {
                        player.getInventory().add(itemRepository.findById(reward.getRewardId()).get());
                    }
                }
                break;
            case ATTRIBUTE_EXPERIENCE:
                Attribute a = player.getAttributes().get(reward.getRewardId());
                if(a != null){
                    a.setExperience(a.getExperience() + reward.getQuantity());
                }
                break;
        }
    }
    public List<RewardContainer> getUnclaimedRewards(String playerId) {
        return rewardContainerRepository.findByPlayerId(playerId);
    }




    /**
     * Generates a random reward and applies it to the specified player.
     * This method is for testing purposes only.
     *
     * @param playerId The ID of the player to receive the random reward
     * @return The generated and applied Reward
     * @throws RuntimeException if the player is not found
     */
    public Reward generateAndApplyRandomReward(String playerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        Reward randomReward = generateRandomReward();
        applyRewardToPlayer(player, randomReward);
        playerRepository.save(player);

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



    /**
     * Opens a random chest for the specified player.
     * If the player doesn't have any chests, it creates a random one.
     *
     * @param playerId The ID of the player opening the chest
     * @return A List of Reward objects generated from the chest
     * @throws RuntimeException if the player is not found
     */
    @Transactional
    public List<Reward> openRandomChest(String playerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        // Find a chest in the player's inventory or create a random one
        Item chestItem = player.getInventory().stream()
                .filter(Item::isChest)
                .findAny()
                .orElseGet(() -> itemRepository.findAll().stream().findAny().get());
        Chest c = new Chest();
        c.setItemId(chestItem.getId());
        c.setName("Test Chest");
        c.setDescription("Testing This!!");
        chestRepository.save(c);
        // If we created a new chest, we need to save the player to persist it
        if (!player.getInventory().contains(chestItem)) {
            player.getInventory().add(chestItem);
            playerRepository.save(player);
        }

        // Now open the chest
        return openChest(playerId, chestItem.getId());
    }

    private Chest createRandomChest(Player player) {
        Chest chest = new Chest();
        chest.setItemId(UUID.randomUUID().toString());
        chest.setName("Random Test Chest");
        chest.setDescription("A chest created for testing purposes");
        // You might want to set other properties of the chest here

        return chestRepository.save(chest);
    }
}
