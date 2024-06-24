package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Data
@Document(collection = "npcs")
public class NPC {
    @Id
    private String id;
    private String name;
    private Map<String, Integer> attributes;
    private List<Item> loot;
}
