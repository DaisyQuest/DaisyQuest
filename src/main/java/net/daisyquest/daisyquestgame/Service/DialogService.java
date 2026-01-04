package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.DialogPayload;
import net.daisyquest.daisyquestgame.Model.DialogRequest;
import net.daisyquest.daisyquestgame.Model.NPCTemplate;
import net.daisyquest.daisyquestgame.Model.Player;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class DialogService {
    @Autowired
    private PlayerService playerService;

    @Autowired
    private NPCTemplateService npcTemplateService;

    public DialogPayload buildDialog(DialogRequest request) {
        if (request == null || request.getPlayerId() == null) {
            return null;
        }

        Player player = playerService.getPlayer(request.getPlayerId());
        if (player == null) {
            return null;
        }

        String title = "Message";
        if ("npc".equalsIgnoreCase(request.getSourceType()) && request.getSourceId() != null) {
            NPCTemplate template = npcTemplateService.getTemplateById(request.getSourceId()).orElse(null);
            if (template != null) {
                title = template.getName();
            }
        } else if ("object".equalsIgnoreCase(request.getSourceType())) {
            title = "Object Message";
        }

        String message = request.getMessage();
        if (message == null || message.isBlank()) {
            message = "The world hums softly around you.";
        }

        return new DialogPayload(
                UUID.randomUUID().toString(),
                title,
                message,
                request.getSourceType(),
                request.getSourceId(),
                Instant.now()
        );
    }
}
