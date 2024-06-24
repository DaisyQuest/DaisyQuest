package net.daisyquest.daisyquestgame;



import net.daisyquest.daisyquestgame.Model.Activity;
import net.daisyquest.daisyquestgame.Model.Attribute;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.Quest;
import net.daisyquest.daisyquestgame.Service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class IntegrationTests {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private PlayerService playerService;

    @Autowired
    private ItemService itemService;

    @Autowired
    private ActivityService activityService;

    @Autowired
    private QuestService questService;

    @Autowired
    private PlayerProgressionService playerProgressionService;

    @Test
    public void testPlayerCRUD() {
        Player player = new Player();
        player.setUsername("testUser");

        // Create
        ResponseEntity<Player> createResponse = restTemplate.postForEntity("/api/players", player, Player.class);
        assertEquals(HttpStatus.OK, createResponse.getStatusCode());
        assertNotNull(createResponse.getBody().getId());

        String playerId = createResponse.getBody().getId();

        // Read
        ResponseEntity<Player> getResponse = restTemplate.getForEntity("/api/players/" + playerId, Player.class);
        assertEquals(HttpStatus.OK, getResponse.getStatusCode());
        assertEquals("testUser", getResponse.getBody().getUsername());

        // Update
        player.setUsername("updatedUser");
        restTemplate.put("/api/players/" + playerId, player);

        getResponse = restTemplate.getForEntity("/api/players/" + playerId, Player.class);
        assertEquals("updatedUser", getResponse.getBody().getUsername());

        // Delete
        restTemplate.delete("/api/players/" + playerId);

        getResponse = restTemplate.getForEntity("/api/players/" + playerId, Player.class);
        assertEquals(HttpStatus.NOT_FOUND, getResponse.getStatusCode());
    }

    @Test
    public void testActivityExecution() {
        // Create a player
        Player player = new Player();
        player.setUsername("activityTestUser");
        player.setAttributes(new HashMap<>());
        player.getAttributes().put("strength", new Attribute("strength", 1, 0));
        player = playerService.createPlayer(player);

        // Create an activity
        Activity activity = new Activity();
        activity.setName("strength");
        activity.setDuration(60);
        activity.setHandlerClass("SimpleActivityHandler");
        activity = activityService.createActivity(activity);

        // Execute the activity
        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/activities/" + activity.getId() + "/execute?playerId=" + player.getId(),
                null,
                String.class
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());

        // Check if player's strength increased
        Player updatedPlayer = playerService.getPlayer(player.getId());
        assertTrue(updatedPlayer.getAttributes().get("strength").getExperience() > 0);
    }

    @Test
    public void testQuestCompletion() {
        // Create a player
        Player player = new Player();
        player.setUsername("questTestUser");
        player.setAttributes(new HashMap<>());
        player.getAttributes().put("strength", new Attribute("strength", 5, 0));
        player.setCompletedQuests(new HashSet<>());
        player = playerService.createPlayer(player);

        // Create a quest
        Quest quest = new Quest();
        quest.setName("Strength Quest");
        quest.setDescription("Test your strength");
        quest.setRequirements(new HashMap<>());
        quest.getRequirements().put("strength", 5);
        quest.setRewards(new HashMap<>());
        quest.getRewards().put("strength", 50);
        quest.setExperienceReward(100);
        quest = questService.createQuest(quest);

        // Complete the quest
        boolean completed = playerProgressionService.completeQuest(player, quest.getId());
        assertTrue(completed);

        // Check if player's strength and experience increased
        Player updatedPlayer = playerService.getPlayer(player.getId());
        assertTrue(updatedPlayer.getAttributes().get("strength").getExperience() > 0);
        assertTrue(updatedPlayer.getTotalExperience() > 0);
        assertTrue(updatedPlayer.getCompletedQuests().contains(quest.getId()));
    }
}