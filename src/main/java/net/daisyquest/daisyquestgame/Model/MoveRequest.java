package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MoveRequest {
    private int targetX;
    private int targetY;
    private int targetZ;
    private MoveIntent intent = MoveIntent.MOVE;
}
