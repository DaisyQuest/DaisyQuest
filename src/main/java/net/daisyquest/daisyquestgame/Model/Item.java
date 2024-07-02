package net.daisyquest.daisyquestgame.Model;

    import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

    import java.util.Map;

@Data
    @Document(collection = "items")
    public class Item {
        @Id
        private String id;
        private String name;
        private String description;
        private Map<String, Integer> attributeModifiers;
        private int sellPrice;

        boolean isChest = false;
    }

