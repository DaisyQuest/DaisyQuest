package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.ChatMessage;
import net.daisyquest.daisyquestgame.Model.ChatRoom;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByRoomIdOrderByTimestampDesc(String roomId, Pageable pageable);
    List<ChatMessage> findBySenderIdAndRecipientIdOrRecipientIdAndSenderIdOrderByTimestampDesc(
            String senderId, String recipientId, String recipientId2, String senderId2, Pageable pageable);
}


