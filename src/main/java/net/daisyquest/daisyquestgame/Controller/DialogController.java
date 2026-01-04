package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.DialogPayload;
import net.daisyquest.daisyquestgame.Model.DialogRequest;
import net.daisyquest.daisyquestgame.Model.ErrorResponse;
import net.daisyquest.daisyquestgame.Service.DialogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dialogs")
public class DialogController {

    @Autowired
    private DialogService dialogService;

    @PostMapping("/request")
    public ResponseEntity<?> requestDialog(@RequestBody DialogRequest request) {
        DialogPayload payload = dialogService.buildDialog(request);
        if (payload == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Unable to build dialog payload."));
        }
        return ResponseEntity.ok(payload);
    }
}
