package net.daisyquest.daisyquestgame.Model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.List;

@Data
@Document(collection = "shops")
public class Shop {
    @Id
    private String id;
    private String name;
    private String ownerId; // null for non-player-owned shops
    private List<ShopItem> items;
}
