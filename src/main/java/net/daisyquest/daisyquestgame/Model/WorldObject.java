package net.daisyquest.daisyquestgame.Model;


import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "world_objects")
public class WorldObject {
    String id;
    WorldObjectType worldObjectType;
    LocalDateTime createdDateTime;
    WorldObjectType type;
    String submapId;
    int xPos;
    int yPos;
    int zPos;
    boolean used;
    long cooldownMs;

}
