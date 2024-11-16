package net.daisyquest.daisyquestgame.Model;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.*;
import java.util.stream.Collectors;

// Base requirement interface
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "type"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = SkillRequirement.class, name = "SKILL"),
        @JsonSubTypes.Type(value = ItemRequirement.class, name = "ITEM"),
        @JsonSubTypes.Type(value = SpellRequirement.class, name = "SPELL")
})
public interface IRequirement {
    boolean isMet(Player player);
    boolean consume(Player player);  // Returns true if successfully consumed
    String getDescription();
}

// Collection of requirements with easy type filtering

// Example usage in WorldObjectType



