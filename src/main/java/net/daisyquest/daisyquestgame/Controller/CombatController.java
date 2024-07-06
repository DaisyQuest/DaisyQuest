package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.Action;
import net.daisyquest.daisyquestgame.Model.Combat;
import net.daisyquest.daisyquestgame.Model.CombatLog;
import net.daisyquest.daisyquestgame.Model.StatusEffectInfo;
import net.daisyquest.daisyquestgame.Service.CombatService;
import net.daisyquest.daisyquestgame.Service.StatusEffectService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/combat")
public class CombatController {
    private static final Logger logger = LoggerFactory.getLogger(CombatController.class);

    @Autowired
    private CombatService combatService;

    @Autowired
    private StatusEffectService statusEffectService;

    @PostMapping("/start")
    public ResponseEntity<?> startCombat(@RequestBody Map<String, Object> request) {
        try {
            List<String> playerIds = (List<String>) request.get("playerIds");
            Map<String, String> playerTeams = (Map<String, String>) request.get("playerTeams");

            if (playerIds == null || playerIds.isEmpty()) {
                return ResponseEntity.badRequest().body("Player IDs are required");
            }

            Combat combat = combatService.startCombat(playerIds, playerTeams);
            return ResponseEntity.ok(combat);
        } catch (Exception e) {
            logger.error("Error starting combat", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error starting combat: " + e.getMessage());
        }
    }

    @GetMapping("/{combatId}")
    public ResponseEntity<?> getCombat(@PathVariable String combatId) {
        try {
            Combat combat = combatService.getCombat(combatId);
            if (combat == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Combat session not found");
            }
            return ResponseEntity.ok(combat);
        } catch (Exception e) {
            logger.error("Error retrieving combat", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving combat: " + e.getMessage());
        }
    }

    @PostMapping("/{combatId}/action")
    public ResponseEntity<?> performAction(@PathVariable String combatId, @RequestBody Action action) {
        try {
            Combat updatedCombat = combatService.performAction(combatId, action);
            return ResponseEntity.ok(updatedCombat);
        } catch (IllegalStateException | IllegalArgumentException e) {
            logger.warn("Invalid action attempt", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error performing action", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error performing action: " + e.getMessage());
        }
    }

    @GetMapping("/{combatId}/logs")
    public ResponseEntity<List<CombatLog>> getCombatLogs(@PathVariable String combatId) {
        List<CombatLog> logs = combatService.getCombatLogs(combatId);
        return ResponseEntity.ok(logs);
    }

//    @GetMapping("/{combatId}/status-effects")
//    public ResponseEntity<Map<String, List<StatusEffectInfo>>> getActiveStatusEffects(@PathVariable String combatId) {
//        Combat combat = combatService.getCombat(combatId);
//        if (combat == null) {
//            return ResponseEntity.notFound().build();
//        }
//        Map<String, List<StatusEffectInfo>> activeEffects = statusEffectService.getActiveStatusEffects(combat);
//        return ResponseEntity.ok(activeEffects);
//    }

}
