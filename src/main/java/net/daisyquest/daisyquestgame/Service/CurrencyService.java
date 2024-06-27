package net.daisyquest.daisyquestgame.Service;
import net.daisyquest.daisyquestgame.Model.Currency;
import net.daisyquest.daisyquestgame.Repository.CurrencyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


    @Service
    public class CurrencyService {

        @Autowired
        private CurrencyRepository currencyRepository;

        public List<Currency> getAllCurrencies() {
            return currencyRepository.findAll();
        }

        public Currency getCurrency(String id) {
            return currencyRepository.findById(id).orElse(null);
        }

        public Currency createCurrency(Currency currency) {
            return currencyRepository.save(currency);
        }

        public Currency updateCurrency(Currency currency) {
            return currencyRepository.save(currency);
        }

        public void deleteCurrency(String id) {
            currencyRepository.deleteById(id);
        }
    }

