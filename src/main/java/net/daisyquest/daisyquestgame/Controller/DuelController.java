package net.daisyquest.daisyquestgame.Controller;

import lombok.Data;
import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.json.JsonObject;


@RestController
@RequestMapping("/api/duel")
public class DuelController {

    @Autowired
    private PlayerService playerService;

    @Autowired
    private ItemService itemService;

    @Autowired
    private CombatService combatService;

    @Autowired
    private WebSocketService webSocketService;

    @Autowired
    private SubmapService submapService;

    @PostMapping("/request")
    public ResponseEntity<?> requestDuel(@RequestBody DuelRequest request) {
        Player challenger = playerService.getPlayer(request.getChallengerId());
        Player target = playerService.getPlayer(request.getTargetId());

        if (challenger == null || target == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid player IDs"));
        }

        // Check if both players are in the same location (either both in overworld or same submap)
        if (!arePlayersInSameLocation(challenger, target)) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Players are not in the same location"));
        }

        double distance = calculateDistance(challenger, target);
        if (distance > 100) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Players are too far apart"));
        }

        if (!target.isDuelable()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Target player is not duelable"));
        }

        if (target.isNPC()) {
            // Automatically start combat with NPC
            Combat combat = combatService.startCombat(Arrays.asList(challenger.getId(), target.getId()), Collections.emptyMap());
            target.setDuelable(false);
            playerService.updatePlayer(target);
            return ResponseEntity.ok(new CombatStartedResponse(true, combat.getId()));
        } else {
            webSocketService.sendDuelRequest(target.getId(), challenger.getId());
            return ResponseEntity.ok(new SuccessResponse(true, "Duel request sent"));
        }
    }

    private boolean arePlayersInSameLocation(Player player1, Player player2) {
        if (player1.getCurrentSubmapId() != null && player2.getCurrentSubmapId() != null) {
            // Both players are in submaps
            return player1.getCurrentSubmapId().equals(player2.getCurrentSubmapId());
        } else if (player1.getCurrentSubmapId() == null && player2.getCurrentSubmapId() == null) {
            // Both players are in the overworld
            return true;
        }
        // One player is in a submap and the other is not
        return false;
    }

    private double calculateDistance(Player player1, Player player2) {
        if (player1.getCurrentSubmapId() != null) {
            // Players are in a submap
            int dx = player1.getSubmapCoordinateX() - player2.getSubmapCoordinateX();
            int dy = player1.getSubmapCoordinateY() - player2.getSubmapCoordinateY();
            return Math.sqrt(dx * dx + dy * dy);
        } else {
            // Players are in the overworld
            int dx = player1.getWorldPositionX() - player2.getWorldPositionX();
            int dy = player1.getWorldPositionY() - player2.getWorldPositionY();
            return Math.sqrt(dx * dx + dy * dy);
        }
    }

    @PostMapping("/accept")
    public ResponseEntity<?> acceptDuel(@RequestBody DuelRequest request) throws IOException {
        Player challenger = playerService.getPlayer(request.getChallengerId());
        Player target = playerService.getPlayer(request.getTargetId());

        if (challenger == null || target == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid player IDs"));
        }

        if (!arePlayersInSameLocation(challenger, target)) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Players are no longer in the same location"));
        }

        Combat combat = combatService.startCombat(Arrays.asList(challenger.getId(), target.getId()), Collections.emptyMap());

        // Notify both players through WebSocket
        webSocketService.sendDuelAccepted(challenger.getId(), target.getId(), combat.getId());

        return ResponseEntity.ok(new CombatStartedResponse(true, combat.getId()));
    }

    @PostMapping("/reject")
    public ResponseEntity<?> rejectDuel(@RequestBody DuelRequest request) {
        Player challenger = playerService.getPlayer(request.getChallengerId());
        Player target = playerService.getPlayer(request.getTargetId());

        if (challenger == null || target == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid player IDs"));
        }

        webSocketService.sendDuelRejection(challenger.getId(), target.getUsername());
        return ResponseEntity.ok(new SuccessResponse(true, "Duel request rejected"));
    }

    // ... rest of the code remains the same ...

    @Data
    static class DuelRequest {
        private String challengerId;
        private String targetId;
    }

    @Data
    static class CombatStartedResponse {
        private boolean success;
        private String combatId;

        public CombatStartedResponse(boolean success, String combatId) {
            this.success = success;
            this.combatId = combatId;
        }
    }

    @Data
    static class SuccessResponse {
        private boolean success;
        private String message;

        public SuccessResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
    }

    @Data
    static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}