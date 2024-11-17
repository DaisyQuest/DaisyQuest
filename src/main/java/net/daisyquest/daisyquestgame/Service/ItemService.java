package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
@Service
public class ItemService {
    @Autowired
    private ItemRepository itemRepository;

    public Item getItemByName(String name) {
        return itemRepository.findItemByName(name);
    }
    public Item createItem(Item item) {
        return itemRepository.save(item);
    }

    public Item getItem(String id) {
        return itemRepository.findById(id).orElse(null);
    }

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    public Item updateItem(Item item) {
        return itemRepository.save(item);
    }

    public void deleteItem(String id) {
        itemRepository.deleteById(id);
    }

    public List<Item> generateDropsFromNPC(String npcId) {
        // Implement your drop generation logic here
        // This could involve checking the NPC's level, type, or other attributes
        // and then randomly generating appropriate items
        List<Item> drops = new ArrayList<>();
        // ... generate drops ...
        itemRepository.findItemByName("\"Iron Sword\" ");
        return drops;
    }

    public boolean existsById(String itemId) {
       return itemRepository.existsById(itemId);
    }
}