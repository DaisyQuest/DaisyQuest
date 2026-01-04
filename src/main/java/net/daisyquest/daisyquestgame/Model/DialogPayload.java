package net.daisyquest.daisyquestgame.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DialogPayload {
    private String id;
    private String title;
    private String message;
    private String sourceType;
    private String sourceId;
    private Instant createdAt;
}
