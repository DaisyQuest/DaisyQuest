package net.daisyquest.daisyquestgame.Activity;


import net.daisyquest.daisyquestgame.Model.Activity;
import net.daisyquest.daisyquestgame.Model.NPC;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Service.NPCService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class CombatHandler implements ActivityHandler {

    @Autowired
    private NPCService npcService;

    private Random random = new Random();

    @Override
    public void handleActivity(Player player, Activity activity) {
        // Assuming the activity.getHandlerClass() returns "PvE" or "PvP"
//        if ("PvE".equals(activity.getHandlerClass())) {
//            handlePvECombat(player, activity);
//        } else if ("PvP".equals(activity.getHandlerClass())) {
//            // For simplicity, we'll just simulate PvP combat here
//            simulatePvPCombat(player);
//        }
    }

    private void handlePvECombat(Player player, Activity activity) {
        // For simplicity, we'll create a random NPC to fight against
        NPC npc = createRandomNPC();

        int playerHealth = calculateTotalHealth(player);
        int npcHealth = calculateTotalHealth(npc);

        while (playerHealth > 0 && npcHealth > 0) {
            // Player's turn
            int playerDamage = calculateDamage(player);
            npcHealth -= playerDamage;

            if (npcHealth <= 0) break;

            // NPC's turn
            int npcDamage = calculateDamage(npc);
            playerHealth -= npcDamage;
        }

        if (playerHealth > 0) {
            // Player won
            rewardPlayer(player, npc);
        } else {
            // Player lost
            penalizePlayer(player);
        }
    }

    private void simulatePvPCombat(Player player) {
        // Simulate PvP combat by giving random rewards or penalties
        if (random.nextBoolean()) {
            player.getAttributes().get("combat").setExperience(
                    player.getAttributes().get("combat").getExperience() + 20
            );
        } else {
            penalizePlayer(player);
        }
    }

    private NPC createRandomNPC() {
        NPC npc = new NPC();
        npc.setName("Random Enemy");
        npc.getAttributes().put("health", random.nextInt(50) + 50);
        npc.getAttributes().put("attack", random.nextInt(10) + 5);
        npc.getAttributes().put("defense", random.nextInt(10) + 5);
        return npc;
    }

    private int calculateTotalHealth(Player player) {
        return player.getAttributes().get("health").getLevel() * 10;
    }

    private int calculateTotalHealth(NPC npc) {
        return npc.getAttributes().get("health");
    }

    private int calculateDamage(Player player) {
        int attack = player.getAttributes().get("attack").getLevel();
        return random.nextInt(attack) + 1;
    }

    private int calculateDamage(NPC npc) {
        int attack = npc.getAttributes().get("attack");
        return random.nextInt(attack) + 1;
    }

    private void rewardPlayer(Player player, NPC npc) {
        int experienceGain = npc.getAttributes().get("health") / 10;
        player.getAttributes().get("combat").setExperience(
                player.getAttributes().get("combat").getExperience() + experienceGain
        );
        // Add loot to player's inventory
        player.getInventory().addAll(npc.getLoot());
    }

    private void penalizePlayer(Player player) {
        // Implement penalty logic, e.g., lose some items or experience
        if (!player.getInventory().isEmpty()) {
            player.getInventory().remove(random.nextInt(player.getInventory().size()));
        }
    }
}