package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.Shop;
import net.daisyquest.daisyquestgame.Service.Failure.UsernameAlreadyExistsException;
import net.daisyquest.daisyquestgame.Service.PlayerService;
import net.daisyquest.daisyquestgame.Service.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    @Autowired
    private PlayerService playerService;

    @Autowired
    private ShopService shopService;
    @PostMapping("/register")
    public ResponseEntity<?> registerPlayer(@RequestBody Player player) {
        try {
            Player newPlayer = playerService.createPlayer(player);
            return ResponseEntity.ok(newPlayer);
        } catch (UsernameAlreadyExistsException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginPlayer(@RequestBody Player player) {
        Player existingPlayer = playerService.getPlayerByUsername(player.getUsername());
        if (existingPlayer != null) {
            return ResponseEntity.ok(existingPlayer);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username");
        }
    }

    @PostMapping
    public ResponseEntity<?> createPlayer(@RequestBody Player player) {
        try {
            Player newPlayer = playerService.createPlayer(player);
            return ResponseEntity.ok(newPlayer);
        } catch (UsernameAlreadyExistsException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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

    @GetMapping("/{id}/attributes")
    public ResponseEntity<Set<String>> getPlayerAttributes(@PathVariable String id) {
        Player player = playerService.getPlayer(id);
        if (player != null) {
            return ResponseEntity.ok(player.getAttributes().keySet());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/shop")
    public ResponseEntity<Shop> getPlayerShop(@PathVariable String id) {
        Shop shop = shopService.getPlayerShop(id);
        return ResponseEntity.ok(shop);
    }

    @PostMapping("/{id}/shop/list-item")
    public ResponseEntity<Map<String, String>> listItemForSale(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String itemId = (String) body.get("itemId");
        int price = Integer.parseInt(body.get("price").toString()); // Parse the price as an integer
        String currencyId = (String) body.get("currencyId");
        Integer quantity = body.get("quantity") != null ? Integer.parseInt(body.get("quantity").toString()) : null;

        String result = shopService.listItemForSale(id, itemId, price, currencyId, quantity);
        return ResponseEntity.ok(Map.of("message", result));
    }

    @PostMapping("/{id}/shop/remove-item/{shopItemId}")
    public ResponseEntity<Map<String, String>> removeShopItem(@PathVariable String id, @PathVariable String shopItemId) {
        String result = shopService.removeShopItem(id, shopItemId);
        return ResponseEntity.ok(Map.of("message", result));
    }


}