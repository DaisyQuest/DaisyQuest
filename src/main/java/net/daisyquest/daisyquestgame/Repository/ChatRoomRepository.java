package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {
    List<ChatRoom> findByIsPublicTrue();
    List<ChatRoom> findByParticipantsContaining(String participantId);
}
