package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    @Autowired
    private PlayerService playerService;

    @PostMapping
    public ResponseEntity<Player> createPlayer(@RequestBody Player player) {
        return ResponseEntity.ok(playerService.createPlayer(player));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Player> getPlayer(@PathVariable String id) {
        Player player = playerService.getPlayer(id);
        return player != null ? ResponseEntity.ok(player) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<Player>> getAllPlayers() {
        return ResponseEntity.ok(playerService.getAllPlayers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Player> updatePlayer(@PathVariable String id, @RequestBody Player player) {
        player.setId(id);
        return ResponseEntity.ok(playerService.updatePlayer(player));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlayer(@PathVariable String id) {
        playerService.deletePlayer(id);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/{id}/inventory")
    public ResponseEntity<List<Item>> getInventory(@PathVariable String id) {
        Player player = playerService.getPlayer(id);
        if (player != null) {
            return ResponseEntity.ok(player.getInventory());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/use-item/{itemId}")
    public ResponseEntity<Map<String, String>> useItem(@PathVariable String id, @PathVariable String itemId) {
        String result = playerService.useItem(id, itemId);
        return ResponseEntity.ok(Map.of("message", result));
    }

    @PostMapping("/{id}/drop-item/{itemId}")
    public ResponseEntity<Map<String, String>> dropItem(@PathVariable String id, @PathVariable String itemId) {
        String result = playerService.dropItem(id, itemId);
        return ResponseEntity.ok(Map.of("message", result));
    }

    @PostMapping("/{id}/send-item")
    public ResponseEntity<Map<String, String>> sendItem(@PathVariable String id, @RequestBody Map<String, String> request) {
        String itemId = request.get("itemId");
        String recipientUsername = request.get("recipientUsername");
        String result = playerService.sendItem(id, itemId, recipientUsername);
        return ResponseEntity.ok(Map.of("message", result));
    }
}