package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.Activity;
import net.daisyquest.daisyquestgame.Service.ActivityExecutionService;
import net.daisyquest.daisyquestgame.Service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private ActivityExecutionService activityExecutionService;

    @PostMapping
    public ResponseEntity<Activity> createActivity(@RequestBody Activity activity) {
        return ResponseEntity.ok(activityService.createActivity(activity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Activity> getActivity(@PathVariable String id) {
        Activity activity = activityService.getActivity(id);
        return activity != null ? ResponseEntity.ok(activity) : ResponseEntity.notFound().build();
    }

    @GetMapping
    public ResponseEntity<List<Activity>> getAllActivities() {
        return ResponseEntity.ok(activityService.getAllActivities());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Activity> updateActivity(@PathVariable String id, @RequestBody Activity activity) {
        activity.setId(id);
        return ResponseEntity.ok(activityService.updateActivity(activity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable String id) {
        activityService.deleteActivity(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{activityId}/execute")
    public ResponseEntity<String> executeActivity(@RequestParam String playerId, @PathVariable String activityId) {
        activityExecutionService.executeActivity(playerId, activityId);
        return ResponseEntity.ok("Activity executed successfully");
    }
}
