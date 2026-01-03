package net.daisyquest.daisyquestgame.Theme;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ThemeDefinition(String name, String label, boolean isDefault, Map<String, String> tokens) {
    public ThemeDefinition {
        tokens = tokens == null ? Map.of() : Map.copyOf(tokens);
    }

    public ThemeDefinition withDefault(boolean defaultTheme) {
        return new ThemeDefinition(name, label, defaultTheme, tokens);
    }
}
