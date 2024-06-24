package net.daisyquest.daisyquestgame.Model;


import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Data
@Document(collection = "activities")
public class Activity {
    @Id
    private String id;
    private String name;
    private int duration;
    private Map<String, Integer> requirements;
    private String handlerClass;
}
