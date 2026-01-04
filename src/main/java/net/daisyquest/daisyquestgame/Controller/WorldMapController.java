package net.daisyquest.daisyquestgame.Controller;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Repository.WorldObjectRepository;
import net.daisyquest.daisyquestgame.Service.WorldMapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/world-map")
public class WorldMapController {

    @Autowired
    private WorldMapService worldMapService;

    @Autowired
    private WorldObjectRepository worldObjectRepository;

    @GetMapping
    public ResponseEntity<WorldMap> getWorldMap() {
        return ResponseEntity.ok(worldMapService.getWorldMap());
    }

    @PostMapping("/move")
    public ResponseEntity<Player> movePlayer(@RequestBody MoveRequest moveRequest) {
        try {
            Player updatedPlayer = worldMapService.movePlayer(
                    moveRequest.getPlayerId(), moveRequest.getNewX(), moveRequest.getNewY());
            return ResponseEntity.ok(updatedPlayer);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/players")
    public ResponseEntity<List<Player>> getPlayersInViewport(
            @RequestParam int centerX, @RequestParam int centerY,
            @RequestParam int viewportWidth, @RequestParam int viewportHeight) {
        return ResponseEntity.ok(worldMapService.getPlayersInViewport(centerX, centerY, viewportWidth, viewportHeight));
    }

    @GetMapping("/minimap")
    public ResponseEntity<MinimapResponse> getMinimapData(@RequestParam String playerId) {
        return ResponseEntity.ok(worldMapService.getMinimapData(playerId));
    }

    @GetMapping("/land")
    public ResponseEntity<Land> getLandAtPosition(@RequestParam int x, @RequestParam int y) {
        Land land = worldMapService.getLandAtPosition(x, y);
        return land != null ? ResponseEntity.ok(land) : ResponseEntity.notFound().build();
    }

    @GetMapping("/submap-entrances")
    public ResponseEntity<List<SubmapEntranceDTO>> getSubmapEntrances() {
        List<SubmapEntranceDTO> entrances = worldMapService.getSubmapEntrances();
        return ResponseEntity.ok(entrances);
    }
    @GetMapping("/check-submap-entrance")
    public ResponseEntity<?> checkSubmapEntrance(@RequestParam int x, @RequestParam int y) {
        boolean isNearEntrance = worldMapService.isPlayerNearSubmapEntrance(x, y);
        if (isNearEntrance) {
            String submapId = worldMapService.getSubmapIdNearPlayer(x, y);
            return ResponseEntity.ok(Map.of("nearEntrance", true, "submapId", submapId));
        } else {
            return ResponseEntity.ok(Map.of("nearEntrance", false));
        }
    }

    @GetMapping("/items")
    public ResponseEntity<List<MapItem>> getMapItemsInViewport(
            @RequestParam int centerX,
            @RequestParam int centerY,
            @RequestParam int viewportWidth,
            @RequestParam int viewportHeight) {
        List<MapItem> items = worldMapService.findMapItemsInViewport(centerX, centerY, viewportWidth, viewportHeight);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/items/{itemId}/pickup")
    public ResponseEntity<Map<String, Object>> pickupItem(@PathVariable String itemId, @RequestBody Map<String, String> body) {
        String playerId = body.get("playerId");
        boolean success = worldMapService.pickupItem(itemId, playerId);
        if (success) {
            return ResponseEntity.ok(Map.of("success", true));
        } else {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to pick up item"));
        }
    }


    @GetMapping("/world-objects")
    public ResponseEntity<List<WorldObject>> getWorldObjectsInViewport(
            @RequestParam int centerX,
            @RequestParam int centerY,
            @RequestParam int viewportWidth,
            @RequestParam int viewportHeight) {

        try {


            int minX = centerX - (viewportWidth / 2);
            int maxX = centerX + (viewportWidth / 2);
            int minY = centerY - (viewportHeight / 2);
            int maxY = centerY + (viewportHeight / 2);

            List<WorldObject> objects = worldObjectRepository
                    .findByxPosBetweenAndyPosBetween(minX, maxX, minY, maxY);


            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(objects);

        } catch (Exception e) {
            System.err.println("Error fetching world objects: " + e);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Collections.emptyList()); // Return empty list instead of null
        }
    }

    @PostMapping("/world-objects/{objectId}/interact")
    public ResponseEntity<Map<String, Object>> startInteraction(
            @PathVariable String objectId,
            @RequestBody WorldObjectInteractionRequest request) {
        try {
            InteractionResult result = worldMapService.startWorldObjectInteraction(
                    request.getPlayerId(),
                    objectId,
                    request.getInteractionType(),
                    request.getInteractionData()
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", result.getMessage(),
                    "interactionId", result.getActiveInteractionId(),
                    "interactionType", result.getInteractionType(),
                    "state", result.getStateData()
            ));
        } catch (CooldownActiveException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Interaction is on cooldown",
                    "remainingCooldownMs", e.getRemainingCooldownMs()
            ));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/world-objects/{objectId}/interact/{interactionId}/progress")
    public ResponseEntity<Map<String, Object>> updateInteractionProgress(
            @PathVariable String objectId,
            @PathVariable String interactionId,
            @RequestBody Map<String, Object> progressData) {
        try {
            InteractionResult result = worldMapService.updateInteractionProgress(
                    interactionId, progressData);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", result.getMessage());
            response.put("completed", result.isCompleted());
            response.put("state", result.getStateData());

            if (result.isCompleted()) {
                response.put("rewards", result.getStateData().get("rewards"));
            }

            return ResponseEntity.ok(response);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/world-objects/{objectId}/interact/{interactionId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelInteraction(
            @PathVariable String objectId,
            @PathVariable String interactionId) {
        try {
            worldMapService.cancelInteraction(interactionId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Interaction cancelled successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorldObjectInteractionRequest {
        private String playerId;
        private InteractionType interactionType;
        private Map<String, Object> interactionData;
    }
    @Data
    static class MoveRequest {
        private String playerId;
        private int newX;
        private int newY;
        // Getters and setters
    }
}




