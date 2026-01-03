package net.daisyquest.daisyquestgame.Theme;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ThemeRegistry {
    private static final Logger logger = LoggerFactory.getLogger(ThemeRegistry.class);
    private static final String THEME_RESOURCE = "classpath:themes/themes.json";

    private final ObjectMapper objectMapper;
    private final List<ThemeDefinition> themes;

    public ThemeRegistry(ObjectMapper objectMapper, ResourceLoader resourceLoader) {
        this(objectMapper, resourceLoader.getResource(THEME_RESOURCE));
    }

    ThemeRegistry(ObjectMapper objectMapper, Resource themeResource) {
        this.objectMapper = objectMapper;
        this.themes = loadThemes(themeResource);
    }

    public List<ThemeDefinition> getThemes() {
        return List.copyOf(themes);
    }

    public Optional<ThemeDefinition> findTheme(String name) {
        if (name == null || name.isBlank()) {
            return Optional.empty();
        }
        return themes.stream()
            .filter(theme -> name.equalsIgnoreCase(theme.name()))
            .findFirst();
    }

    public ThemeDefinition getDefaultTheme() {
        return themes.stream()
            .filter(ThemeDefinition::isDefault)
            .findFirst()
            .orElseGet(() -> themes.get(0));
    }

    private List<ThemeDefinition> loadThemes(Resource resource) {
        if (resource == null || !resource.exists()) {
            logger.warn("Theme resource not found. Falling back to default theme.");
            return List.of(fallbackTheme());
        }

        try (InputStream inputStream = resource.getInputStream()) {
            ThemeCatalog catalog = objectMapper.readValue(inputStream, ThemeCatalog.class);
            return sanitizeThemes(catalog.themes());
        } catch (IOException exception) {
            logger.warn("Failed to load themes. Falling back to default theme.", exception);
            return List.of(fallbackTheme());
        }
    }

    private List<ThemeDefinition> sanitizeThemes(List<ThemeDefinition> loadedThemes) {
        if (loadedThemes == null || loadedThemes.isEmpty()) {
            return List.of(fallbackTheme());
        }

        Map<String, ThemeDefinition> uniqueThemes = new LinkedHashMap<>();
        for (ThemeDefinition theme : loadedThemes) {
            if (theme == null || theme.name() == null || theme.name().isBlank()) {
                continue;
            }
            uniqueThemes.putIfAbsent(theme.name().toLowerCase(), theme);
        }

        if (uniqueThemes.isEmpty()) {
            return List.of(fallbackTheme());
        }

        List<ThemeDefinition> sanitized = new ArrayList<>(uniqueThemes.values());
        boolean defaultFound = false;
        List<ThemeDefinition> adjusted = new ArrayList<>();
        for (ThemeDefinition theme : sanitized) {
            if (theme.isDefault() && !defaultFound) {
                adjusted.add(theme);
                defaultFound = true;
            } else if (theme.isDefault()) {
                adjusted.add(theme.withDefault(false));
            } else {
                adjusted.add(theme);
            }
        }

        if (!defaultFound) {
            ThemeDefinition first = adjusted.get(0);
            adjusted.set(0, first.withDefault(true));
        }

        return List.copyOf(adjusted);
    }

    private ThemeDefinition fallbackTheme() {
        return new ThemeDefinition(
            "aurora",
            "Aurora Bloom",
            true,
            Map.of(
                "dq-bg", "#0b1020",
                "dq-surface", "#111827",
                "dq-surface-elevated", "#1f2937",
                "dq-border", "#27324a",
                "dq-text", "#f8fafc",
                "dq-muted", "#94a3b8",
                "dq-accent", "#facc15",
                "dq-accent-strong", "#f97316",
                "dq-accent-soft", "#fde68a",
                "dq-success", "#22c55e",
                "dq-danger", "#ef4444",
                "dq-focus", "#38bdf8",
                "dq-progress-track", "rgba(148, 163, 184, 0.25)",
                "dq-progress-fill", "linear-gradient(90deg, #facc15, #fb7185, #f97316)",
                "dq-glow", "0 0 25px rgba(250, 204, 21, 0.4)",
                "dq-card-glow", "0 20px 40px rgba(15, 23, 42, 0.45)",
                "dq-reward", "radial-gradient(circle at top, rgba(250, 204, 21, 0.28), rgba(15, 23, 42, 0.92))"
            )
        );
    }
}
