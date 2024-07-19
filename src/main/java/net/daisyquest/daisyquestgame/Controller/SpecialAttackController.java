package net.daisyquest.daisyquestgame.Controller;


import net.daisyquest.daisyquestgame.Model.SpecialAttack;
import net.daisyquest.daisyquestgame.Service.PlayerService;
import net.daisyquest.daisyquestgame.Service.SpecialAttackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/special-attacks")
public class SpecialAttackController {

    @Autowired
    private SpecialAttackService specialAttackService;

    @Autowired
    private PlayerService playerService;

    @GetMapping("/player/{playerId}")
    public ResponseEntity<List<SpecialAttack>> getPlayerSpecialAttacks(@PathVariable String playerId) {
        List<SpecialAttack> specialAttacks = specialAttackService.getSpecialAttacksForPlayer(playerId);
        return ResponseEntity.ok(specialAttacks);
    }
}