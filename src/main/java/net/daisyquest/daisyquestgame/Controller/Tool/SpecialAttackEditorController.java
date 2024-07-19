package net.daisyquest.daisyquestgame.Controller.Tool;

import lombok.Data;
import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Model.SpecialAttack;
import net.daisyquest.daisyquestgame.Repository.ItemRepository;
import net.daisyquest.daisyquestgame.Service.SpecialAttackService;
import net.daisyquest.daisyquestgame.Service.StatusEffectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;

@Controller
@RequestMapping("/special-attack-editor")
public class SpecialAttackEditorController {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private SpecialAttackService specialAttackService;

    @Autowired
    private StatusEffectService statusEffectService;

    @GetMapping
    public String editorPage(Model model) {
        model.addAttribute("items", itemRepository.findAll());
        model.addAttribute("specialAttacks", specialAttackService.getAll());
        model.addAttribute("statusEffects", statusEffectService.getAllStatusEffects());
        return "special-attack-editor";
    }

    @PostMapping("/save")
    @ResponseBody
    public ResponseEntity<?> saveSpecialAttack(@RequestBody SpecialAttackSaveRequest request) {
        try {
            SpecialAttack savedAttack = specialAttackService.saveSpecialAttack(request.getSpecialAttack());

            if (request.getItemId() != null && !request.getItemId().isEmpty()) {
                Item item = itemRepository.findById(request.getItemId()).orElse(null);
                if (item != null) {
                    if (item.getSpecialAttacks() == null) {
                        item.setSpecialAttacks(new ArrayList<>());
                    }
                    if(!item.getSpecialAttacks().contains(savedAttack)) {
                        item.getSpecialAttacks().add(savedAttack);
                        itemRepository.save(item);
                    }
                }
            }

            return ResponseEntity.ok(savedAttack);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving special attack: " + e.getMessage());
        }
    }

    @GetMapping("/get/{id}")
    @ResponseBody
    public ResponseEntity<SpecialAttack> getSpecialAttack(@PathVariable String id) {
        SpecialAttack attack = specialAttackService.getSpecialAttackById(id);
        if (attack != null) {
            return ResponseEntity.ok(attack);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

@Data
class SpecialAttackSaveRequest {
    private SpecialAttack specialAttack;
    private String itemId;
}