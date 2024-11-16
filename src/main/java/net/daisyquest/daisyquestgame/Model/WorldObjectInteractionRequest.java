package net.daisyquest.daisyquestgame.Model;

import lombok.Data;

@Data
public class WorldObjectInteractionRequest {
    private String playerId;
    private String worldObjectId;
    private InteractionType interactionType;
}
