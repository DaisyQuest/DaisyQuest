package net.daisyquest.daisyquestgame.Model;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data

public class EncampmentRewardData {
    Map<String, Integer> itemToQuantityMap = new HashMap<>();
}
