package net.daisyquest.daisyquestgame.Model;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "submap_types")
public class SubmapType {
    String id;
    String name;
    List<EnvironmentEffect> environmentEffects;


}
