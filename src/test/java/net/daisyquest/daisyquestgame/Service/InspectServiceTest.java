package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.InspectResponse;
import net.daisyquest.daisyquestgame.Model.NPCTemplate;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InspectServiceTest {

    @Mock
    private PlayerRepository playerRepository;

    @Mock
    private NPCTemplateService npcTemplateService;

    @InjectMocks
    private InspectService inspectService;

    @Test
    void inspectPlayerReturnsTargetWhenInRange() {
        Player inspector = buildPlayer("inspector", 0, 0, null);
        Player target = buildPlayer("target", 50, 50, null);
        when(playerRepository.findById("inspector")).thenReturn(Optional.of(inspector));
        when(playerRepository.findById("target")).thenReturn(Optional.of(target));

        InspectResponse response = inspectService.inspectPlayer("inspector", "target");

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getPlayer()).isEqualTo(target);
    }

    @Test
    void inspectPlayerRejectsOutOfRangeTargets() {
        Player inspector = buildPlayer("inspector", 0, 0, null);
        Player target = buildPlayer("target", 250, 0, null);
        when(playerRepository.findById("inspector")).thenReturn(Optional.of(inspector));
        when(playerRepository.findById("target")).thenReturn(Optional.of(target));

        InspectResponse response = inspectService.inspectPlayer("inspector", "target");

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getMessage()).contains("too far");
    }

    @Test
    void inspectNpcReturnsTemplate() {
        Player inspector = buildPlayer("inspector", 0, 0, null);
        NPCTemplate template = new NPCTemplate();
        template.setId("npc-1");
        template.setName("Lumen Sage");
        when(playerRepository.findById("inspector")).thenReturn(Optional.of(inspector));
        when(npcTemplateService.getTemplateById("npc-1")).thenReturn(Optional.of(template));

        InspectResponse response = inspectService.inspectNpcTemplate("inspector", "npc-1");

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getNpcTemplate()).isEqualTo(template);
    }

    @Test
    void inspectNpcFailsWhenTemplateMissing() {
        Player inspector = buildPlayer("inspector", 0, 0, null);
        when(playerRepository.findById("inspector")).thenReturn(Optional.of(inspector));
        when(npcTemplateService.getTemplateById("npc-1")).thenReturn(Optional.empty());

        InspectResponse response = inspectService.inspectNpcTemplate("inspector", "npc-1");

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getMessage()).contains("not found");
    }

    private Player buildPlayer(String id, int x, int y, String submapId) {
        Player player = new Player();
        player.setId(id);
        player.setWorldPositionX(x);
        player.setWorldPositionY(y);
        player.setCurrentSubmapId(submapId);
        return player;
    }
}
