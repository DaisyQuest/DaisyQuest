package net.daisyquest.daisyquestgame.Controller.View;

import net.daisyquest.daisyquestgame.Model.Castle;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Service.CastleService;
import net.daisyquest.daisyquestgame.Service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.security.Principal;

@Controller
public class CastleViewController {

    @Autowired
    private PlayerService playerService;

    @Autowired
    private CastleService castleService;

    @GetMapping("/castle")
    public String castleView(Model model, Principal principal) {
        Player player = playerService.getPlayerByUsername(principal.getName());
        Castle castle = castleService.getCastleByOwnerId(player.getId());

        if (castle == null) {
            return "redirect:/create-castle"; // Redirect to castle creation if player doesn't have one
        }

        model.addAttribute("castleId", castle.getId());
        return "castle-view"; // This should be the name of your HTML template
    }
}