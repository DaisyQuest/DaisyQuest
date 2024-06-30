package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "troop_titles")
public class TroopTitle {
    @Id
    private String id;
    private int minKillCount;
    private String title;
}
