package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Config.WebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import javax.json.Json;
import javax.json.JsonObject;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Service
public class WebSocketService {

    @Autowired
    private WebSocketHandler webSocketHandler;

    public void sendDuelRequest(String targetId, String challengerId) {
        try {
            webSocketHandler.sendDuelRequest(targetId, challengerId);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void sendDuelRejection(String challengerId, String targetUsername) {
        try {
            webSocketHandler.sendDuelRejection(challengerId, targetUsername);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    public void sendDuelAccepted(String challengerId, String targetId, String combatId) throws IOException {
        webSocketHandler.sendDuelAccepted(challengerId, targetId, combatId);
    }
}