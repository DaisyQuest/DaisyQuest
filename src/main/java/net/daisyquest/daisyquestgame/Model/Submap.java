package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "submaps")
public class Submap {
    @Id
    private String id;

    private int height;
    private int length;
    private int width;

    private int startXCoordinate;
    private int startYCoordinate;
    private int startZCoodinate;

    boolean randomStart = false;

    private String title;

    private String regionId;
    private String landId;
    private String description;



    boolean isPlayerOwned;
    private String playerOwnerId;


    private boolean instanced;
    private String instanceId;


    private boolean isSafe;

    private boolean isPVPEnabled;

    private boolean nonconsentualPVPEnabled;

    SubmapType type;

    private String audioFileName;





}
