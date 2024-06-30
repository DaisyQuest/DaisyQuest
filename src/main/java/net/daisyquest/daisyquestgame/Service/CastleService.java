package net.daisyquest.daisyquestgame.Service;


import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.ArrayList;
import java.util.List;
@Service
public class CastleService {

    @Autowired
    private CastleRepository castleRepository;

    @Autowired
    private BuildingRepository buildingRepository;

    @Autowired
    private BuildingTypeRepository buildingTypeRepository;
    @Autowired
    private TroopRepository troopRepository;

    @Autowired
    private TroopTypeRepository troopTypeRepository;

    @Autowired
    private PlayerService playerService;

    @Autowired SimulationService simulationService;
    @Transactional
    public Castle createCastle(String playerId) {
        Player player = playerService.getPlayer(playerId);
        if (player == null) {
            throw new IllegalArgumentException("Player not found");
        }

        Castle existingCastle = castleRepository.findByOwnerId(playerId);
        if (existingCastle != null) {
            throw new IllegalStateException("Player already has a castle");
        }

        Castle castle = new Castle();
        castle.setBuildings(new ArrayList<>());
        castle.setTroops(new ArrayList<>());
        castle.setOwner(player);
        castle.setHealth(100000);
        return castleRepository.save(castle);
    }

    public Castle getCastleById(String p_castleId){
        return castleRepository.findById(p_castleId)
                .orElseThrow(() -> new IllegalArgumentException("Castle not found"));
    }
    @GetMapping("/api/players/{playerId}/castle")
    public ResponseEntity<Castle> getCastleForPlayer(@PathVariable String playerId) {
        Player player = playerService.getPlayer(playerId);
        if (player == null) {
            return ResponseEntity.notFound().build();
        }
        Castle castle = getCastleByOwnerId(playerId);
        if (castle == null) {
            return ResponseEntity.noContent().build(); // No castle yet
        }
        return ResponseEntity.ok(castle);
    }

    @GetMapping("/castle/{castleId}/simulations")
    public ResponseEntity<Page<SimulationLog>> getCastleSimulations(@PathVariable String castleId,
                                                                    @RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "10") int size) {
        Page<SimulationLog> logs = simulationService.getSimulationLogs(castleId, page, size);
        return ResponseEntity.ok(logs);
    }
    public Castle getCastleByOwnerId(String p_playerId){
        return castleRepository.findByOwnerId(p_playerId);
    }
    @Transactional
    public Building addBuilding(String castleId, String buildingTypeId) {
        Castle castle = castleRepository.findById(castleId)
                .orElseThrow(() -> new IllegalArgumentException("Castle not found"));

        BuildingType buildingType = buildingTypeRepository.findById(buildingTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Building type not found"));

        int buildingCount = (int) castle.getBuildings().stream()
                .filter(b -> b.getBuildingType().getId().equals(buildingTypeId))
                .count();

        if (buildingCount >= buildingType.getLimitPerCastle()) {
            throw new IllegalStateException("Building limit reached for this type");
        }

        int cost = calculateBuildingCost(buildingType, buildingCount + 1);
        if (!playerService.deductResources(castle.getOwner().getId(), cost)) {
            throw new IllegalStateException("Insufficient resources");
        }

        Building building = new Building();
        building.setBuildingType(buildingType);
        building.setLevel(1);
        building.setHp(buildingType.getBaseHp());
        building.setDefencePower(buildingType.getBaseDefencePower());

        building = buildingRepository.save(building);
        castle.getBuildings().add(building);
        castleRepository.save(castle);
        return building;
    }

    @Transactional
    public Troop addTroop(String castleId, String troopTypeId) {
        Castle castle = castleRepository.findById(castleId)
                .orElseThrow(() -> new IllegalArgumentException("Castle not found"));

        TroopType troopType = troopTypeRepository.findById(troopTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Troop type not found"));

        if (!castle.getBuildings().stream()
                .anyMatch(b -> b.getBuildingType().getAvailableTroops().contains(troopType))) {
            throw new IllegalStateException("No building available to train this troop type");
        }

        int cost = calculateTroopCost(troopType);
        if (!playerService.deductResources(castle.getOwner().getId(), cost)) {
            throw new IllegalStateException("Insufficient resources");
        }

        Troop troop = new Troop();
        troop.setTroopType(troopType);
        troop.setLevel(1);
        troop.setHp(troopType.getBaseHp());
        troop.setAttackPower(troopType.getBaseAttackPower());
        troop.setDefensePower(troopType.getBaseDefencePower());
        troop.setHpMod(1.0);
        troop.setApMod(1.0);
        troop.setDpMod(1.0);
        troop.setHostile(false);

        troop = troopRepository.save(troop);
        castle.getTroops().add(troop);
        castleRepository.save(castle);
        return troop;
    }

    @Transactional
    public Troop switchTroopPosition(String troopId) {
        Troop troop = troopRepository.findById(troopId)
                .orElseThrow(() -> new IllegalArgumentException("Troop not found"));

        troop.setPosition(troop.getPosition() == Troop.Position.FRONTLINE ?
                Troop.Position.BACKLINE : Troop.Position.FRONTLINE);

        return troopRepository.save(troop);
    }

    public Castle calculateCastleStats(String castleId) {
        Castle castle = castleRepository.findById(castleId)
                .orElseThrow(() -> new IllegalArgumentException("Castle not found"));

        int totalHealth = castle.getHealth() + castle.getBuildings().stream()
                .mapToInt(b -> b.getBuildingType().getCastleHPContribution())
                .sum();

        int threatLevel = castle.getBuildings().stream()
                .mapToInt(b -> b.getBuildingType().getThreatLevel())
                .sum();

        int tacticLevel = calculateTacticLevel(castle);

        castle.setHealth(totalHealth);
        castle.setThreatLevel(threatLevel);
        castle.setTacticLevel(tacticLevel);

        return castleRepository.save(castle);
    }

    private int calculateBuildingCost(BuildingType buildingType, int count) {
        return 100 * count; // Placeholder logic
    }

    private int calculateTroopCost(TroopType troopType) {
        return 50; // Placeholder logic
    }

    private int calculateTacticLevel(Castle castle) {
        return castle.getTroops().size() / 10 + castle.getBuildings().size() / 2;
    }
}