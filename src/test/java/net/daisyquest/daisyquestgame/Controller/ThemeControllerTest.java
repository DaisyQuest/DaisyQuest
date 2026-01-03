package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Theme.ThemeDefinition;
import net.daisyquest.daisyquestgame.Theme.ThemeRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ThemeController.class)
class ThemeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ThemeRegistry themeRegistry;

    @Test
    void returnsThemeList() throws Exception {
        when(themeRegistry.getThemes()).thenReturn(List.of(
            new ThemeDefinition("aurora", "Aurora", true, Map.of()),
            new ThemeDefinition("ember", "Ember", false, Map.of("dq-bg", "#111"))
        ));

        mockMvc.perform(get("/api/themes"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("aurora"))
            .andExpect(jsonPath("$[1].tokens.dq-bg").value("#111"));
    }

    @Test
    void returnsSingleTheme() throws Exception {
        when(themeRegistry.findTheme("aurora"))
            .thenReturn(Optional.of(new ThemeDefinition("aurora", "Aurora", true, Map.of())));

        mockMvc.perform(get("/api/themes/aurora").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("aurora"))
            .andExpect(jsonPath("$.isDefault").value(true));
    }

    @Test
    void returnsNotFoundForUnknownTheme() throws Exception {
        when(themeRegistry.findTheme("missing")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/themes/missing"))
            .andExpect(status().isNotFound());
    }
}
