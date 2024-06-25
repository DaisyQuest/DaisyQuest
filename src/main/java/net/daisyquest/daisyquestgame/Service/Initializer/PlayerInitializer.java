package net.daisyquest.daisyquestgame.Service.Initializer;

import net.daisyquest.daisyquestgame.Model.Attribute;
import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.Quest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

public class PlayerInitializer {
    public static void initPlayer(Player p1){
        initializeAttributes(p1);
        initializeQuests(p1);
        initalizeInventory(p1);
    }

    private static void initalizeInventory(Player p1) {
        if(p1.getInventory() == null){
            p1.setInventory(new ArrayList<Item>());
        }
    }

    private static void initializeQuests(Player p1) {
        if(p1.getCompletedQuests() == null){
            p1.setCompletedQuests(new HashSet<String>());
        }
    }

    private static void initializeAttributes(Player p1) {
        if(p1.getAttributes() == null){
            p1.setAttributes(new HashMap<>());
        }
        Attribute hp = new Attribute("Hitpoints", 10, 1000);
        Attribute combat = new Attribute("Combat", 1, 1);

        p1.getAttributes().put("hitpoints", hp);
        p1.getAttributes().put("combat", combat);
    }
}
