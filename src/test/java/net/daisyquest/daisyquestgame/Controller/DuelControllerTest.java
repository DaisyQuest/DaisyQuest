package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Service.CombatService;
import net.daisyquest.daisyquestgame.Service.ItemService;
import net.daisyquest.daisyquestgame.Service.PlayerService;
import net.daisyquest.daisyquestgame.Service.SubmapService;
import net.daisyquest.daisyquestgame.Service.WebSocketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DuelController.class)
class DuelControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PlayerService playerService;

    @MockBean
    private ItemService itemService;

    @MockBean
    private CombatService combatService;

    @MockBean
    private WebSocketService webSocketService;

    @MockBean
    private SubmapService submapService;

    @Test
    void npcDuelRequestsNoLongerAutoStartCombat() throws Exception {
        Player challenger = buildPlayer("player-1", "Hero", false, 0, 0);
        Player target = buildPlayer("npc-1", "Goblin", true, 10, 0);

        when(playerService.getPlayer(challenger.getId())).thenReturn(challenger);
        when(playerService.getPlayer(target.getId())).thenReturn(target);

        mockMvc.perform(post("/api/duel/request")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                        "\"challengerId\":\"" + challenger.getId() + "\"," +
                        "\"targetId\":\"" + target.getId() + "\"" +
                        "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("NPC duels no longer auto-start")))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString(target.getUsername())));

        verifyNoInteractions(combatService);
        verifyNoInteractions(webSocketService);
    }

    @Test
    void playerDuelRequestSendsWebSocketNotification() throws Exception {
        Player challenger = buildPlayer("player-1", "Hero", false, 0, 0);
        Player target = buildPlayer("player-2", "Rival", false, 10, 0);

        when(playerService.getPlayer(challenger.getId())).thenReturn(challenger);
        when(playerService.getPlayer(target.getId())).thenReturn(target);

        mockMvc.perform(post("/api/duel/request")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                        "\"challengerId\":\"" + challenger.getId() + "\"," +
                        "\"targetId\":\"" + target.getId() + "\"" +
                        "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Duel request sent"));

        verify(webSocketService).sendDuelRequest(target.getId(), challenger.getId());
        verifyNoInteractions(combatService);
    }

    @Test
    void duelRequestFailsWhenPlayersAreTooFarApart() throws Exception {
        Player challenger = buildPlayer("player-1", "Hero", false, 0, 0);
        Player target = buildPlayer("player-2", "Rival", false, 500, 0);

        when(playerService.getPlayer(challenger.getId())).thenReturn(challenger);
        when(playerService.getPlayer(target.getId())).thenReturn(target);

        mockMvc.perform(post("/api/duel/request")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" +
                        "\"challengerId\":\"" + challenger.getId() + "\"," +
                        "\"targetId\":\"" + target.getId() + "\"" +
                        "}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Players are too far apart"));

        verifyNoInteractions(combatService);
        verifyNoInteractions(webSocketService);
    }

    private Player buildPlayer(String id, String username, boolean isNpc, int x, int y) {
        Player player = new Player();
        player.setId(id);
        player.setUsername(username);
        player.setNPC(isNpc);
        player.setWorldPositionX(x);
        player.setWorldPositionY(y);
        player.setDuelable(true);
        return player;
    }
}
