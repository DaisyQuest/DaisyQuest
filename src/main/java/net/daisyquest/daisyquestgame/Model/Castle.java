package net.daisyquest.daisyquestgame.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "castles")
public class Castle {
    @Id
    private String id;
    private int health = 10000;
    @DBRef
    private List<Building> buildings;
    @DBRef
    private List<Troop> troops;
    private int threatLevel = 1;
    private int tacticLevel = 1;
    @DBRef
    private Player owner;

}

