package net.daisyquest.daisyquestgame.Service;



import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SimulationService {

    @Autowired
    private CastleRepository castleRepository;
    @Autowired
    private TroopRepository troopRepository;

    @Autowired
    private BuildingRepository buildingRepository;
    @Autowired
    private TroopTypeRepository troopTypeRepository;

    @Autowired
    private Random random;

    @Scheduled(fixedRate = 60000) // Run every hour
    @Transactional
    public void runHourlySimulation() {
        List<Castle> castles = castleRepository.findAll();
        for (Castle castle : castles) {
            if (castle.getHealth() > 0) {
                simulateAttack(castle);
            }
        }
    }

    private void simulateAttack(Castle castle) {
        List<Troop> defendingTroops = new ArrayList<>(castle.getTroops());
        List<Troop> attackingTroops = generateAttackingTroops(castle.getThreatLevel());
        List<Troop> neutralTroops = generateNeutralTroops();

        SimulationLog log = new SimulationLog();
        log.setCastleId(castle.getId());
        log.setTimestamp(LocalDateTime.now());
        log.setInitialDefenderCount(defendingTroops.size());
        log.setInitialAttackerCount(attackingTroops.size());
        List<String> events = new ArrayList<>();

        while (!attackingTroops.isEmpty() && !defendingTroops.isEmpty()) {
            String roundResult = simulateBattleRound(attackingTroops, defendingTroops, neutralTroops, castle.getTacticLevel());
            events.add(roundResult);
        }

        boolean castleSurvived = !defendingTroops.isEmpty();
        if (!castleSurvived) {
            destroyBuildings(castle);
            events.add("Castle defenses breached. Some buildings destroyed.");
        }

        log.setEvents(events);
        log.setFinalDefenderCount(defendingTroops.size());
        log.setFinalAttackerCount(attackingTroops.size());
        log.setCastleSurvived(castleSurvived);

        int damageToCastle = calculateDamageToCastle(castle, attackingTroops.size());
        log.setDamageToCastle(damageToCastle);

        updateCastleAfterBattle(castle, defendingTroops, attackingTroops.size());

        saveSimulationLog(log);
    }

    private String simulateBattleRound(List<Troop> attackingTroops, List<Troop> defendingTroops, List<Troop> neutralTroops, int tacticLevel) {
        StringBuilder roundResult = new StringBuilder("Battle round: ");
        Collections.shuffle(attackingTroops);
        Collections.shuffle(defendingTroops);

        for (int i = 0; i < Math.min(attackingTroops.size(), defendingTroops.size()); i++) {
            Troop attacker = attackingTroops.get(i);
            Troop defender = findOptimalDefender(attacker, defendingTroops, tacticLevel);

            int initialDefenderHp = defender.getHp();
            int initialAttackerHp = attacker.getHp();
            resolveCombat(attacker, defender);

            roundResult.append(attacker.getTroopType().getName())
                    .append(" attacked ")
                    .append(defender.getTroopType().getName())
                    .append(", dealing ")
                    .append(initialDefenderHp - defender.getHp())
                    .append(" damage. ");
            if (defender.getHp() <= 0) {
                defendingTroops.remove(defender);
                roundResult.append("Defender defeated. ");
            }
            if (attacker.getHp() <= 0) {
                attackingTroops.remove(attacker);
                roundResult.append("Attacker defeated. ");
            }

            resolveCombat(defender, attacker);
            roundResult.append(defender.getTroopType().getName())
                    .append(" counteracted attacked ")
                    .append(attacker.getTroopType().getName())
                    .append(", dealing ")
                    .append(initialAttackerHp - attacker.getHp())
                    .append(" damage. ");

            if (defender.getHp() <= 0) {
                defendingTroops.remove(defender);
                roundResult.append("Defender defeated. ");
            }
            if (attacker.getHp() <= 0) {
                attackingTroops.remove(attacker);
                roundResult.append("Attacker defeated. ");
            }

        }

        handleNeutralTroops(neutralTroops, attackingTroops, defendingTroops);
        roundResult.append("Neutral troops intervened.");

        return roundResult.toString();
    }
    private Troop findOptimalDefender(Troop attacker, List<Troop> defenders, int tacticLevel) {
        if (random.nextInt(100) < tacticLevel) {
            return defenders.stream()
                    .max(Comparator.comparingDouble(defender ->
                            calculateDamageMultiplier(attacker, defender)))
                    .orElse(defenders.get(0));
        } else {
            return defenders.get(random.nextInt(defenders.size()));
        }
    }

    private void resolveCombat(Troop attacker, Troop defender) {
        double damageMultiplier = calculateDamageMultiplier(attacker, defender);
        int damage = (int) (attacker.getAttackPower() * damageMultiplier - defender.getDefensePower());
        damage = Math.max(1, damage); // Ensure at least 1 damage is dealt
        defender.setHp(defender.getHp() - damage);
    }

    private double calculateDamageMultiplier(Troop attacker, Troop defender) {
        double multiplier = 1.0;
        for (AttackType attackType : attacker.getTroopType().getAttackTypes()) {
            for (DefenseType defenseType : defender.getTroopType().getDefenseTypes()) {
              //  multiplier *= combatTypeMapping.getMultiplier(attackType.getId(), defenseType.getId());
            }
        }
        return 1;
    }

    private void handleNeutralTroops(List<Troop> neutralTroops, List<Troop> attackingTroops, List<Troop> defendingTroops) {
        for (Troop neutral : neutralTroops) {
            if (random.nextBoolean()) {
                if (!attackingTroops.isEmpty()) {
                    resolveCombat(neutral, attackingTroops.get(random.nextInt(attackingTroops.size())));
                }
            } else {
                if (!defendingTroops.isEmpty()) {
                    resolveCombat(neutral, defendingTroops.get(random.nextInt(defendingTroops.size())));
                }
            }
            neutralTroops.removeIf(t -> t.getHp() <= 0);
        }
    }

        private void destroyBuildings(Castle castle) {
            List<Building> destroyedBuildings = castle.getBuildings().stream()
                    .filter(b -> random.nextBoolean())
                    .collect(Collectors.toList());

            castle.getBuildings().removeAll(destroyedBuildings);
            buildingRepository.deleteAll(destroyedBuildings);
        }

    private void updateCastleAfterBattle(Castle castle, List<Troop> survivingTroops, int size) {
        castle.setTroops(survivingTroops);
        int damageToCastle = calculateDamageToCastle(castle, size);
        castle.setHealth(Math.max(0, castle.getHealth() - damageToCastle));
        castleRepository.save(castle);
    }

    private int calculateDamageToCastle(Castle castle, int defSize) {
        return 25 * defSize;
    }




    private List<Troop> generateAttackingTroops(int threatLevel) {
        List<Troop> attackingTroops = new ArrayList<>();
        List<TroopType> allTroopTypes = troopTypeRepository.findAll();
        Random random = new Random();

        // Determine number of troops based on threat level
        int numberOfTroops = threatLevel + random.nextInt(3); // threatLevel + 0 to 2

        for (int i = 0; i < numberOfTroops; i++) {
            TroopType randomTroopType = allTroopTypes.get(random.nextInt(allTroopTypes.size()));

            Troop troop = new Troop();
            troop.setTroopType(randomTroopType);
            troop.setLevel(1 + random.nextInt(threatLevel)); // Level 1 to threatLevel
            troop.setHp(calculateHP(randomTroopType.getBaseHp(), troop.getLevel()));
            troop.setAttackPower(calculateAttackPower(randomTroopType.getBaseAttackPower(), troop.getLevel()));
            troop.setDefensePower(calculateDefensePower(randomTroopType.getBaseDefencePower(), troop.getLevel()));
            troop.setHpMod(1.0);
            troop.setApMod(1.0);
            troop.setDpMod(1.0);
            troop.setHostile(true);
            troop.setNeutral(false);

            attackingTroops.add(troop);
        }

        return attackingTroops;
    }

    private int calculateHP(int baseHp, int level) {
        return baseHp + (level - 1) * 10; // Increase by 10 HP per level
    }

    private int calculateAttackPower(int baseAttackPower, int level) {
        return baseAttackPower + (level - 1) * 2; // Increase by 2 per level
    }

    private int calculateDefensePower(int baseDefensePower, int level) {
        return baseDefensePower + (level - 1) * 1; // Increase by 1 per level
    }

        private List<Troop> generateNeutralTroops() {
            // Logic to generate neutral troops
            return new ArrayList<>();
        }

        @Autowired
        private SimulationLogRepository simulationLogRepository;

        // ... other methods ...

        public Page<SimulationLog> getSimulationLogs(String castleId, int page, int size) {
            return simulationLogRepository.findByCastleId(castleId, PageRequest.of(page, size));
        }

        // Method to save simulation log after each simulation
        public void saveSimulationLog(SimulationLog log) {
            simulationLogRepository.save(log);
        }
    }
