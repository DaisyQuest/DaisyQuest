package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.Chest;
import net.daisyquest.daisyquestgame.Model.Reward;

import java.util.List;

public interface RewardGeneratorService {
    public List<Reward> generateRewardsForChest(Chest chest);
}
