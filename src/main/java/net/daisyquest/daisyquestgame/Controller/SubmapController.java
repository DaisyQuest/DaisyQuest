package net.daisyquest.daisyquestgame.Controller;

import lombok.Getter;
import lombok.Setter;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.Submap;
import net.daisyquest.daisyquestgame.Service.SubmapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submaps")
public class SubmapController {

    @Autowired
    private SubmapService submapService;

    @GetMapping("/{id}")
    public ResponseEntity<Submap> getSubmapById(@PathVariable String id) {
        try {
            Submap submap = submapService.getSubmapById(id);
            return ResponseEntity.ok(submap);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Submap>> getAllSubmaps() {
        List<Submap> submaps = submapService.getAllSubmaps();
        return ResponseEntity.ok(submaps);
    }

    @PostMapping
    public ResponseEntity<Submap> createSubmap(@RequestBody Submap submap) {
        Submap createdSubmap = submapService.createSubmap(submap);
        return ResponseEntity.ok(createdSubmap);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Submap> updateSubmap(@PathVariable String id, @RequestBody Submap submap) {
        submap.setId(id);
        try {
            Submap updatedSubmap = submapService.updateSubmap(submap);
            return ResponseEntity.ok(updatedSubmap);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubmap(@PathVariable String id) {
        try {
            submapService.deleteSubmap(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{submapId}/move/{playerId}")
    public ResponseEntity<Player> movePlayerToSubmap(@PathVariable String playerId, @PathVariable String submapId) {
        try {
            Player updatedPlayer = submapService.movePlayerToSubmap(playerId, submapId);
            return ResponseEntity.ok(updatedPlayer);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{submapId}/return/{playerId}")
    public ResponseEntity<Player> returnToOverworld(
            @PathVariable String playerId,
            @PathVariable String submapId,
            @RequestParam(defaultValue = "false") boolean returnToPlayerHome,
            @RequestParam(defaultValue = "false") boolean returnToSpawn) {
        try {
            Player updatedPlayer = submapService.returnPlayerToOverworld(playerId, submapId, returnToPlayerHome, returnToSpawn);
            return ResponseEntity.ok(updatedPlayer);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{submapId}/players")
    public ResponseEntity<List<Player>> getPlayersInSubmap(@PathVariable String submapId) {
        List<Player> players = submapService.getPlayersInSubmap(submapId);
        return ResponseEntity.ok(players);
    }



    @PostMapping("/{submapId}/move-player")
    public ResponseEntity<Player> movePlayerInSubmap(
            @PathVariable String submapId,
            @RequestBody MovePlayerRequest request) {
        try {
            Player updatedPlayer = submapService.movePlayerInSubmap(
                    submapId,
                    request.getPlayerId(),
                    request.getX(),
                    request.getY()
            );
            return ResponseEntity.ok(updatedPlayer);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    // Inner class to represent the request body
    @Setter
    @Getter
    private static class MovePlayerRequest {
        // Getters and setters
        private String playerId;
        private int x;
        private int y;

    }

}