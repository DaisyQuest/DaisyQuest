package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.InspectResponse;
import net.daisyquest.daisyquestgame.Model.NPCTemplate;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InspectService {
    private static final double INSPECT_RANGE = 100.0;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private NPCTemplateService npcTemplateService;

    public InspectResponse inspectPlayer(String inspectorId, String targetId) {
        if (inspectorId == null || targetId == null) {
            return new InspectResponse(false, "Inspector and target are required.", null, null);
        }

        Player inspector = playerRepository.findById(inspectorId).orElse(null);
        Player target = playerRepository.findById(targetId).orElse(null);

        if (inspector == null || target == null) {
            return new InspectResponse(false, "Player not found.", null, null);
        }

        if (!arePlayersInSameLocation(inspector, target)) {
            return new InspectResponse(false, "Players are not in the same location.", null, null);
        }

        if (calculateDistance(inspector, target) > INSPECT_RANGE) {
            return new InspectResponse(false, "Target is too far away to inspect.", null, null);
        }

        return new InspectResponse(true, "Inspection successful.", target, null);
    }

    public InspectResponse inspectNpcTemplate(String inspectorId, String npcTemplateId) {
        if (inspectorId == null || npcTemplateId == null) {
            return new InspectResponse(false, "Inspector and NPC template are required.", null, null);
        }

        Player inspector = playerRepository.findById(inspectorId).orElse(null);
        if (inspector == null) {
            return new InspectResponse(false, "Inspector not found.", null, null);
        }

        NPCTemplate template = npcTemplateService.getTemplateById(npcTemplateId).orElse(null);
        if (template == null) {
            return new InspectResponse(false, "NPC template not found.", null, null);
        }

        return new InspectResponse(true, "NPC inspection successful.", null, template);
    }

    private boolean arePlayersInSameLocation(Player player1, Player player2) {
        if (player1.getCurrentSubmapId() != null && player2.getCurrentSubmapId() != null) {
            return player1.getCurrentSubmapId().equals(player2.getCurrentSubmapId());
        }
        return player1.getCurrentSubmapId() == null && player2.getCurrentSubmapId() == null;
    }

    private double calculateDistance(Player player1, Player player2) {
        if (player1.getCurrentSubmapId() != null) {
            int dx = player1.getSubmapCoordinateX() - player2.getSubmapCoordinateX();
            int dy = player1.getSubmapCoordinateY() - player2.getSubmapCoordinateY();
            return Math.sqrt(dx * dx + dy * dy);
        }
        int dx = player1.getWorldPositionX() - player2.getWorldPositionX();
        int dy = player1.getWorldPositionY() - player2.getWorldPositionY();
        return Math.sqrt(dx * dx + dy * dy);
    }
}
