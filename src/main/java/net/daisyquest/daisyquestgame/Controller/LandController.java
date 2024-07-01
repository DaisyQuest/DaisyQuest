package net.daisyquest.daisyquestgame.Controller;


import net.daisyquest.daisyquestgame.Model.Land;
import net.daisyquest.daisyquestgame.Model.WorldMap;
import net.daisyquest.daisyquestgame.Service.LandService;
import net.daisyquest.daisyquestgame.Service.WorldMapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/land")
public class LandController {

    @Autowired
    private LandService landService;

    @Autowired
    private WorldMapService worldMapService;

    @GetMapping("/{landId}")
    public ResponseEntity<Land> getLand(@PathVariable String landId) {
        return ResponseEntity.ok(landService.getLand(landId));
    }

    @PostMapping("/buy")
    public ResponseEntity<Land> buyLand(@RequestParam String landId, @RequestParam String buyerId, @RequestParam String currencyType) {
        return ResponseEntity.ok(landService.buyLand(landId, buyerId, currencyType));
    }

    @PostMapping("/sell")
    public ResponseEntity<Land> sellLand(@RequestParam String landId, @RequestBody Map<String, Integer> prices) {
        return ResponseEntity.ok(landService.sellLand(landId, prices));
    }

    @PostMapping("/{landId}/partition")
    public ResponseEntity<Land> partitionLand(@PathVariable String landId, @RequestParam double area, @RequestParam int payoutInterval) {
        Land land = landService.getLand(landId);
        land.addPartition(area, payoutInterval);
        return ResponseEntity.ok(landService.updateLand(land));
    }

    @DeleteMapping("/{landId}/partition/{partitionIndex}")
    public ResponseEntity<Land> removePartition(@PathVariable String landId, @PathVariable int partitionIndex) {
        Land land = landService.getLand(landId);
        land.removePartition(partitionIndex);
        return ResponseEntity.ok(landService.updateLand(land));
    }

    @PostMapping("/{landId}/partition/{partitionIndex}/governor")
    public ResponseEntity<Land> setGovernor(@PathVariable String landId, @PathVariable int partitionIndex, @RequestParam String governorId) {
        Land land = landService.getLand(landId);
        land.setGovernor(partitionIndex, landService.getPlayer(governorId));
        return ResponseEntity.ok(landService.updateLand(land));
    }

    @GetMapping("/forsale")
    public ResponseEntity<List<Land>> getLandsForSale() {
        return ResponseEntity.ok(landService.getLandsForSale());
    }


    @GetMapping("/init")
    public ResponseEntity<WorldMap> initializeOrGetWorldMap() {
        WorldMap worldMap = worldMapService.getOrCreateWorldMap(20, 20);
        return ResponseEntity.ok(worldMap);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Land>> getAll() {
        List<Land> allLands = landService.getAll();
        return ResponseEntity.ok(allLands);
    }

    @GetMapping
    public ResponseEntity<Land> getLandByCoordinates(@RequestParam int x, @RequestParam int y) {
        Land land = landService.getLandByCoordinates(x, y);
        if (land != null) {
            return ResponseEntity.ok(land);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


}