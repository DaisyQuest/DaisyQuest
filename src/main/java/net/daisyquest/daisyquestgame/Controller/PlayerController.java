package net.daisyquest.daisyquestgame.Controller;

import lombok.Data;
import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Service.*;
import net.daisyquest.daisyquestgame.Service.Failure.UsernameAlreadyExistsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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

    @Autowired
    private CastleService castleService;

    @Autowired
    private RewardService rewardService;

    @Autowired CurrencyService currencyService;

    @PostMapping("/register")
    public ResponseEntity<?> registerPlayer(@RequestBody Player player) {
        try {
            Player newPlayer = playerService.createPlayer(player);
            return ResponseEntity.ok(newPlayer);
        } catch (UsernameAlreadyExistsException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping(value = "/login", consumes = {"*/*"})
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
    public ResponseEntity<Map<String, Object>> getPlayer(@PathVariable String id) {
        Player player = playerService.getPlayer(id);
        if (player == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("player", player);
        response.put("currencyDetails", currencyService.getAllCurrencyDetails());
        return ResponseEntity.ok(response);
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
    public ResponseEntity<PlayerInventory> getInventory(@PathVariable String id) {
        Player player = playerService.getPlayer(id);
        if (player != null) {
            return ResponseEntity.ok(player.getInventory());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/castle")
    public ResponseEntity<Castle> getCastleForPlayer(@PathVariable String id) {
        Castle c = castleService.getCastleByOwnerId(id);
        if(c != null) {
            return ResponseEntity.ok(castleService.getCastleByOwnerId(id));
        }
        else {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/{id}/spells")
    public ResponseEntity<List<Spell>> getSpells(@PathVariable String id) {
        Player player = playerService.getPlayer(id);
        if (player != null) {
            return ResponseEntity.ok(player.getKnownSpells());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/use-item/{itemId}")
    public ResponseEntity<Map<String, String>> useItem(@PathVariable String id, @PathVariable String itemId) throws ItemNotFoundException {
        String result = playerService.useItem(id, itemId);
        return ResponseEntity.ok(Map.of("message", result));
    }

    @PostMapping("/{id}/drop-item/{itemId}")
    public ResponseEntity<Map<String, String>> dropItem(@PathVariable String id, @PathVariable String itemId) throws ItemNotFoundException {
        String result = playerService.removeItemFromInventory(id, itemId, -1);
        return ResponseEntity.ok(Map.of("message", result));
    }

    @PostMapping("/{id}/send-item")
    public ResponseEntity<Map<String, String>> sendItem(@PathVariable String id, @RequestBody Map<String, String> request) throws ItemNotFoundException {
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

    @Autowired
    private CraftingService craftingService;

    @PostMapping("/{id}/craft")
    public ResponseEntity<Map<String, String>> craftItem(@PathVariable String id, @RequestBody Map<String, Integer> itemIdsAndAmounts) {
        String result = craftingService.craftItem(id, itemIdsAndAmounts);
        return ResponseEntity.ok(Map.of("message", result));
    }
    @PutMapping("/{id}/sprite")
    public ResponseEntity<Player> updatePlayerSprite(@PathVariable String id, @RequestBody SpriteUpdateRequest request) {
        Player updatedPlayer = playerService.updatePlayerSprite(id, request);
        return ResponseEntity.ok(updatedPlayer);
    }

    @GetMapping("/{playerId}/unclaimed-rewards")
    public ResponseEntity<List<RewardContainer>> getUnclaimedRewards(@PathVariable String playerId) {
        try {
            List<RewardContainer> unclaimedRewards = rewardService.getUnclaimedRewards(playerId);
            return ResponseEntity.ok(unclaimedRewards);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/talents/{talent}")
    public ResponseEntity<Map<String, Object>> upgradeTalent(@PathVariable String id, @PathVariable String talent) {
        try {
            Player updatedPlayer = playerService.spendTalentPoint(id, Talent.valueOf(talent));
            Map<String, Object> response = new HashMap<>();
            response.put("talents", updatedPlayer.getTalents());
            response.put("talentPointsAvailable", updatedPlayer.getTalentPointsAvailable());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    @PostMapping("/{playerId}/add-test-items")
    public ResponseEntity<String> addTestItems(@PathVariable String playerId) {
        try {
            playerService.addTestItemsToPlayer(playerId);
            return ResponseEntity.ok("Test items added and equipped successfully");
        } catch (PlayerNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding test items: " + e.getMessage());
        }
    }


}