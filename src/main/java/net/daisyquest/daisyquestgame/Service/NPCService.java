package net.daisyquest.daisyquestgame.Service;



import net.daisyquest.daisyquestgame.Model.NPC;
import net.daisyquest.daisyquestgame.Repository.NPCRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NPCService {
    @Autowired
    private NPCRepository npcRepository;

    public NPC createNPC(NPC npc) {
        return npcRepository.save(npc);
    }

    public NPC getNPC(String id) {
        return npcRepository.findById(id).orElse(null);
    }

    public List<NPC> getAllNPCs() {
        return npcRepository.findAll();
    }

    public NPC updateNPC(NPC npc) {
        return npcRepository.save(npc);
    }

    public void deleteNPC(String id) {
        npcRepository.deleteById(id);
    }
}