package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "attributes")
@Data
public class AttributeTemplate {
    @Id
    private String id;

    private String name;
    private String spriteName;
}
