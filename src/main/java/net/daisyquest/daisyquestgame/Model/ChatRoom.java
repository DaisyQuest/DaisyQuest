package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "chat_rooms")
public class ChatRoom {
    @Id
    private String id;
    private String name;
    private List<String> participants;
    private boolean isPublic;
}
