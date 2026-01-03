package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Theme.ThemeDefinition;
import net.daisyquest.daisyquestgame.Theme.ThemeRegistry;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/themes")
public class ThemeController {
    private final ThemeRegistry themeRegistry;

    public ThemeController(ThemeRegistry themeRegistry) {
        this.themeRegistry = themeRegistry;
    }

    @GetMapping
    public List<ThemeDefinition> getThemes() {
        return themeRegistry.getThemes();
    }

    @GetMapping("/{name}")
    public ResponseEntity<ThemeDefinition> getTheme(@PathVariable String name) {
        return themeRegistry.findTheme(name)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
