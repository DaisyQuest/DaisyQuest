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
    private TroopTitleRepository troopTitleRepository;
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
        List<Building> buildings = new ArrayList<>(castle.getBuildings());

        SimulationLog log = new SimulationLog();
        log.setCastleId(castle.getId());
        log.setTimestamp(LocalDateTime.now());
        log.setInitialDefenderCount(defendingTroops.size());
        log.setInitialAttackerCount(attackingTroops.size());
        List<String> events = new ArrayList<>();

        while (!attackingTroops.isEmpty() && (!defendingTroops.isEmpty() || !buildings.isEmpty())) {
            String roundResult = simulateBattleRound(attackingTroops, defendingTroops, buildings, castle);
            events.add(roundResult);
        }

        boolean castleSurvived = !defendingTroops.isEmpty() || !buildings.isEmpty();
        if (!castleSurvived) {
            events.add("Castle defenses breached. All buildings and troops destroyed.");
        }

        log.setEvents(events);
        log.setFinalDefenderCount(defendingTroops.size());
        log.setFinalAttackerCount(attackingTroops.size());
        log.setCastleSurvived(castleSurvived);

        int damageToCastle = calculateDamageToCastle(castle, attackingTroops);
        log.setDamageToCastle(damageToCastle);

        updateCastleAfterBattle(castle, defendingTroops, buildings, attackingTroops);

        saveSimulationLog(log);
    }

    private String simulateBattleRound(List<Troop> attackingTroops, List<Troop> defendingTroops, List<Building> buildings, Castle castle) {
        StringBuilder roundResult = new StringBuilder("Battle round: ");

        // Attacking phase
        for (Troop attacker : attackingTroops) {
            Object target = selectTarget(defendingTroops, buildings);
            if (target instanceof Troop) {
                roundResult.append(resolveCombat(attacker, (Troop) target));
            } else if (target instanceof Building) {
                roundResult.append(attackBuilding(attacker, (Building) target));
            }
        }

        // Defending phase
        for (Troop defender : defendingTroops) {
            if (canDefend(defender)) {
                Troop target = selectRandomAttacker(attackingTroops);
                if (target != null) {
                    roundResult.append(resolveCombat(defender, target));
                }
            }
        }

        // Remove defeated troops and destroyed buildings
        attackingTroops.removeIf(t -> t.getHp() <= 0);
        defendingTroops.removeIf(t -> t.getHp() <= 0);
        buildings.removeIf(b -> b.getHp() <= 0);

        return roundResult.toString();
    }

    private Object selectTarget(List<Troop> defendingTroops, List<Building> buildings) {
        List<Troop> frontlineTroops = defendingTroops.stream()
                .filter(t -> t.getPosition() == Troop.Position.FRONTLINE)
                .collect(Collectors.toList());

        if (!frontlineTroops.isEmpty()) {
            return frontlineTroops.get(random.nextInt(frontlineTroops.size()));
        } else if (!buildings.isEmpty()) {
            return buildings.get(random.nextInt(buildings.size()));
        } else {
            List<Troop> backlineTroops = defendingTroops.stream()
                    .filter(t -> t.getPosition() == Troop.Position.BACKLINE)
                    .collect(Collectors.toList());
            return backlineTroops.isEmpty() ? null : backlineTroops.get(random.nextInt(backlineTroops.size()));
        }
    }

    private boolean canDefend(Troop defender) {
        return defender.getPosition() == Troop.Position.FRONTLINE ||
                (defender.getPosition() == Troop.Position.BACKLINE && defender.getTroopType().getAttackRange() > 1);
    }

    private Troop selectRandomAttacker(List<Troop> attackingTroops) {
        return attackingTroops.isEmpty() ? null : attackingTroops.get(random.nextInt(attackingTroops.size()));
    }

    private String resolveCombat(Troop attacker, Troop defender) {
        double damageMultiplier = calculateDamageMultiplier(attacker, defender);
        int damage = (int) (attacker.getAttackPower() * damageMultiplier - defender.getDefensePower());
        damage = Math.max(1, damage); // Ensure at least 1 damage is dealt
        defender.setHp(defender.getHp() - damage);

        StringBuilder result = new StringBuilder();
        result.append(attacker.getPosition() == Troop.Position.ATTACKING ? "[ATTACKERS] " : "[CASTLE] ")
                .append(attacker.getTroopType().getName())
                .append(" attacked ")
                .append(defender.getPosition() == Troop.Position.ATTACKING ? "[ATTACKERS] " : "[CASTLE] ")
                .append(defender.getTroopType().getName())
                .append(", dealing <b>")
                .append(damage)
                .append("</b> damage. ")
                .append("<br>");

        if (defender.getHp() <= 0) {
            result.append(defender.getTroopType().getName())
                    .append(" was defeated. ").append("<br>");
            handleTroopDefeat(attacker, defender, result);
        }

        return result.toString();
    }

    private String attackBuilding(Troop attacker, Building building) {
        int damage = Math.max(1, attacker.getAttackPower() - building.getDefencePower());
        building.setHp(building.getHp() - damage);

        StringBuilder result = new StringBuilder();
        result.append(attacker.getTroopType().getName())
                .append(" attacked ")
                .append(building.getBuildingType().getName())
                .append(", dealing ")
                .append(damage)
                .append(" damage. ");

        if (building.getHp() <= 0) {
            result.append(building.getBuildingType().getName())
                    .append(" was destroyed. ");
        }

        return result.toString();
    }
//    private String simulateBattleRound(List<Troop> attackingTroops, List<Troop> defendingTroops, List<Troop> neutralTroops, int tacticLevel) {
//        StringBuilder roundResult = new StringBuilder("Battle round: ");
//        Collections.shuffle(attackingTroops);
//        Collections.shuffle(defendingTroops);
//
//        for (int i = 0; i < Math.min(attackingTroops.size(), defendingTroops.size()); i++) {
//            Troop attacker = attackingTroops.get(i);
//            Troop defender = findOptimalDefender(attacker, defendingTroops, tacticLevel);
//
//            int initialDefenderHp = defender.getHp();
//            int initialAttackerHp = attacker.getHp();
//            resolveCombat(attacker, defender);
//
//            roundResult.append(attacker.getTroopType().getName())
//                    .append(" attacked ")
//                    .append(defender.getTroopType().getName())
//                    .append(", dealing ")
//                    .append(initialDefenderHp - defender.getHp())
//                    .append(" damage. ");
//            if (defender.getHp() <= 0) {
//                defendingTroops.remove(defender);
//                roundResult.append("Defender defeated. ");
//            }
//            if (attacker.getHp() <= 0) {
//                attackingTroops.remove(attacker);
//                roundResult.append("Attacker defeated. ");
//            }
//
//            resolveCombat(defender, attacker);
//            roundResult.append(defender.getTroopType().getName())
//                    .append(" counteracted attacked ")
//                    .append(attacker.getTroopType().getName())
//                    .append(", dealing ")
//                    .append(initialAttackerHp - attacker.getHp())
//                    .append(" damage. ");
//
//            if (defender.getHp() <= 0) {
//                defendingTroops.remove(defender);
//                roundResult.append("Defender defeated. ");
//            }
//            if (attacker.getHp() <= 0) {
//                attackingTroops.remove(attacker);
//                roundResult.append("Attacker defeated. ");
//            }
//
//        }
//
//        handleNeutralTroops(neutralTroops, attackingTroops, defendingTroops);
//        roundResult.append("Neutral troops intervened.");
//
//        return roundResult.toString();
//    }
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

    private void handleTroopDefeat(Troop victor, Troop defeated, StringBuilder result) {
        int expGain = defeated.getTroopType().getExperienceValue();

       result.append(victor.getTroopType().getName() + "("+ victor.getId()+")")
               .append(" has gained ").append(expGain).append(" experience!").append("<br>");
        victor.setExperience(victor.getExperience() + expGain);
        victor.setKillCount(victor.getKillCount() + 1);
        checkLevelUp(victor, result);
        updateTroopTitle(victor, result);
    }

    private void checkLevelUp(Troop troop, StringBuilder result) {
        int experienceNeededForNextLevel = calculateExperienceNeededForNextLevel(troop.getLevel());
        while (troop.getExperience() >= experienceNeededForNextLevel) {
            troop.setLevel(troop.getLevel() + 1);
            troop.setHp(calculateHP(troop.getTroopType().getBaseHp(), troop.getLevel()));
            troop.setAttackPower(calculateAttackPower(troop.getTroopType().getBaseAttackPower(), troop.getLevel()));
            troop.setDefensePower(calculateDefensePower(troop.getTroopType().getBaseDefencePower(), troop.getLevel()));
            experienceNeededForNextLevel = calculateExperienceNeededForNextLevel(troop.getLevel());
        }
    }

    private int calculateExperienceNeededForNextLevel(int currentLevel) {
        // This is a simple linear progression. Adjust as needed for your game balance.
        return currentLevel * 100;
    }

    private void updateTroopTitle(Troop troop, StringBuilder result) {
        List<TroopTitle> titles = troopTitleRepository.findAllByOrderByMinKillCountAsc();
        for (int i = titles.size() - 1; i >= 0; i--) {
            if (troop.getKillCount() >= titles.get(i).getMinKillCount()) {
                troop.setTitle(titles.get(i).getTitle());
                break;
            }
        }
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

    private void updateCastleAfterBattle(Castle castle, List<Troop> survivingTroops, List<Building> survivingBuildings, List<Troop> survivingAttackers) {
        castle.setTroops(survivingTroops);
        castle.setBuildings(survivingBuildings);
        int damageToCastle = calculateDamageToCastle(castle, survivingAttackers);
        castle.setHealth(Math.max(0, castle.getHealth() - damageToCastle));
        castleRepository.save(castle);
    }

    private int calculateDamageToCastle(Castle castle, List<Troop> attackers) {
        if (attackers == null || attackers.isEmpty()) {
            return 0;
        }
        return attackers.stream()
                .mapToInt(Troop::getAttackPower)
                .sum();
    }





    private List<Troop> generateAttackingTroops(int threatLevel) {
        List<Troop> attackingTroops = new ArrayList<>();
        List<TroopType> allTroopTypes = troopTypeRepository.findAll();
        Random random = new Random();

        // Determine number of troops based on threat level
        int numberOfTroops = threatLevel * 2 + random.nextInt(3); // threatLevel + 0 to 2

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
            troop.setPosition(Troop.Position.ATTACKING);

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
