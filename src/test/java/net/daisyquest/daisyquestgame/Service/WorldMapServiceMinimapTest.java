package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Repository.SubmapRepository;
import net.daisyquest.daisyquestgame.Repository.WorldMapRepository;
import net.daisyquest.daisyquestgame.Repository.WorldObjectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorldMapServiceMinimapTest {

    @Mock
    private WorldMapRepository worldMapRepository;

    @Mock
    private PlayerRepository playerRepository;

    @Mock
    private WorldObjectRepository worldObjectRepository;

    @Mock
    private SubmapRepository submapRepository;

    @InjectMocks
    private WorldMapService worldMapService;

    @Test
    void getMinimapData_zeroRadius_filtersToExactPosition() {
        Player player = new Player();
        player.setId("player-1");
        player.setUsername("Hero");
        player.setWorldPositionX(50);
        player.setWorldPositionY(50);

        Player otherPlayer = new Player();
        otherPlayer.setId("player-2");
        otherPlayer.setUsername("Wanderer");
        otherPlayer.setWorldPositionX(55);
        otherPlayer.setWorldPositionY(50);

        WorldMap worldMap = new WorldMap();
        worldMap.setWidth(1);
        worldMap.setHeight(1);

        WorldObject objectAtCenter = new WorldObject();
        objectAtCenter.setId("obj-center");
        objectAtCenter.setXPos(50);
        objectAtCenter.setYPos(50);

        WorldObject objectOutside = new WorldObject();
        objectOutside.setId("obj-outside");
        objectOutside.setXPos(51);
        objectOutside.setYPos(50);

        when(playerRepository.findById("player-1")).thenReturn(Optional.of(player));
        when(worldMapRepository.findAll()).thenReturn(List.of(worldMap));
        when(playerRepository.findByWorldPositionXBetweenAndWorldPositionYBetween(50, 50, 50, 50))
                .thenReturn(List.of(player, otherPlayer));
        when(worldObjectRepository.findByxPosBetweenAndyPosBetween(50, 50, 50, 50))
                .thenReturn(List.of(objectAtCenter, objectOutside));

        MinimapResponse response = worldMapService.getMinimapData("player-1", 0);

        assertThat(response.getRadius()).isZero();
        assertThat(response.getEntries())
                .extracting(MinimapEntry::getId)
                .containsExactlyInAnyOrder("player-1", "obj-center");
    }

    @Test
    void getMinimapData_worldMapBounds_clampedAtZero() {
        Player player = new Player();
        player.setId("player-1");
        player.setUsername("Hero");
        player.setWorldPositionX(0);
        player.setWorldPositionY(0);

        WorldMap worldMap = new WorldMap();
        worldMap.setWidth(1);
        worldMap.setHeight(1);

        when(playerRepository.findById("player-1")).thenReturn(Optional.of(player));
        when(worldMapRepository.findAll()).thenReturn(List.of(worldMap));
        when(playerRepository.findByWorldPositionXBetweenAndWorldPositionYBetween(anyInt(), anyInt(), anyInt(), anyInt()))
                .thenReturn(List.of(player));
        when(worldObjectRepository.findByxPosBetweenAndyPosBetween(anyInt(), anyInt(), anyInt(), anyInt()))
                .thenReturn(List.of());

        worldMapService.getMinimapData("player-1", 250);

        ArgumentCaptor<Integer> minX = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<Integer> maxX = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<Integer> minY = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<Integer> maxY = ArgumentCaptor.forClass(Integer.class);
        verify(playerRepository).findByWorldPositionXBetweenAndWorldPositionYBetween(
                minX.capture(), maxX.capture(), minY.capture(), maxY.capture());
        assertThat(minX.getValue()).isZero();
        assertThat(minY.getValue()).isZero();
        assertThat(maxX.getValue()).isEqualTo(250);
        assertThat(maxY.getValue()).isEqualTo(250);
    }

    @Test
    void getMinimapData_submapBounds_clampedToSubmapSize() {
        Player player = new Player();
        player.setId("player-1");
        player.setUsername("Hero");
        player.setCurrentSubmapId("sub-1");
        player.setSubmapCoordinateX(9);
        player.setSubmapCoordinateY(9);

        Player submapPeer = new Player();
        submapPeer.setId("player-2");
        submapPeer.setUsername("Scout");
        submapPeer.setCurrentSubmapId("sub-1");
        submapPeer.setSubmapCoordinateX(9);
        submapPeer.setSubmapCoordinateY(9);

        Submap submap = new Submap();
        submap.setId("sub-1");
        submap.setWidth(10);
        submap.setHeight(10);

        WorldObject submapObject = new WorldObject();
        submapObject.setId("obj-sub");
        submapObject.setSubmapId("sub-1");
        submapObject.setXPos(9);
        submapObject.setYPos(9);

        when(playerRepository.findById("player-1")).thenReturn(Optional.of(player));
        when(submapRepository.findById("sub-1")).thenReturn(Optional.of(submap));
        when(playerRepository.findByCurrentSubmapId("sub-1")).thenReturn(List.of(player, submapPeer));
        when(worldObjectRepository.findBySubmapIdAndXPosBetweenAndYPosBetween("sub-1", 0, 9, 0, 9))
                .thenReturn(List.of(submapObject));

        MinimapResponse response = worldMapService.getMinimapData("player-1", 250);

        assertThat(response.isInSubmap()).isTrue();
        assertThat(response.getEntries())
                .extracting(MinimapEntry::getId)
                .contains("player-1", "player-2", "obj-sub");
    }
}
