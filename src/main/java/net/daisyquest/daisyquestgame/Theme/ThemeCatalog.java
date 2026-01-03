package net.daisyquest.daisyquestgame.Theme;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ThemeCatalog(List<ThemeDefinition> themes) {
    public ThemeCatalog {
        themes = themes == null ? List.of() : List.copyOf(themes);
    }
}
