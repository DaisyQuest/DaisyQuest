package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Repository.SubmapRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SubmapService {

    @Autowired
    private SubmapRepository submapRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private WorldMapService worldMapService;

    public Submap getSubmapById(String submapId) {
        return submapRepository.findById(submapId)
                .orElseThrow(() -> new IllegalArgumentException("Submap not found with id: " + submapId));
    }
    @Transactional
    public Player movePlayerInSubmap(String submapId, String playerId, int x, int y) {
        Submap submap = submapRepository.findById(submapId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid submap ID"));

        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid player ID"));

        // Check if the player is in the correct submap
        if (!submapId.equals(player.getCurrentSubmapId())) {
            throw new IllegalArgumentException("Player is not in the specified submap");
        }

        // Check if the new position is within the submap boundaries
        if (x < 0 || x >= submap.getWidth() || y < 0 || y >= submap.getHeight()) {
            throw new IllegalArgumentException("New position is out of submap boundaries");
        }

        // Update player's position in the submap
        player.setSubmapCoordinateX(x);
        player.setSubmapCoordinateY(y);

        // Save and return the updated player
        return playerRepository.save(player);
    }

    public List<Submap> getAllSubmaps() {
        return submapRepository.findAll();
    }

    @Transactional
    public Submap createSubmap(Submap submap) {
        // Perform any necessary validation or preprocessing
        return submapRepository.save(submap);
    }

    @Transactional
    public Submap updateSubmap(Submap submap) {
        if (!submapRepository.existsById(submap.getId())) {
            throw new IllegalArgumentException("Submap not found with id: " + submap.getId());
        }
        return submapRepository.save(submap);
    }

    @Transactional
    public void deleteSubmap(String submapId) {
        submapRepository.deleteById(submapId);
    }

    @Transactional
    public Player movePlayerToSubmap(String playerId, String submapId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found with id: " + playerId));
        Submap submap = getSubmapById(submapId);
        // Set the player's position in the submap
        player.setCurrentSubmapId(submapId);
        player.setSubmapCoordinateX(submap.getStartXCoordinate()); // Set default or calculated position
        player.setSubmapCoordinateY(submap.getStartYCoordinate());
        player.setSubmapCoordinateZ(submap.getStartZCoodinate());

        return playerRepository.save(player);
    }

    @Transactional
    public Player returnPlayerToOverworld(String playerId, String submapId, boolean returnToPlayerHome, boolean returnToSpawn) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found with id: " + playerId));

        if (!player.getCurrentSubmapId().equals(submapId)) {
            throw new IllegalStateException("Player is not in the specified submap");
        }

        // Determine the return position
        if (returnToPlayerHome) {
            // Logic to return to player's home
            // This might involve looking up the player's home coordinates
            //todo: address the concept of a player home location
            player.setWorldPositionX(10000);
            player.setWorldPositionY(10000);
        } else if (returnToSpawn) {
            // Logic to return to spawn point
            WorldMap worldMap = worldMapService.getWorldMap();

            //todo: fix spawn
            player.setWorldPositionX(10000);
            player.setWorldPositionY(10000);
        } else {
            // Return to previous overworld position
            player.setWorldPositionX(player.getWorldPositionX());
            player.setWorldPositionY(player.getWorldPositionY());
        }

        // Clear submap-related data
        player.setCurrentSubmapId(null);
        player.setSubmapCoordinateX(-1);
        player.setSubmapCoordinateY(-1);
        player.setSubmapCoordinateZ(-1);

        return playerRepository.save(player);
    }

    public boolean isPlayerInSubmap(String playerId) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new IllegalArgumentException("Player not found with id: " + playerId));
        return player.getCurrentSubmapId() != null;
    }

    public List<Player> getPlayersInSubmap(String submapId) {
        return playerRepository.findByCurrentSubmapId(submapId);
    }

    // Add more methods as needed for submap-related operations
}