package net.daisyquest.daisyquestgame.Model;


import lombok.Data;

@Data
public class Action {
    private String playerId;
    private ActionType type;
    private String targetPlayerId;
    private int actionPoints;
    private String spellId;
    private String specialAttackId;
    public Action(String playerId, ActionType type, String targetPlayerId, int actionPoints, String spellId) {
        this.playerId = playerId;
        this.type = type;
        this.targetPlayerId = targetPlayerId;
        this.actionPoints = actionPoints;
        this.spellId = spellId; // New field for spell actions
    }
    public Action(){

    }

    public enum ActionType {
        ATTACK, SPECIAL_ATTACK, SPELL, NONE, TACTICS
    }
}
