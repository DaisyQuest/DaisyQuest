package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MinimapResponse {
    private int centerX;
    private int centerY;
    private int radius;
    private boolean inSubmap;
    private String submapId;
    private List<MinimapEntry> entries;
}
