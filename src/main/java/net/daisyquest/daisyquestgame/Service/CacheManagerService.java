package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Service.Interfaces.ICacheableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CacheManagerService {
    private final List<ICacheableService> cacheableServices;

    @Autowired
    public CacheManagerService(List<ICacheableService> cacheableServices) {
        this.cacheableServices = cacheableServices;
    }

    public void clearAllCaches() {
        cacheableServices.forEach(ICacheableService::clearCache);
    }

    public void clearCacheByServiceName(String serviceName) {
        cacheableServices.stream()
                .filter(service -> service.getServiceName().equalsIgnoreCase(serviceName))
                .findFirst()
                .ifPresent(ICacheableService::clearCache);
    }

    public List<String> listCacheableServices() {
        return cacheableServices.stream()
                .map(ICacheableService::getServiceName)
                .collect(Collectors.toList());
    }
}
