package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.ActiveInteraction;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.WorldMap;
import net.daisyquest.daisyquestgame.Repository.ActiveInteractionRepository;
import net.daisyquest.daisyquestgame.Repository.ItemRepository;
import net.daisyquest.daisyquestgame.Repository.LandRepository;
import net.daisyquest.daisyquestgame.Repository.MapItemRepository;
import net.daisyquest.daisyquestgame.Repository.PlayerInventoryRepository;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Repository.SubmapRepository;
import net.daisyquest.daisyquestgame.Repository.WorldMapRepository;
import net.daisyquest.daisyquestgame.Repository.WorldObjectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorldMapServiceTest {

    @Mock
    private WorldMapRepository worldMapRepository;
    @Mock
    private LandRepository landRepository;
    @Mock
    private PlayerInventoryRepository playerInventoryRepository;
    @Mock
    private SubmapRepository submapRepository;
    @Mock
    private ItemRepository itemService;
    @Mock
    private PlayerRepository playerRepository;
    @Mock
    private MapItemRepository mapItemRepository;
    @Mock
    private WorldObjectRepository worldObjectRepository;
    @Mock
    private ActiveInteractionRepository activeInteractionRepository;
    @Mock
    private PlayerService playerService;

    @InjectMocks
    private WorldMapService worldMapService;

    @Test
    void movePlayerRejectsPositionsOutsidePixelBounds() {
        WorldMap worldMap = new WorldMap();
        worldMap.setWidth(2);
        worldMap.setHeight(2);
        when(worldMapRepository.findAll()).thenReturn(List.of(worldMap));

        Player player = new Player();
        player.setId("player-1");
        player.setWorldPositionX(10000);
        player.setWorldPositionY(10000);
        when(playerRepository.findById("player-1")).thenReturn(java.util.Optional.of(player));
        when(activeInteractionRepository.findByPlayerIdAndStatus(
                "player-1", ActiveInteraction.InteractionStatus.IN_PROGRESS))
                .thenReturn(Optional.empty());

        int outsideX = WorldMapService.LAND_SIZE * worldMap.getWidth();
        when(worldObjectRepository.findByXPosAndYPos(outsideX, 0)).thenReturn(List.of());

        assertThatThrownBy(() -> worldMapService.movePlayer("player-1", outsideX, 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Position outside map bounds");
    }

    @Test
    void movePlayerRejectsNegativeCoordinates() {
        WorldMap worldMap = new WorldMap();
        worldMap.setWidth(2);
        worldMap.setHeight(2);
        when(worldMapRepository.findAll()).thenReturn(List.of(worldMap));

        Player player = new Player();
        player.setId("player-1");
        player.setWorldPositionX(10000);
        player.setWorldPositionY(10000);
        when(playerRepository.findById("player-1")).thenReturn(java.util.Optional.of(player));
        when(activeInteractionRepository.findByPlayerIdAndStatus(
                "player-1", ActiveInteraction.InteractionStatus.IN_PROGRESS))
                .thenReturn(Optional.empty());
        when(worldObjectRepository.findByXPosAndYPos(-1, 0)).thenReturn(List.of());

        assertThatThrownBy(() -> worldMapService.movePlayer("player-1", -1, 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Position outside map bounds");
    }
}
