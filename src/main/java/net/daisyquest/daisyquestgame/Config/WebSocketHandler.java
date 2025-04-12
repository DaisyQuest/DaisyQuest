package net.daisyquest.daisyquestgame.Config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import net.daisyquest.daisyquestgame.Service.WorldMapService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketHandler extends TextWebSocketHandler {
    private static final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final WorldMapService worldMapService;

    public WebSocketHandler(WorldMapService worldMapService) {
        this.worldMapService = worldMapService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // The playerId will be set when the client sends a register message
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode jsonMessage = objectMapper.readTree(message.getPayload());
        String type = jsonMessage.get("type").asText();
        System.err.println(jsonMessage);
        switch (type) {
            case "register":
                String playerId = jsonMessage.get("playerId").asText();
                sessions.put(playerId, session);
                break;
            case "playerMove":
                broadcastPlayerMove(jsonMessage);
                break;
            case "chat":
                broadcastChatMessage(jsonMessage);
                break;
            case "enterSubmap":
                handleEnterSubmap(jsonMessage);
                break;
            case "exitSubmap":
                handleExitSubmap(jsonMessage);
                break;
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.values().remove(session);
    }

    public void sendDuelRequest(String targetId, String challengerId) throws IOException {
        WebSocketSession targetSession = sessions.get(targetId);
        if (targetSession != null && targetSession.isOpen()) {
            ObjectNode message = objectMapper.createObjectNode()
                    .put("type", "duelRequest")
                    .put("challengerId", challengerId);
            targetSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
        }
    }

    public void sendDuelRejection(String challengerId, String targetUsername) throws IOException {
        WebSocketSession challengerSession = sessions.get(challengerId);
        if (challengerSession != null && challengerSession.isOpen()) {
            ObjectNode message = objectMapper.createObjectNode()
                    .put("type", "duelRejected")
                    .put("targetUsername", targetUsername);
            challengerSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
        }
    }

    public void sendDuelAccepted(String challengerId, String targetId, String combatId) throws IOException {
        List<String> playerIds = Arrays.asList(challengerId, targetId);

        ObjectNode message = objectMapper.createObjectNode()
                .put("type", "duelAccepted")
                .put("combatId", combatId)
                .set("playerIds", objectMapper.valueToTree(playerIds));

        for (String playerId : playerIds) {
            WebSocketSession session = sessions.get(playerId);
            if (session != null && session.isOpen()) {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
            }
        }
    }

    private void broadcastPlayerMove(JsonNode moveMessage) throws IOException {
        String movingPlayerId = moveMessage.get("playerId").asText();
        long timestamp = System.currentTimeMillis();

        ObjectNode enhancedMoveMessage = objectMapper.createObjectNode();
        moveMessage.fields().forEachRemaining(entry -> enhancedMoveMessage.set(entry.getKey(), entry.getValue()));
        enhancedMoveMessage.put("timestamp", timestamp);
      //  worldMapService.movePlayer(movingPlayerId,enhancedMoveMessage.get("x").asInt(), enhancedMoveMessage.get("y").asInt());
        for (Map.Entry<String, WebSocketSession> entry : sessions.entrySet()) {
            if (!entry.getKey().equals(movingPlayerId)) {
                entry.getValue().sendMessage(new TextMessage(objectMapper.writeValueAsString(enhancedMoveMessage)));
            }
        }
    }

    private void broadcastChatMessage(JsonNode chatMessage) throws IOException {
        String senderId = chatMessage.get("playerId").asText();
        for (Map.Entry<String, WebSocketSession> entry : sessions.entrySet()) {
            if (!entry.getKey().equals(senderId)) {
                entry.getValue().sendMessage(new TextMessage(objectMapper.writeValueAsString(chatMessage)));
            }
        }
    }

    private void handleEnterSubmap(JsonNode enterSubmapMessage) throws IOException {
        String playerId = enterSubmapMessage.get("playerId").asText();
        String submapId = enterSubmapMessage.get("submapId").asText();
        for (Map.Entry<String, WebSocketSession> entry : sessions.entrySet()) {
            if (!entry.getKey().equals(playerId)) {
                ObjectNode message = objectMapper.createObjectNode()
                        .put("type", "playerEnteredSubmap")
                        .put("playerId", playerId)
                        .put("submapId", submapId);
                entry.getValue().sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
            }
        }
    }

    private void handleExitSubmap(JsonNode exitSubmapMessage) throws IOException {
        String playerId = exitSubmapMessage.get("playerId").asText();
        String submapId = exitSubmapMessage.get("submapId").asText();
        for (Map.Entry<String, WebSocketSession> entry : sessions.entrySet()) {
            if (!entry.getKey().equals(playerId)) {
                ObjectNode message = objectMapper.createObjectNode()
                        .put("type", "playerExitedSubmap")
                        .put("playerId", playerId)
                        .put("submapId", submapId);
                entry.getValue().sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
            }
        }
    }

    public void sendEnterSubmapNotification(String playerId, String submapId) throws IOException {
        WebSocketSession session = sessions.get(playerId);
        if (session != null && session.isOpen()) {
            ObjectNode message = objectMapper.createObjectNode()
                    .put("type", "enterSubmap")
                    .put("submapId", submapId);
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
        }
    }

    public void sendExitSubmapNotification(String playerId) throws IOException {
        WebSocketSession session = sessions.get(playerId);
        if (session != null && session.isOpen()) {
            ObjectNode message = objectMapper.createObjectNode()
                    .put("type", "exitSubmap");
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
        }
    }
}