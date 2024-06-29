package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.ChatMessage;
import net.daisyquest.daisyquestgame.Model.ChatRoom;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Repository.ChatMessageRepository;
import net.daisyquest.daisyquestgame.Repository.ChatRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ChatService {
    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private PlayerService playerService;

    public ChatMessage sendMessage(String senderId, String content, String roomId, String recipientId) {
        ChatMessage message = new ChatMessage();
        message.setSenderId(senderId);
        message.setContent(content);
        message.setRoomId(roomId);
        message.setRecipientId(recipientId);
        message.setTimestamp(new Date());

        ChatMessage savedMessage = chatMessageRepository.save(message);

        // Update unread messages for recipients
        if (roomId != null) {
            ChatRoom room = chatRoomRepository.findById(roomId).orElse(null);
            if (room != null) {
                for (String participantId : room.getParticipants()) {
                    if (!participantId.equals(senderId)) {
                        Player participant = playerService.getPlayer(participantId);
                        participant.setUnreadMessages(participant.getUnreadMessages() + 1);
                        playerService.updatePlayer(participant);
                    }
                }
            }
        } else if (recipientId != null) {
            Player recipient = playerService.getPlayer(recipientId);
            recipient.setUnreadMessages(recipient.getUnreadMessages() + 1);
            playerService.updatePlayer(recipient);
        }

        return savedMessage;
    }

    public List<ChatMessage> getRoomMessages(String roomId, int limit) {
        return chatMessageRepository.findByRoomIdOrderByTimestampDesc(roomId, PageRequest.of(0, limit));
    }

    public List<ChatMessage> getPrivateMessages(String userId1, String userId2, int limit) {
        return chatMessageRepository.findBySenderIdAndRecipientIdOrRecipientIdAndSenderIdOrderByTimestampDesc(
                userId1, userId2, userId1, userId2, PageRequest.of(0, limit));
    }

    public ChatRoom createChatRoom(String name, List<String> participants, boolean isPublic) {
        ChatRoom room = new ChatRoom();
        room.setName(name);
        room.setParticipants(participants);
        room.setPublic(isPublic);
        return chatRoomRepository.save(room);
    }

    public List<ChatRoom> getPublicRooms() {
        return chatRoomRepository.findByIsPublicTrue();
    }

    public List<ChatRoom> getUserRooms(String userId) {
        return chatRoomRepository.findByParticipantsContaining(userId);
    }
}