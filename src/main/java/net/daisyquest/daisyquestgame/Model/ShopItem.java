package net.daisyquest.daisyquestgame.Model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "shopItems")
public class ShopItem {
    @Id
    private String id;
    private Item itemForSale;
    private Currency currencyUsed;
    private int price;
    private Integer quantity; // null for unlimited quantity
}

