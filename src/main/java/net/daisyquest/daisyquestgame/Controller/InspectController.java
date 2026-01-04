package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.ErrorResponse;
import net.daisyquest.daisyquestgame.Model.InspectRequest;
import net.daisyquest.daisyquestgame.Model.InspectResponse;
import net.daisyquest.daisyquestgame.Service.InspectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inspect")
public class InspectController {

    @Autowired
    private InspectService inspectService;

    @PostMapping("/player")
    public ResponseEntity<?> inspectPlayer(@RequestBody InspectRequest request) {
        InspectResponse response = inspectService.inspectPlayer(request.getInspectorId(), request.getTargetId());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new ErrorResponse(response.getMessage()));
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/npc")
    public ResponseEntity<?> inspectNpc(@RequestBody InspectRequest request) {
        InspectResponse response = inspectService.inspectNpcTemplate(request.getInspectorId(), request.getTargetId());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(new ErrorResponse(response.getMessage()));
        }
        return ResponseEntity.ok(response);
    }
}
