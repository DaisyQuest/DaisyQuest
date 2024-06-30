package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "buildings")
public class Building {
    @Id
    private String id;
    private int level;
    @DBRef
    private BuildingType buildingType;
    private int hp;
    private int defencePower;
}
