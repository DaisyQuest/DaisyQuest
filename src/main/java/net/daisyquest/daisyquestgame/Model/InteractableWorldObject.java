package net.daisyquest.daisyquestgame.Model;


import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Map;

@Data
@Document(collection = "interactable_world_objects")
public class InteractableWorldObject {
    @Id
    String id;
    String worldObjectType;
    ArrayList<String> interactionType;
    int groupCount;
    Map<String,Map<Integer,Integer>> locations;
}
