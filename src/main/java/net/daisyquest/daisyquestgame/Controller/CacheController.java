package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Service.CacheManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cache")
public class CacheController {


    private final CacheManagerService cacheManagerService;

    @Autowired
    public CacheController(CacheManagerService cacheManagerService) {
        this.cacheManagerService = cacheManagerService;
    }

    @PostMapping("/clear-all")
    public ResponseEntity<String> clearAllCaches() {
        cacheManagerService.clearAllCaches();
        return ResponseEntity.ok("All caches cleared successfully");
    }

    @PostMapping("/clear/{serviceName}")
    public ResponseEntity<String> clearCacheByServiceName(@PathVariable String serviceName) {
        cacheManagerService.clearCacheByServiceName(serviceName);
        return ResponseEntity.ok("Cache cleared for service: " + serviceName);
    }

    @GetMapping("/services")
    public ResponseEntity<List<String>> listCacheableServices() {
        return ResponseEntity.ok(cacheManagerService.listCacheableServices());
    }
}