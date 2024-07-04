package net.daisyquest.daisyquestgame.Service;
import jakarta.annotation.PostConstruct;
import net.daisyquest.daisyquestgame.Model.Currency;
import net.daisyquest.daisyquestgame.Repository.CurrencyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;


@Service
public class CurrencyService {

    @Autowired
    private CurrencyRepository currencyRepository;

    private Map<String, Currency> currencyCache;
    private Map<String, Currency> currencyCacheByName;

    @PostConstruct
    public void initializeCache() {
        List<Currency> currencies = currencyRepository.findAll();
        currencyCache = new ConcurrentHashMap<>();
        currencyCacheByName = new ConcurrentHashMap<>();

        for (Currency currency : currencies) {
            currencyCache.put(currency.getId(), currency);
            currencyCacheByName.put(currency.getName().toLowerCase(), currency);
        }
    }

    public List<Currency> getAllCurrencies() {
        return List.copyOf(currencyCache.values());
    }

    public Currency getCurrency(String id) {
        return currencyCache.get(id);
    }

    public Currency getCurrencyByName(String name) {
        return currencyCacheByName.get(name.toLowerCase());
    }

    public Currency createCurrency(Currency currency) {
        Currency savedCurrency = currencyRepository.save(currency);
        updateCache(savedCurrency);
        return savedCurrency;
    }

    public Currency updateCurrency(Currency currency) {
        Currency updatedCurrency = currencyRepository.save(currency);
        updateCache(updatedCurrency);
        return updatedCurrency;
    }

    public void deleteCurrency(String id) {
        currencyRepository.deleteById(id);
        Currency removedCurrency = currencyCache.remove(id);
        if (removedCurrency != null) {
            currencyCacheByName.remove(removedCurrency.getName().toLowerCase());
        }
    }

    private void updateCache(Currency currency) {
        currencyCache.put(currency.getId(), currency);
        currencyCacheByName.put(currency.getName().toLowerCase(), currency);
    }

    public void refreshCache() {
        initializeCache();
    }

    public Map<String, CurrencyDetails> getAllCurrencyDetails() {
        return currencyCache.values().stream()
                .collect(Collectors.toMap(
                        Currency::getId,
                        currency -> new CurrencyDetails(currency.getName(), currency.getSymbol())
                ));
    }

    // Inner class to hold currency details
    public static class CurrencyDetails {
        private final String name;
        private final String symbol;

        public CurrencyDetails(String name, String symbol) {
            this.name = name;
            this.symbol = symbol;
        }

        public String getName() { return name; }
        public String getSymbol() { return symbol; }
    }
}



