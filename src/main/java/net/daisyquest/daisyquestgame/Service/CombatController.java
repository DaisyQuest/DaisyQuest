package net.daisyquest.daisyquestgame.Service;


import net.daisyquest.daisyquestgame.Model.Combat;
import net.daisyquest.daisyquestgame.Model.Action;
import net.daisyquest.daisyquestgame.Service.CombatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/combat")
public class CombatController {

    @Autowired
    private CombatService combatService;

    @PostMapping("/start")
    public ResponseEntity<Combat> startCombat(@RequestBody Map<String, Object> request) {
        List<String> playerIds = (List<String>) request.get("playerIds");
        Map<String, String> playerTeams = (Map<String, String>) request.get("playerTeams");
        Combat combat = combatService.startCombat(playerIds, playerTeams);
        return ResponseEntity.ok(combat);
    }

    @GetMapping("/{combatId}")
    public ResponseEntity<Combat> getCombat(@PathVariable String combatId) {
        Combat combat = combatService.getCombat(combatId);
        if (combat != null) {
            return ResponseEntity.ok(combat);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{combatId}/action")
    public ResponseEntity<Combat> performAction(@PathVariable String combatId, @RequestBody Action action) {
        try {
            Combat updatedCombat = combatService.performAction(combatId, action);
            return ResponseEntity.ok(updatedCombat);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
