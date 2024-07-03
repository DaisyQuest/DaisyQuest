package net.daisyquest.daisyquestgame.Controller;

public class CombatStartedResponse {

        public boolean success;
        public boolean combatStarted;
        public String combatId;

        public CombatStartedResponse(boolean success, String combatId) {
            this.success = success;
            this.combatStarted = true;
            this.combatId = combatId;
        }
    }


