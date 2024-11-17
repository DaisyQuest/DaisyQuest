package net.daisyquest.daisyquestgame.Model;

import lombok.Data;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class Requirements {
    private List<IRequirement> requirements = new ArrayList<>();

    public List<IRequirement> get(String type) {
        return requirements.stream()
                .filter(req -> req.getClass().getSimpleName().equals(type))
                .collect(Collectors.toList());
    }

    public boolean checkAll(Player player) {
        return requirements.stream().allMatch(req -> req.isMet(player));
    }

    public boolean consumeAll(Player player) {
        // First verify all requirements are met
        if (!checkAll(player)) {
            return false;
        }

        // Then consume all requirements
        requirements.forEach(req -> req.consume(player));
        return true;
    }

    public List<String> getUnmetRequirements(Player player) {
        return requirements.stream()
                .filter(req -> !req.isMet(player))
                .map(IRequirement::getDescription)
                .collect(Collectors.toList());
    }
}

