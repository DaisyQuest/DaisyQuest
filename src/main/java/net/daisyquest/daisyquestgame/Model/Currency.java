package net.daisyquest.daisyquestgame.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "currencies")
public class Currency {
    @Id
    private String id;
    private String name;
    private String description;
}