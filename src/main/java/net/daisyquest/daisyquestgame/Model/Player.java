package net.daisyquest.daisyquestgame.Model;


import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Map;
import java.util.List;
import java.util.Set;


@Data
@Document(collection = "players")
public class Player {
    @Id
    private String id;
    private String username;
    private String emailAddress;
    private Map<String, Attribute> attributes;
    private List<Item> inventory;
    private Set<String> completedQuests;
    private Set<String> achievements;
    private int totalExperience;
    private int level = 1;
    private Map<String, Integer> currencies; // New field for currencies
    private List<Spell> knownSpells; // New field for spells
    private int currentMana = 1000; // New field for current mana
    private int maxMana = 1000; // New field for maximum mana

    //chat
    private List<String> chatRoomIds;
    private int unreadMessages;


    //sprite
    private String subspriteBackground;
    private String subspriteFace;
    private String subspriteEyes;
    private String subspriteHairHat;
    private int worldPositionX= 10000;
    private int worldPositionY= 10000;

    private int resources;

    private List<RewardContainer> unclaimedRewards = new ArrayList<>();

    private LocalDate lastDailyRewardClaim;

    //Duel
    private boolean duelable = true;
    private boolean isNPC = false;
    private boolean markedForDeletion = false;


}
