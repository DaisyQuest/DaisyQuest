package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.Map;

@Document(collection = "world_maps")
@Data
public class WorldMap {
    @Id
    private String id;

    private int width;
    private int height;

    // Constructor, getters, and setters are handled by Lombok's @Data annotation
}