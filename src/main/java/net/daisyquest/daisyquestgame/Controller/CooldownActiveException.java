package net.daisyquest.daisyquestgame.Controller;

import lombok.Data;
import lombok.Getter;

@Data
public class CooldownActiveException extends RuntimeException {
    private final long remainingCooldownMs;

    public CooldownActiveException(long remainingCooldownMs) {
        super("Interaction is on cooldown");
        this.remainingCooldownMs = remainingCooldownMs;
    }

}