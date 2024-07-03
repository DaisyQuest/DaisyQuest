package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Service.CombatService;
import net.daisyquest.daisyquestgame.Service.ItemService;
import net.daisyquest.daisyquestgame.Service.PlayerService;
import net.daisyquest.daisyquestgame.Service.WebSocketService;
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

        @PostMapping("/request")
        public ResponseEntity<?> requestDuel(@RequestBody DuelRequest request) {
            Player challenger = playerService.getPlayer(request.getChallengerId());
            Player target = playerService.getPlayer(request.getTargetId());

            if (challenger == null || target == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Invalid player IDs"));
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
                return ResponseEntity.ok(new CombatStartedResponse(true ,combat.getId()));
            } else {

                webSocketService.sendDuelRequest(target.getId(), challenger.getId());
                return ResponseEntity.ok(new SuccessResponse(true, "Duel request sent"));
            }
        }

    private double calculateDistance(Player challenger, Player target) {
        int dx = challenger.getWorldPositionX() - target.getWorldPositionX();
        int dy = challenger.getWorldPositionY() - target.getWorldPositionY();
        return Math.sqrt(dx * dx + dy * dy);
    }

    @PostMapping("/accept")
    public ResponseEntity<?> acceptDuel(@RequestBody DuelRequest request) throws IOException {
        Player challenger = playerService.getPlayer(request.getChallengerId());
        Player target = playerService.getPlayer(request.getTargetId());

        if (challenger == null || target == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid player IDs"));
        }

            Combat combat = combatService.startCombat(Arrays.asList(challenger.getId(), target.getId()), Collections.emptyMap());

            // Notify both players through WebSocket
            webSocketService.sendDuelAccepted(challenger.getId(), target.getId(), combat.getId());

            return ResponseEntity.ok(new SuccessResponse(true, "Duel accepted and combat started"));

    }

// In your WebSocketHandler or relevant WebSocket service


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
    @PostMapping("/transfer")
    @Transactional
    public ResponseEntity<?> transferItem(@RequestBody ItemTransferRequest request) {
        Player fromPlayer = playerService.getPlayer(request.getFromPlayerId());
        Player toPlayer = playerService.getPlayer(request.getToPlayerId());
        Item item = itemService.getItem(request.getItemId());

        if (fromPlayer == null || toPlayer == null || item == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Invalid player or item IDs"));
        }

        if (!fromPlayer.getInventory().contains(item)) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Item not found in player's inventory"));
        }

        fromPlayer.getInventory().remove(item);
        toPlayer.getInventory().add(item);

        playerService.updatePlayer(fromPlayer);
        playerService.updatePlayer(toPlayer);

        return ResponseEntity.ok(new SuccessResponse(true, "Item transferred successfully"));
    }



    class DuelRequestSentResponse {
        public boolean success;
        public boolean combatStarted;

        public DuelRequestSentResponse(boolean success) {
            this.success = success;
            this.combatStarted = false;
        }
    }

}
