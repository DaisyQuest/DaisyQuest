package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TradeRequest {
    private String id;
    private String fromPlayerId;
    private String toPlayerId;
    private String itemId;
    private int quantity;
    private String status;
    private Instant createdAt;
}
