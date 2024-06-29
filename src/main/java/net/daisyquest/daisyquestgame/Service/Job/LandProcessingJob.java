package net.daisyquest.daisyquestgame.Service.Job;

import net.daisyquest.daisyquestgame.Service.LandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class LandProcessingJob {

    @Autowired
    private LandService landService;

    @Scheduled(fixedRate = 300000) // Run every 5 minutes (300,000 ms)
    public void processLandAndPartitions() {
        landService.processAllLandAndPartitions();
    }
}