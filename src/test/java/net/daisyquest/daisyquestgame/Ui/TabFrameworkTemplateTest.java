package net.daisyquest.daisyquestgame.Ui;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TabFrameworkTemplateTest {

    private String readResource(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        return Files.readString(resource.getFile().toPath(), StandardCharsets.UTF_8);
    }

    @Test
    void gameTemplateUsesCardTabs() throws IOException {
        String html = readResource("templates/game.html");

        assertThat(html).contains("data-dq-tablist=\"primary\"");

        List<String> tabs = List.of(
            "quests",
            "inventory-management",
            "talent-trees",
            "activities",
            "shops",
            "my-shop",
            "combat",
            "inspect",
            "chat",
            "worldMapH",
            "crafting"
        );

        for (String tabId : tabs) {
            assertThat(html).contains("data-dq-tab-target=\"#" + tabId + "\"");
            assertThat(html).contains("id=\"" + tabId + "\"");
        }

        assertThat(html).contains("data-dq-tab-panel=\"primary\"");
        assertThat(html).containsPattern("id=\"inventory-management\"[^>]*hidden");
        assertThat(html).contains("aria-selected=\"true\">Quests");
    }

    @Test
    void tabFrameworkDefinesCustomEvents() throws IOException {
        String script = readResource("static/js/tabFramework.js");

        assertThat(script).contains("dq.tab.shown");
        assertThat(script).contains("dq.tab.hidden");
        assertThat(script).contains("window.DQTabs");
    }

    @Test
    void tabStylesAreDefined() throws IOException {
        String css = readResource("static/css/components.css");

        assertThat(css).contains(".dq-tab-list");
        assertThat(css).contains(".dq-tab-button");
        assertThat(css).contains(".dq-tab-panel");
    }
}
