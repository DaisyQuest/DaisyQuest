package net.daisyquest.daisyquestgame.Service;


import net.daisyquest.daisyquestgame.Activity.ActivityHandler;
import net.daisyquest.daisyquestgame.Model.Activity;
import net.daisyquest.daisyquestgame.Model.Player;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Service
public class ActivityExecutionService {

    @Autowired
    private ApplicationContext context;

    @Autowired
    private PlayerService playerService;
    @Autowired
    private ActivityService activityService;
    public void executeActivity(String playerId, String activityId) {
        Player player = playerService.getPlayer(playerId);
        Activity activity = activityService.getActivity(activityId);

        if (player != null && activity != null) {
            ActivityHandler handler = (ActivityHandler) context.getBean(activity.getHandlerClass());
            handler.handleActivity(player, activity);
            playerService.updatePlayer(player);
        }
    }
}