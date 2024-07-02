package net.daisyquest.daisyquestgame.Service.Job;

import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.RewardContainer;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Repository.RewardContainerRepository;
import net.daisyquest.daisyquestgame.Service.RewardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DailyRewardJob {
    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private RewardService rewardService;

    @Autowired
    private RewardContainerRepository rewardContainerRepository;

    @Scheduled(cron = "0 0 0 * * ?") // Run every day at midnight
    public void generateDailyRewards() {
        List<Player> allPlayers = playerRepository.findAll();
        for (Player player : allPlayers) {
            if (rewardService.canClaimDailyReward(player)) {
                RewardContainer dailyReward = rewardService.createDailyReward(player);
                rewardContainerRepository.save(dailyReward);
            }
        }
    }
}