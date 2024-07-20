package net.daisyquest.daisyquestgame.Controller;



import net.daisyquest.daisyquestgame.Model.NPCEncampment;
import net.daisyquest.daisyquestgame.Service.NPCEncampmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/npc-encampments")
public class NPCEncampmentController {

    @Autowired
    private NPCEncampmentService npcEncampmentService;

    @GetMapping
    public ResponseEntity<List<NPCEncampment>> getAllEncampments() {
        List<NPCEncampment> encampments = npcEncampmentService.getAllEncampments();
        return ResponseEntity.ok(encampments);
    }

    @GetMapping("/viewport")
    public ResponseEntity<List<NPCEncampment>> getEncampmentsInViewport(
            @RequestParam int centerX,
            @RequestParam int centerY,
            @RequestParam int viewportWidth,
            @RequestParam int viewportHeight) {
        List<NPCEncampment> encampments = npcEncampmentService.getEncampmentsInViewport(centerX, centerY, viewportWidth, viewportHeight);
        return ResponseEntity.ok(encampments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NPCEncampment> getEncampmentById(@PathVariable String id) {
        NPCEncampment encampment = npcEncampmentService.getEncampmentById(id);
        if (encampment != null) {
            return ResponseEntity.ok(encampment);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

