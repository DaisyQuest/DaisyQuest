package net.daisyquest.daisyquestgame.Controller;

import lombok.Data;
import net.daisyquest.daisyquestgame.Model.Land;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.WorldMap;
import net.daisyquest.daisyquestgame.Service.WorldMapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/world-map")
public class WorldMapController {

    @Autowired
    private WorldMapService worldMapService;

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

    @GetMapping("/land")
    public ResponseEntity<Land> getLandAtPosition(@RequestParam int x, @RequestParam int y) {
        Land land = worldMapService.getLandAtPosition(x, y);
        return land != null ? ResponseEntity.ok(land) : ResponseEntity.notFound().build();
    }
    @Data
    static
    class MoveRequest {
        private String playerId;
        private int newX;
        private int newY;

        // Getters and setters
    }
}

