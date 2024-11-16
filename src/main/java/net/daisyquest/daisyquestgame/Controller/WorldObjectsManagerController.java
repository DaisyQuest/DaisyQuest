package net.daisyquest.daisyquestgame.Controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import net.daisyquest.daisyquestgame.Model.WorldObject;
import net.daisyquest.daisyquestgame.Model.WorldObjectType;
import net.daisyquest.daisyquestgame.Repository.SubmapRepository;
import net.daisyquest.daisyquestgame.Repository.WorldObjectRepository;
import net.daisyquest.daisyquestgame.Repository.WorldObjectTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RequestMapping("/world-objects-manager")
@Slf4j
@Controller
public class WorldObjectsManagerController {
    @Autowired
    private WorldObjectRepository worldObjectRepository;

    @Autowired
    private WorldObjectTypeRepository worldObjectTypeRepository;

    @Autowired
    private SubmapRepository submapRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping
    public String managerPage(Model model) {
        // Add all the filter options to the model
        model.addAttribute("worldObjectTypes", worldObjectTypeRepository.findAll());
        model.addAttribute("submaps", submapRepository.findAll());

        // Add initial objects (can be paginated)
        model.addAttribute("worldObjects", worldObjectRepository.findAll());

        return "world-objects-manager";
    }

    @GetMapping("/search")
    @ResponseBody
    public ResponseEntity<List<WorldObject>> searchObjects(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer minX,
            @RequestParam(required = false) Integer maxX,
            @RequestParam(required = false) Integer minY,
            @RequestParam(required = false) Integer maxY,
            @RequestParam(required = false) Integer minZ,
            @RequestParam(required = false) Integer maxZ,
            @RequestParam(required = false) String submapId,
            @RequestParam(required = false) Boolean used,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Query query = new Query();

        if (StringUtils.hasText(type)) {
            query.addCriteria(Criteria.where("worldObjectType.id").is(type));
        }
        if (StringUtils.hasText(name)) {
            query.addCriteria(Criteria.where("worldObjectType.name")
                    .regex(name, "i")); // Case-insensitive search
        }
        if (minX != null || maxX != null) {
            Criteria xCriteria = Criteria.where("xPos");
            if (minX != null) xCriteria.gte(minX);
            if (maxX != null) xCriteria.lte(maxX);
            query.addCriteria(xCriteria);
        }
        // Similar for Y and Z coordinates...

        if (StringUtils.hasText(submapId)) {
            query.addCriteria(Criteria.where("submapId").is(submapId));
        }
        if (used != null) {
            query.addCriteria(Criteria.where("used").is(used));
        }

        // Add pagination
        query.skip((long) page * size).limit(size);

        List<WorldObject> objects = mongoTemplate.find(query, WorldObject.class);
        return ResponseEntity.ok(objects);
    }

    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteObject(@PathVariable String id) {
        try {
            worldObjectRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting object: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/reset")
    @ResponseBody
    public ResponseEntity<?> resetObject(@PathVariable String id) {
        try {
            WorldObject obj = worldObjectRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Object not found"));

            obj.setUsed(false);
            obj.setCreatedDateTime(LocalDateTime.now());
            worldObjectRepository.save(obj);

            return ResponseEntity.ok(obj);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error resetting object: " + e.getMessage());
        }
    }
    @Data
    public static class CreateWorldObjectRequest {
        private String worldObjectTypeId;
        @JsonProperty("xPos")
        private int xPos;
        @JsonProperty("yPos")
        private int yPos;
        @JsonProperty("zPos")
        private int zPos;
        private String submapId;
    }
    @PostMapping("/create")
    @ResponseBody
    public ResponseEntity<?> createObject(@RequestBody CreateWorldObjectRequest request) {
        try {
            WorldObjectType type = worldObjectTypeRepository.findById(request.getWorldObjectTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("World object type not found"));

            WorldObject newObject = new WorldObject();
            newObject.setWorldObjectType(type);
            newObject.setXPos(request.getXPos());
            newObject.setYPos(request.getYPos());
            newObject.setZPos(request.getZPos());
            newObject.setSubmapId(request.getSubmapId());
            newObject.setCreatedDateTime(LocalDateTime.now());
            newObject.setUsed(false);
            newObject.setCooldownMs(0);

            WorldObject saved = worldObjectRepository.save(newObject);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Error creating world object", e);
            return ResponseEntity.badRequest().body("Error creating object: " + e.getMessage());
        }
    }
}