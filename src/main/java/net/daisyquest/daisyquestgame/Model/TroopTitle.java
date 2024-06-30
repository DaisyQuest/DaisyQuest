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

    public TroopTitle(){

    }
    public TroopTitle(String p_id, int p_minKC, String p_title){
        id = p_id;
        minKillCount = p_minKC;
        title = p_title;
    }
}
