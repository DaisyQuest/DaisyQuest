package net.daisyquest.daisyquestgame.Activity;


import net.daisyquest.daisyquestgame.Model.Activity;
import net.daisyquest.daisyquestgame.Model.Player;

public interface ActivityHandler {
    void handleActivity(Player player, Activity activity);
}

