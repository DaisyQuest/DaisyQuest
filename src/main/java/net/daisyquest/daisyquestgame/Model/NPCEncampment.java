package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Data
@Document(collection = "npc_encampments")
public class NPCEncampment {
    @Id
    private String id;

    private String name;
    private List<Player> npcsToSpawn;
    private List<Player> bossNPCs;
    private List<String> bossPlayerIds;
    private EncampmentRewardData rewards;
    private String sprite;

    private boolean isSubmap = false;
    private String submapId;
    private int coordinateX;
    private int coordinateY;

}
