package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Data
@Document(collection = "scenic_world_objects")
public class ScenicWorldObject {
    @Id
    String id;
    String worldObjectType;
    int groupCount;
    Map<String, Map<Integer,Integer>> locations;
}
