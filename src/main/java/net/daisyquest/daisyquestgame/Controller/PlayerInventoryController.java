package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.InsufficientItemQuantityException;
import net.daisyquest.daisyquestgame.Model.ItemNotFoundException;
import net.daisyquest.daisyquestgame.Model.PlayerInventory;
import net.daisyquest.daisyquestgame.Service.EquipmentRequirementNotMetException;
import net.daisyquest.daisyquestgame.Service.InventoryFullException;
import net.daisyquest.daisyquestgame.Service.PlayerNotFoundException;
import net.daisyquest.daisyquestgame.Service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class PlayerInventoryController {

    @Autowired
    private PlayerService playerService;

    @GetMapping("/{playerId}")
    public ResponseEntity<PlayerInventory> getInventory(@PathVariable String playerId) {
        return ResponseEntity.ok(playerService.getPlayerInventory(playerId));
    }

    @PostMapping("/{playerId}/equip")
    public ResponseEntity<Map<String, String>> equipItem(
            @PathVariable String playerId,
            @RequestParam String itemId,
            @RequestParam String slotType) {
        try {
            String result = playerService.equipItem(playerId, itemId, slotType);
            return ResponseEntity.ok(Map.of("message", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{playerId}/send-item")
    public ResponseEntity<Map<String, String>> sendItem(
            @PathVariable String playerId,
            @RequestBody Map<String, String> request) {
        try {
            String itemId = request.get("itemId");
            String recipientUsername = request.get("recipientUsername");
            String result = playerService.sendItem(playerId, itemId, recipientUsername);
            return ResponseEntity.ok(Map.of("message", result));
        } catch (PlayerNotFoundException | ItemNotFoundException | InsufficientItemQuantityException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{playerId}/unequip")
    public ResponseEntity<Map<String, String>> unequipItem(
            @PathVariable String playerId,
            @RequestParam String slotType) {
        try {
            playerService.unequipItem(playerId, slotType);
            return ResponseEntity.ok(Map.of("message", "Item successfully unequipped"));
        } catch (PlayerNotFoundException | ItemNotFoundException | InventoryFullException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{playerId}/move-equipment")
    public ResponseEntity<Map<String, String>> moveEquipment(
            @PathVariable String playerId,
            @RequestBody Map<String, String> request) {
        try {
            String itemId = request.get("itemId");
            String fromSlotType = request.get("fromSlotType");
            String toSlotType = request.get("toSlotType");
            String result = playerService.moveEquipment(playerId, itemId, fromSlotType, toSlotType);
            return ResponseEntity.ok(Map.of("message", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @PostMapping("/{playerId}/unequiptoslot")
    public ResponseEntity<Map<String, String>> unequipToSlot(
            @PathVariable String playerId,
            @RequestParam String slotType,
            @RequestParam int toSlot) {
        try {
            String result = playerService.unequipItemToSlot(playerId, slotType, toSlot);
            return ResponseEntity.ok(Map.of("message", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @PostMapping("/{playerId}/drop-item/{itemId}")
    public ResponseEntity<Map<String, String>> dropItem(
            @PathVariable String playerId,
            @PathVariable String itemId,
            @RequestParam(defaultValue = "-1") int quantity) {
        try {
            String result = playerService.dropItem(playerId, itemId, quantity);
            if (result == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "An unexpected error occurred while dropping the item"));
            }
            return ResponseEntity.ok(Map.of("message", result));
        } catch (PlayerNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Player not found: " + e.getMessage()));
        } catch (ItemNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Item not found: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred: " + e.getMessage()));
        }
    }

    @PostMapping("/{playerId}/move")
    public ResponseEntity<Void> moveItem(@PathVariable String playerId,
                                         @RequestParam String itemId,
                                         @RequestParam int fromSlot,
                                         @RequestParam int toSlot) {
        playerService.moveItem(playerId, itemId, fromSlot, toSlot);
        return ResponseEntity.ok().build();
    }
}