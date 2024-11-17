package net.daisyquest.daisyquestgame.Repository;


import net.daisyquest.daisyquestgame.Model.NPCTemplate;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NPCTemplateRepository extends MongoRepository<NPCTemplate, String> {
    NPCTemplate findByName(String name);
}
