package net.daisyquest.daisyquestgame.Controller;


import net.daisyquest.daisyquestgame.Model.Activity;
import net.daisyquest.daisyquestgame.Model.Attribute;
import net.daisyquest.daisyquestgame.Model.AttributeTemplate;
import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Repository.AttributeTemplateRepository;
import net.daisyquest.daisyquestgame.Service.ActivityService;
import net.daisyquest.daisyquestgame.Repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class ActivityEditorController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private AttributeTemplateRepository attributeRepository;

    @Autowired
    private ItemRepository itemRepository;

    @GetMapping("/activity-editor")
    public String activityEditor() {
        return "activity-editor";
    }

    @GetMapping("/api/activities2")
    @ResponseBody
    public List<Activity> getAllActivities() {
        return activityService.getAllActivities();
    }

    @GetMapping("/api/activities2/{id}")
    @ResponseBody
    public Activity getActivity(@PathVariable String id) {
        return activityService.getActivity(id);
    }

    @PostMapping("/api/activities2")
    @ResponseBody
    public Activity saveActivity(@RequestBody Activity activity) {
        return activityService.createActivity(activity);
    }

    @PutMapping("/api/activities2/{id}")
    @ResponseBody
    public Activity updateActivity(@PathVariable String id, @RequestBody Activity activity) {
        activity.setId(id);
        return activityService.updateActivity(activity);
    }

    @DeleteMapping("/api/activities2/{id}")
    @ResponseBody
    public ResponseEntity<Void> deleteActivity(@PathVariable String id) {
        activityService.deleteActivity(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/attributes2")
    @ResponseBody
    public List<AttributeTemplate> getAllAttributes() {
        return attributeRepository.findAll();
    }

    @GetMapping("/api/items2")
    @ResponseBody
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @GetMapping("/api/equipment2")
    @ResponseBody
    public List<Item> getAllEquipment() {
        return itemRepository.findAll();
    }
}
