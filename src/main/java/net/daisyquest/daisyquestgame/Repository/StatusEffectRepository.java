package net.daisyquest.daisyquestgame.Repository;

import net.daisyquest.daisyquestgame.Model.StatusEffect;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StatusEffectRepository extends MongoRepository<StatusEffect, String> {
    StatusEffect findStatusEffectByDisplayName(String name);
    StatusEffect findStatusEffectByShortDisplayName(String shortName);
}
