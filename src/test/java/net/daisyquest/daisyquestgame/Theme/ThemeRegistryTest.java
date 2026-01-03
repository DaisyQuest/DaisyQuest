package net.daisyquest.daisyquestgame.Theme;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ThemeRegistryTest {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void loadsThemesAndRespectsDefault() {
        ThemeRegistry registry = registryFromJson("""
            {
              "themes": [
                {
                  "name": "moonlight",
                  "label": "Moonlight",
                  "isDefault": true,
                  "tokens": {
                    "dq-bg": "#0f172a"
                  }
                },
                {
                  "name": "sunrise",
                  "label": "Sunrise",
                  "tokens": {
                    "dq-bg": "#fff7ed"
                  }
                }
              ]
            }
            """);

        assertThat(registry.getThemes()).hasSize(2);
        assertThat(registry.getDefaultTheme().name()).isEqualTo("moonlight");
        assertThat(registry.findTheme("sunrise")).isPresent();
    }

    @Test
    void fallsBackWhenResourceMissing() {
        ThemeRegistry registry = new ThemeRegistry(objectMapper, new ClassPathResource("themes/missing.json"));

        assertThat(registry.getThemes()).hasSize(1);
        assertThat(registry.getDefaultTheme().name()).isEqualTo("aurora");
    }

    @Test
    void fallsBackOnInvalidJson() {
        ThemeRegistry registry = new ThemeRegistry(
            objectMapper,
            new ByteArrayResource("not-json".getBytes(StandardCharsets.UTF_8))
        );

        assertThat(registry.getThemes()).hasSize(1);
        assertThat(registry.getDefaultTheme().name()).isEqualTo("aurora");
    }

    @Test
    void normalizesMultipleDefaults() {
        ThemeRegistry registry = registryFromJson("""
            {
              "themes": [
                { "name": "alpha", "label": "Alpha", "isDefault": true },
                { "name": "beta", "label": "Beta", "isDefault": true }
              ]
            }
            """);

        List<ThemeDefinition> themes = registry.getThemes();
        assertThat(themes).hasSize(2);
        assertThat(themes.get(0).isDefault()).isTrue();
        assertThat(themes.get(1).isDefault()).isFalse();
    }

    @Test
    void setsFirstThemeAsDefaultWhenNoneDeclared() {
        ThemeRegistry registry = registryFromJson("""
            {
              "themes": [
                { "name": "alpha", "label": "Alpha" },
                { "name": "beta", "label": "Beta" }
              ]
            }
            """);

        List<ThemeDefinition> themes = registry.getThemes();
        assertThat(themes.get(0).isDefault()).isTrue();
        assertThat(themes.get(1).isDefault()).isFalse();
    }

    @Test
    void ignoresThemesWithoutNames() {
        ThemeRegistry registry = registryFromJson("""
            {
              "themes": [
                { "label": "NoName" },
                { "name": "valid", "label": "Valid" }
              ]
            }
            """);

        assertThat(registry.getThemes()).hasSize(1);
        assertThat(registry.getThemes().get(0).name()).isEqualTo("valid");
    }

    private ThemeRegistry registryFromJson(String json) {
        return new ThemeRegistry(objectMapper, new ByteArrayResource(json.getBytes(StandardCharsets.UTF_8)));
    }
}
