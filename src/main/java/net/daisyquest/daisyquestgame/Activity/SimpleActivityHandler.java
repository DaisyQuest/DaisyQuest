package net.daisyquest.daisyquestgame.Activity;


import net.daisyquest.daisyquestgame.Model.Activity;
import net.daisyquest.daisyquestgame.Model.Attribute;
import net.daisyquest.daisyquestgame.Model.Player;
import org.springframework.stereotype.Component;

@Component("SimpleActivityHandler")
public class SimpleActivityHandler implements ActivityHandler {
    @Override
    public void handleActivity(Player player, Activity activity) {
        // Simple implementation: increase related attribute by 1
        String attributeName = activity.getName().toLowerCase();
        Attribute attribute = player.getAttributes().get(attributeName);
        System.out.println("HERE WE ARE");
        if (attribute != null) {
            attribute.setExperience(attribute.getExperience() + 10);
            // Check if level up is needed
            if (attribute.getExperience() >= attribute.getLevel() * 100) {
                attribute.setLevel(attribute.getLevel() + 1);
            }
        }
    }
}