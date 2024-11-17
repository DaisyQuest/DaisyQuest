package net.daisyquest.daisyquestgame.Model;


import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("xPos")
    int xPos;
    @JsonProperty("yPos")
    int yPos;
    @JsonProperty("zPos")
    int zPos;
    boolean used;
    long cooldownMs;

}
