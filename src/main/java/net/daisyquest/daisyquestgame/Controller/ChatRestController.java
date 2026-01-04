package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.ChatMessage;
import net.daisyquest.daisyquestgame.Model.ChatMessageRequest;
import net.daisyquest.daisyquestgame.Model.ChatRoom;
import net.daisyquest.daisyquestgame.Model.ErrorResponse;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatRestController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private PlayerRepository playerRepository;

    @GetMapping("/rooms/default")
    public ResponseEntity<ChatRoom> getDefaultRoom() {
        return ResponseEntity.ok(chatService.getOrCreatePublicRoom("Global"));
    }

    @GetMapping("/rooms/public")
    public ResponseEntity<List<ChatRoom>> getPublicRooms() {
        return ResponseEntity.ok(chatService.getPublicRooms());
    }

    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(@RequestBody ChatMessageRequest request) {
        if (request.getSenderId() == null || request.getContent() == null || request.getContent().isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Sender and content are required."));
        }
        if (!playerRepository.existsById(request.getSenderId())) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Sender not found."));
        }
        if (request.getRoomId() == null && request.getRecipientId() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Room or recipient is required."));
        }
        ChatMessage message = chatService.sendMessage(
                request.getSenderId(),
                request.getContent(),
                request.getRoomId(),
                request.getRecipientId()
        );
        return ResponseEntity.ok(message);
    }

    @GetMapping("/messages/room/{roomId}")
    public ResponseEntity<List<ChatMessage>> getRoomMessages(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(chatService.getRoomMessages(roomId, limit));
    }

    @GetMapping("/messages/private")
    public ResponseEntity<List<ChatMessage>> getPrivateMessages(
            @RequestParam String userId1,
            @RequestParam String userId2,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(chatService.getPrivateMessages(userId1, userId2, limit));
    }
}
