package net.daisyquest.daisyquestgame.Controller;


import net.daisyquest.daisyquestgame.Model.Activity;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Service.ActivityService;
import net.daisyquest.daisyquestgame.Service.PlayerProgressionService;
import net.daisyquest.daisyquestgame.Service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progression")
public class ProgressionController {

    @Autowired
    private PlayerProgressionService playerProgressionService;

    @Autowired
    private PlayerService playerService;

    @Autowired
    private ActivityService activityService;

    @PostMapping("/{playerId}/completeActivity/{activityId}")
    public ResponseEntity<String> completeActivity(@PathVariable String playerId, @PathVariable String activityId) {
        Player player = playerService.getPlayer(playerId);
        Activity activity = activityService.getActivity(activityId);

        if (player != null && activity != null) {
            playerProgressionService.completeActivity(player, activity);
            return ResponseEntity.ok("Activity completed successfully");
        }
        return ResponseEntity.badRequest().body("Invalid player or activity ID");
    }

    @PostMapping("/{playerId}/completeQuest/{questId}")
    public ResponseEntity<String> completeQuest(@PathVariable String playerId, @PathVariable String questId) {
        Player player = playerService.getPlayer(playerId);

        if (player != null) {
            boolean completed = playerProgressionService.completeQuest(player, questId);
            if (completed) {
                return ResponseEntity.ok("Quest completed successfully");
            } else {
                return ResponseEntity.badRequest().body("Quest requirements not met or already completed");
            }
        }
        return ResponseEntity.badRequest().body("Invalid player ID");
    }

    @PostMapping("/{playerId}/awardAchievement/{achievementId}")
    public ResponseEntity<String> awardAchievement(@PathVariable String playerId, @PathVariable String achievementId) {
        Player player = playerService.getPlayer(playerId);

        if (player != null) {
            playerProgressionService.awardAchievement(player, achievementId);
            return ResponseEntity.ok("Achievement awarded successfully");
        }
        return ResponseEntity.badRequest().body("Invalid player ID");
    }
}
