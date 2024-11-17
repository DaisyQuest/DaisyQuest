package net.daisyquest.daisyquestgame.Model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "npcTemplates")
public class NPCTemplate {
    @Id
    private String id;
    private String name;
    private String sprite;
    private Map<String, BigDecimal> items;
    private List<String> spells;
    private int currentMana;
    private int maxMana;
    private boolean duelable;
}