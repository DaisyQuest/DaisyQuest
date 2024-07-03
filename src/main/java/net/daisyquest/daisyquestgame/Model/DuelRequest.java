package net.daisyquest.daisyquestgame.Model;


import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DuelRequest {
    private String challengerId;
    private String targetId;
}

