package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.NPCTemplate;
import net.daisyquest.daisyquestgame.Service.ItemService;
import net.daisyquest.daisyquestgame.Service.NPCTemplateService;
import net.daisyquest.daisyquestgame.Service.SpellService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/npc-templates")
public class NPCTemplateController {

    @Autowired
    private NPCTemplateService npcTemplateService;

    @Autowired
    private ItemService itemService;

    @Autowired
    private SpellService spellService;

    @GetMapping
    public String listTemplates(Model model) {
        model.addAttribute("templates", npcTemplateService.getAllTemplates());
        model.addAttribute("allItems", itemService.getAllItems());
        model.addAttribute("allSpells", spellService.getAllSpells());
        return "npc-template-manager";
    }

    @GetMapping("/{id}")
    @ResponseBody
    public ResponseEntity<NPCTemplate> getTemplate(@PathVariable String id) {
        return npcTemplateService.getTemplateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/save")
    @ResponseBody
    public ResponseEntity<NPCTemplate> saveTemplate(@RequestBody NPCTemplate template) {
        NPCTemplate savedTemplate;
        if (template.getId() != null && !template.getId().isEmpty()) {
            savedTemplate = npcTemplateService.updateTemplate(template.getId(), template);
        } else {
            savedTemplate = npcTemplateService.createTemplate(template);
        }
        return ResponseEntity.ok(savedTemplate);
    }

    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        npcTemplateService.deleteTemplate(id);
        return ResponseEntity.ok().build();
    }
}
