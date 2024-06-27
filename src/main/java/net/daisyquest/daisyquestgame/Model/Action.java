package net.daisyquest.daisyquestgame.Model;


import lombok.Data;

@Data
public class Action {
    private String playerId;
    private ActionType type;
    private String targetPlayerId;
    private int actionPoints;

    public Action(String playerId, ActionType type, String targetPlayerId, int actionPoints) {
        this.playerId = playerId;
        this.type = type;
        this.targetPlayerId = targetPlayerId;
        this.actionPoints = actionPoints;
    }

    public enum ActionType {
        ATTACK, SPECIAL_ATTACK, SPELL, TACTICS
    }
}
