package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.Activity;
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
        public ResponseEntity<Activity> completeActivity(@PathVariable String activityId, @RequestParam String playerId) {
            Activity completedActivity = activityService.completeActivity(activityId, playerId);
            if (completedActivity != null) {
                return ResponseEntity.ok(completedActivity);
            } else {
                return ResponseEntity.badRequest().build();
            }
        }
    }

