package net.daisyquest.daisyquestgame.Config;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketHandler extends TextWebSocketHandler {
    private static final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // The playerId will be set when the client sends a register message
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try (JsonReader jsonReader = Json.createReader(new StringReader(message.getPayload()))) {
            JsonObject jsonMessage = jsonReader.readObject();
            String type = jsonMessage.getString("type");

            switch (type) {
                case "register":
                    String playerId = jsonMessage.getString("playerId");
                    sessions.put(playerId, session);
                    break;
                case "playerMove":
                    broadcastPlayerMove(jsonMessage);
                    break;
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.values().remove(session);
    }

    public void sendDuelRequest(String targetId, String challengerId) throws IOException {
        WebSocketSession targetSession = sessions.get(targetId);
        if (targetSession != null && targetSession.isOpen()) {
            JsonObject message = Json.createObjectBuilder()
                    .add("type", "duelRequest")
                    .add("challengerId", challengerId)
                    .build();
            targetSession.sendMessage(new TextMessage(message.toString()));
        }
    }

    public void sendDuelRejection(String challengerId, String targetUsername) throws IOException {
        WebSocketSession challengerSession = sessions.get(challengerId);
        if (challengerSession != null && challengerSession.isOpen()) {
            JsonObject message = Json.createObjectBuilder()
                    .add("type", "duelRejected")
                    .add("targetUsername", targetUsername)
                    .build();
            challengerSession.sendMessage(new TextMessage(message.toString()));
        }
    }

    public void sendDuelAccepted(String challengerId, String targetId, String combatId) throws IOException {

        List<String> playerIds = Arrays.asList(challengerId, targetId);

        JsonObject message = Json.createObjectBuilder()
                .add("type", "duelAccepted")
                .add("combatId", combatId)
                .add("playerIds", Json.createArrayBuilder(playerIds))
                .build();

        for (String playerId : playerIds) {
            WebSocketSession session = sessions.get(playerId);
            if (session != null && session.isOpen()) {
                session.sendMessage(new TextMessage(message.toString()));
            }
        }
    }


    private void broadcastPlayerMove(JsonObject moveMessage) throws IOException {
        String movingPlayerId = moveMessage.getString("playerId");
        for (Map.Entry<String, WebSocketSession> entry : sessions.entrySet()) {
            if (!entry.getKey().equals(movingPlayerId)) {
                entry.getValue().sendMessage(new TextMessage(moveMessage.toString()));
            }
        }
    }
}