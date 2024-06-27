package net.daisyquest.daisyquestgame.Model;


import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;
import java.util.List;
import java.util.Set;


@Data
@Document(collection = "players")
public class Player {
    @Id
    private String id;
    private String username;
    private Map<String, Attribute> attributes;
    private List<Item> inventory;
    private Set<String> completedQuests;
    private Set<String> achievements;
    private int totalExperience;
    private int level;
    private Map<String, Integer> currencies; // New field for currencies
}