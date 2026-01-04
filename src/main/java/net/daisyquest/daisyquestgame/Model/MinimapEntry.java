package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MinimapEntry {
    private String id;
    private MinimapEntityType entityType;
    private int x;
    private int y;
    private String label;
}
