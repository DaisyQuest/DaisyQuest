package net.daisyquest.daisyquestgame.Model;

import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public enum InteractionType {
    TALK("talk"),
    QUEST("quest"),
    BATTLE("battle"),
    EXCHANGE("exchange"),
    SHOP("shop"),
    MONOLOGUE("monologue"),
    TELEPORT("teleport"),
    BOON("boon"),
    GIFT("gift"),
    MAIM("maim");

    private String name;

    private static final Map<String, InteractionType> ENUM_MAP;

    InteractionType (String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }

    static {
        Map<String,InteractionType> map = new ConcurrentHashMap<String, InteractionType>();
        for (InteractionType instance : InteractionType.values()) {
            map.put(instance.getName().toLowerCase(),instance);
        }
        ENUM_MAP = Collections.unmodifiableMap(map);
    }

    public static InteractionType get (String name) {
        return ENUM_MAP.get(name.toLowerCase());
    }
}
