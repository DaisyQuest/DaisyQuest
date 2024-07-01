package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "chests")
public class Chest {

    @Id
    private String id;

    private String name;

    private String description;

    private List<Reward> potentialRewards;

    private String itemId;



    }

