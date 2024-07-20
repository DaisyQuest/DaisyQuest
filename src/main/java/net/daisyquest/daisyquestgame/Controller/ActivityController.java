package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.Activity;
import net.daisyquest.daisyquestgame.Model.ActivityCompletionResult;
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

    @GetMapping
    public ResponseEntity<List<Activity>> getAllActivities() {
        return ResponseEntity.ok(activityService.getAllActivities());
    }

    @PostMapping
    public ResponseEntity<Activity> createActivity(@RequestBody Activity activity) {
        return ResponseEntity.ok(activityService.createActivity(activity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Activity> getActivity(@PathVariable String id) {
        Activity activity = activityService.getActivity(id);
        if (activity != null) {
            return ResponseEntity.ok(activity);
        } else {
            return ResponseEntity.notFound().build();
        }
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

    @PostMapping("/{activityId}/start")
    public ResponseEntity<Activity> startActivity(@PathVariable String activityId, @RequestParam String playerId) {
        Activity startedActivity = activityService.startActivity(activityId, playerId);
        if (startedActivity != null) {
            return ResponseEntity.ok(startedActivity);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{activityId}/complete")
    public ResponseEntity<ActivityCompletionResult> completeActivity(@PathVariable String activityId, @RequestParam String playerId) {
        ActivityCompletionResult result = activityService.completeActivity(activityId, playerId);
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
    }

