package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.Shop;
import net.daisyquest.daisyquestgame.Service.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shops")
public class ShopController {

    @Autowired
    private ShopService shopService;

    @GetMapping
    public ResponseEntity<List<Shop>> getAllShops() {
        return ResponseEntity.ok(shopService.getAllShops());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shop> getShop(@PathVariable String id) {
        return ResponseEntity.ok(shopService.getShop(id));
    }

    @PostMapping("/{shopId}/buy/{itemId}")
    public ResponseEntity<Map<String, String>> buyItem(@PathVariable String shopId, @PathVariable String itemId, @RequestBody Map<String, String> body) {
        String playerId = body.get("playerId");
        String result = shopService.buyItem(shopId, itemId, playerId);
        return ResponseEntity.ok(Map.of("message", result));
    }
}