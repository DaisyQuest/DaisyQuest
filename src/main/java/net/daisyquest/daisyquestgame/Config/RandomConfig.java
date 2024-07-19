package net.daisyquest.daisyquestgame.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Random;

@Configuration
public class RandomConfig {
    final static Random RNG = new Random(System.currentTimeMillis());
    @Bean
    public Random random() {
        return RNG;
    }

}