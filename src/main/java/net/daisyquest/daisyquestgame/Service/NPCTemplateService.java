package net.daisyquest.daisyquestgame.Service;


import net.daisyquest.daisyquestgame.Model.NPCTemplate;
import net.daisyquest.daisyquestgame.Repository.NPCTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NPCTemplateService {

    @Autowired
    private NPCTemplateRepository npcTemplateRepository;

    public List<NPCTemplate> getAllTemplates() {
        return npcTemplateRepository.findAll();
    }

    public Optional<NPCTemplate> getTemplateById(String id) {
        return npcTemplateRepository.findById(id);
    }

    public NPCTemplate getTemplateByName(String name) {
        return npcTemplateRepository.findByName(name);
    }


    public NPCTemplate createTemplate(NPCTemplate template) {
        template.setId(null);  // Ensure ID is null for new templates
        return npcTemplateRepository.save(template);
    }

    public NPCTemplate updateTemplate(String id, NPCTemplate template) {
        template.setId(id);  // Ensure ID is set for existing templates
        return npcTemplateRepository.save(template);
    }

    public void deleteTemplate(String id) {
        npcTemplateRepository.deleteById(id);
    }
}