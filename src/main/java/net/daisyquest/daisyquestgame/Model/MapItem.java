package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "map_items")
public class MapItem {
    @Id private String id;

    @DBRef
    private Item item;

    private int quantity = 1;

    List<String> visibleToPlayerIds = new ArrayList<>();
    List<String> lootedByPlayerIds = new ArrayList<>();

    boolean destroyOnLoot;
    int destroyOnLootAmount = 1;



    private int visibilityPrivacyTimerStartAmountMs = 120000;

    private int visibilityPrivacyRemainingTimerMs;

    private int durationStartAmountMs = 600000;

    private int durationRemainingMs;

    private String droppedBy;

    private int worldMapCoordinateX;
    private int worldMapCoordinateY;

    private String currentSubmapId;
    private int submapCoordinateX;
    private int submapCoordinateY;
}
