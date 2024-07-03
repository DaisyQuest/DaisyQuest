package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "building_types")
public class BuildingType {
    @Id
    private String id;
    private String name;
    private int baseHp = 100;
    private int baseDefencePower = 1;
    @DBRef
    private List<TroopType> availableTroops;
    private int castleHPContribution = 0;
    private int threatLevel = 0;
    private int limitPerCastle;
    private String displaySprite;
}
