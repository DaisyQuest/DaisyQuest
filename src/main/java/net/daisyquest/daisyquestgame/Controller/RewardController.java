package net.daisyquest.daisyquestgame.Controller;


import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.Reward;
import net.daisyquest.daisyquestgame.Model.RewardContainer;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Service.RewardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rewards")
public class RewardController {
    @Autowired
    private RewardService rewardService;



    @PostMapping("/open-chest/{playerId}/{chestId}")
    public ResponseEntity<List<Reward>> openChest(@PathVariable String playerId, @PathVariable String chestId) {
        List<Reward> rewards = rewardService.openChest(playerId, chestId);
        return ResponseEntity.ok(rewards);
    }

    @PostMapping("/claim-reward/{playerId}/{rewardContainerId}")
    public ResponseEntity<Void> claimReward(@PathVariable String playerId, @PathVariable String rewardContainerId) {
        rewardService.claimReward(playerId, rewardContainerId);
        return ResponseEntity.ok().build();
    }



    @PostMapping("/claim-daily-reward/{playerId}")
    public ResponseEntity<Void> claimDailyReward(@PathVariable String playerId) {
        try {
            rewardService.claimDailyReward(playerId);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/unclaimed-rewards/{playerId}")
    public ResponseEntity<List<RewardContainer>> getUnclaimedRewards(@PathVariable String playerId) {
        List<RewardContainer> unclaimedRewards = rewardService.getUnclaimedRewards(playerId);
        return ResponseEntity.ok(unclaimedRewards);
    }

    @PostMapping("/test-random-reward/{playerId}")
    public ResponseEntity<Reward> testRandomReward(@PathVariable String playerId) {
        try {
            Reward randomReward = rewardService.generateAndApplyRandomReward(playerId);
            return ResponseEntity.ok(randomReward);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Checks if a player can claim their daily reward.
     *
     * @param playerId The ID of the player to check
     * @return ResponseEntity containing a boolean indicating if the player can claim the daily reward
     */
    @GetMapping("/can-claim-daily-reward/{playerId}")
    public ResponseEntity<Boolean> canClaimDailyReward(@PathVariable String playerId) {
        try {
            boolean canClaim = rewardService.canClaimDailyReward(playerId);
            return ResponseEntity.ok(canClaim);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(false);
        }
    }



    /**
     * Opens a random chest for a player.
     * This endpoint is for testing purposes.
     *
     * @param playerId The ID of the player to open a random chest for
     * @return ResponseEntity containing the List of Rewards from the opened chest
     */
    @PostMapping("/open-random-chest/{playerId}")
    public ResponseEntity<List<Reward>> openRandomChest(@PathVariable String playerId) {
        try {
            List<Reward> rewards = rewardService.openRandomChest(playerId);
            return ResponseEntity.ok(rewards);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

}