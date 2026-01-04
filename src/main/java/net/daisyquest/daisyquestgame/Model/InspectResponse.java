package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InspectResponse {
    private boolean success;
    private String message;
    private Player player;
    private NPCTemplate npcTemplate;
}
