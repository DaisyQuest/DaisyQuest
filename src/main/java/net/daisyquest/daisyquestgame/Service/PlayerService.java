package net.daisyquest.daisyquestgame.Service;



import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Service.Initializer.PlayerInitializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlayerService {
    @Autowired
    private PlayerRepository playerRepository;

    public Player createPlayer(Player player) {


        PlayerInitializer.initPlayer(player);
        return playerRepository.save(player);
    }

    public Player getPlayer(String id) {
        return playerRepository.findById(id).orElse(null);
    }

    public Player getPlayerByUsername(String username) {
        return playerRepository.findByUsername(username);
    }

    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    public Player updatePlayer(Player player) {
        return playerRepository.save(player);
    }

    public void deletePlayer(String id) {
        playerRepository.deleteById(id);
    }
}