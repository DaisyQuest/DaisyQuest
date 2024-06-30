package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "troop_types")
public class TroopType {
    @Id
    private String id;
    private String name;
    private int baseHp;
    private int baseAttackPower;
    private int baseDefencePower;
    @DBRef
    private List<AttackType> attackTypes;
    @DBRef
    private List<DefenseType> defenseTypes;
}
