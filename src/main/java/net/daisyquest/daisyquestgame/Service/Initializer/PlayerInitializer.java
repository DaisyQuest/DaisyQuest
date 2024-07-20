package net.daisyquest.daisyquestgame.Service.Initializer;

import jakarta.annotation.PostConstruct;
import net.daisyquest.daisyquestgame.Model.*;
import net.daisyquest.daisyquestgame.Model.Currency;
import net.daisyquest.daisyquestgame.Repository.AttributeTemplateRepository;
import net.daisyquest.daisyquestgame.Service.CurrencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;


@Component
public class PlayerInitializer {
   static List<AttributeTemplate> templates;
   @PostConstruct
   void init(){
        templates = attributeTemplateRepository.findAll();
   }

    private static final int INITIAL_INVENTORY_SIZE = 16; // You can adjust this value as needed
    public static void initPlayer(Player p1, List<Currency> p_cur, List<Spell> p_spells){
        if(p1 == null){
            p1 = new Player();
        }

        initializeAttributes(p1);

        initializeTalents(p1);

        initializeQuests(p1);

        initalizeSpells(p1, p_spells);
        initializeSocial(p1);

    }

    private static void initializeTalents(Player p1) {
        if (p1.getTalents() == null || p1.getTalents().isEmpty()){
            EnumMap<Talent, Integer> talents = new EnumMap<>(Talent.class);
            p1.setTalents(talents);
            for (Talent talent : Talent.values()) {
                talents.put(talent, 0);
            }
        }
    }

    private static void initializeSocial(Player p1) {
        if(p1.getChatRoomIds() == null){
            p1.setChatRoomIds(new ArrayList<>());
        }
    }

    private static void initalizeSpells(Player p1, List<Spell> pSpells) {
        if(p1.getMaxMana() == 0){
            p1.setMaxMana(1000);
            p1.setCurrentMana(1000);
        }

        if(p1.getKnownSpells() == null){
            List<Spell> spells = new ArrayList<>();
            spells.addAll(pSpells);
            p1.setKnownSpells(spells);

        }

    }

    public static void initializeCurrency(PlayerInventory p1, List<Currency> p_cur) {
        if(p1.getCurrencies() == null){
            Map<String, Integer> newMap = new HashMap<>();
            List<Currency> currencyList = p_cur;
            currencyList.forEach(o-> {
                if(!newMap.containsKey(o.getId())) {
                    newMap.put(o.getId(), 100);
                }
            });
            p1.setCurrencies(newMap);
        }
    }



    private static void initializeQuests(Player p1) {
        if(p1.getCompletedQuests() == null){
            p1.setCompletedQuests(new HashSet<String>());
        }
    }

    @Autowired
    AttributeTemplateRepository attributeTemplateRepository;

    private static void initializeAttributes(Player p1) {
        if (p1.getAttributes() == null) {
            p1.setAttributes(new HashMap<>());
        }



        for (AttributeTemplate template : templates) {
            String attributeName = template.getName().toLowerCase();
            if (!p1.getAttributes().containsKey(attributeName)) {
                Attribute attribute = new Attribute();
                attribute.setName(template.getName());

                if (attributeName.equals("hitpoints")) {
                    attribute.setLevel(10);
                } else {
                    attribute.setLevel(1);
                }

                attribute.setExperience(0);
                attribute.setSprite(template.getSpriteName());

                p1.getAttributes().put(attributeName, attribute);
            }
        }
    }

    private static Attribute getLapidiaryAttribute(int level, int xp) {
        return new Attribute("Lapidiary", level, xp);
    }

    public static Attribute getHitpointsAttribute(int level, int xp){
        return new Attribute("Hitpoints", level, xp);
    }

    public static Attribute getCombatAttribute(int level, int xp){
        return new Attribute("Combat", level, xp);
    }

    public static Map<String, Attribute> getInitializedCombatMapForNPC(int hpLevel, int combatLevel){
        Map<String, Attribute> returnMap = new HashMap<>();
        returnMap.put("hitpoints", getHitpointsAttribute(hpLevel, 0));
        returnMap.put("combat", getCombatAttribute(combatLevel, 0));
        return returnMap;
    }
}
