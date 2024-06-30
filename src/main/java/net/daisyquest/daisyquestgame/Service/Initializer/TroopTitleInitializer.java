package net.daisyquest.daisyquestgame.Service.Initializer;

import net.daisyquest.daisyquestgame.Model.TroopTitle;
import net.daisyquest.daisyquestgame.Repository.TroopTitleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;


    @Component
    public class TroopTitleInitializer implements CommandLineRunner {

        @Autowired
        private TroopTitleRepository troopTitleRepository;

        @Override
        public void run(String... args) throws Exception {
            if (troopTitleRepository.count() == 0) {
                List<TroopTitle> titles = Arrays.asList(
                        new TroopTitle(null, 0, "Private"),
                        new TroopTitle(null, 5, "Corporal"),
                        new TroopTitle(null, 15, "Sergeant"),
                        new TroopTitle(null, 30, "Lieutenant"),
                        new TroopTitle(null, 50, "Captain"),
                        new TroopTitle(null, 75, "Major"),
                        new TroopTitle(null, 100, "Colonel"),
                        new TroopTitle(null, 150, "General")
                );
                troopTitleRepository.saveAll(titles);
            }
        }
    }

