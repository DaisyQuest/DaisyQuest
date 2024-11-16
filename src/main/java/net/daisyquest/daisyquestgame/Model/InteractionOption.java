package net.daisyquest.daisyquestgame.Model;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class InteractionOption {
    private Requirements requirements = new Requirements();
    private Map<String, Object> rewards = new HashMap<>();

    public void addRequirement(IRequirement requirement) {
        requirements.getRequirements().add(requirement);
    }
}