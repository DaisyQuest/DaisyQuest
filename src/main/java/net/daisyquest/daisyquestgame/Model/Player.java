package net.daisyquest.daisyquestgame.Model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "players")
public class Player {
    @Id
    private String id;
    private String username;
    private String emailAddress;
    private Map<String, Attribute> attributes;
    private PlayerLifeForces lifeForces;

    @DBRef
    private PlayerInventory inventory;

    private Set<String> completedQuests;
    private Set<String> achievements;
    private int totalExperience;
    private int level = 1;
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
    private boolean isAlive = true;

    private boolean markedForDeletion = false;
    private int talentPointsAvailable = 0;

    private Map<Talent, Integer> talents = new EnumMap<>(Talent.class);

    private String currentSubmapId;
    private int submapCoordinateX;
    private int submapCoordinateY;
    private int submapCoordinateZ;

    //New field 1
    String controllerPlayerID;

    //New field 2
    private List<String> playerControlledEntityIds;

}
