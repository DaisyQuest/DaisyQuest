package net.daisyquest.daisyquestgame.Model;


import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public enum WorldObjectType {
    ARBOREAL("arboreal"),
    FLORA("flora"),
    GRASS("grass"),
    ROAD("road"),
    WATER("water"),
    FIRE("fire"),
    DESERT("desert"),
    DOOR("door"),
    WALL("wall"),
    PORTAL("portal"),
    INSTANCE("instance"),
    TOWN("town"),
    SNOW("snow"),
    STONE("stone");

    private String name;

    private static final Map<String, WorldObjectType> ENUM_MAP;

    WorldObjectType (String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }

    static {
        Map<String,WorldObjectType> map = new ConcurrentHashMap<String, WorldObjectType>();
        for (WorldObjectType instance : WorldObjectType.values()) {
            map.put(instance.getName().toLowerCase(),instance);
        }
        ENUM_MAP = Collections.unmodifiableMap(map);
    }

    public static WorldObjectType get (String name) {
        return ENUM_MAP.get(name.toLowerCase());
    }
}
