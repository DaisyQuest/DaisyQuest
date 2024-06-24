package net.daisyquest.daisyquestgame.Service;


import net.daisyquest.daisyquestgame.Model.Quest;
import net.daisyquest.daisyquestgame.Repository.QuestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestService {
    @Autowired
    private QuestRepository questRepository;

    public Quest createQuest(Quest quest) {
        return questRepository.save(quest);
    }

    public Quest getQuest(String id) {
        return questRepository.findById(id).orElse(null);
    }

    public List<Quest> getAllQuests() {
        return questRepository.findAll();
    }

    public Quest updateQuest(Quest quest) {
        return questRepository.save(quest);
    }

    public void deleteQuest(String id) {
        questRepository.deleteById(id);
    }
}