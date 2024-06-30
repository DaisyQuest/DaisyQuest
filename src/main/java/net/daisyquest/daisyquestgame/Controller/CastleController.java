package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Repository.BuildingTypeRepository;
import net.daisyquest.daisyquestgame.Repository.TroopRepository;
import net.daisyquest.daisyquestgame.Repository.TroopTypeRepository;
import net.daisyquest.daisyquestgame.Service.CastleService;
import net.daisyquest.daisyquestgame.Service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/castle")
public class CastleController {

    @Autowired
    private CastleService castleService;

    @Autowired
    private SimulationService simulationService;

    @Autowired
    private BuildingTypeRepository buildingTypeRepository;

    @Autowired
    private TroopTypeRepository troopTypeRepository;

    @GetMapping("/{castleId}")
    public ResponseEntity<Castle> getCastleStatus(@PathVariable String castleId) {
        try {
            Castle castle = castleService.getCastleById(castleId);
            return ResponseEntity.ok(castle);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/building-types")
    public ResponseEntity<List<BuildingType>> getBuildingTypes() {
        try {

            return ResponseEntity.ok(buildingTypeRepository.findAll());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/troop-types")
    public ResponseEntity<List<TroopType>> getTroopTypes() {
        try {

            return ResponseEntity.ok(troopTypeRepository.findAll());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/create/{playerId}")
    @PutMapping("/create/{playerId}")
    public ResponseEntity<Castle> createCastleForPlayer(@PathVariable String playerId) {
        try {
            Castle castle = castleService.createCastle(playerId);
            return ResponseEntity.ok(castle);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{castleId}/simulations")
    public ResponseEntity<Page<SimulationLog>> getCastleSimulations(@PathVariable String castleId,
                                                                    @RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "10") int size) {
        try {
            Page<SimulationLog> logs = simulationService.getSimulationLogs(castleId, page, size);
            return ResponseEntity.ok(logs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{castleId}/buildings")
    @GetMapping("/{castleId}/buildings")
    public ResponseEntity<Building> addBuilding(@PathVariable String castleId, @RequestBody String buildingTypeId) {
        try {
            Building building = castleService.addBuilding(castleId, buildingTypeId);
            return ResponseEntity.ok(building);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/{castleId}/troops")
    public ResponseEntity<Troop> addTroop(@PathVariable String castleId, @RequestBody String troopTypeId) {
        try {
            Troop troop = castleService.addTroop(castleId, troopTypeId);
            return ResponseEntity.ok(troop);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}

