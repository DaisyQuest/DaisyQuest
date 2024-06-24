package net.daisyquest.daisyquestgame;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})@EnableMongoRepositories
public class DaisyQuestApplication {

    public static void main(String[] args) {
        SpringApplication.run(DaisyQuestApplication.class, args);
    }

}
