package net.daisyquest.daisyquestgame.Model;


import lombok.Data;

@Data
public class Action {
    private String playerId;
    private ActionType type;
    private String targetPlayerId;
    private int actionPoints;

    public enum ActionType {
        ATTACK,
        SPECIAL_ATTACK,
        SPELL,
        TACTICS
    }
}