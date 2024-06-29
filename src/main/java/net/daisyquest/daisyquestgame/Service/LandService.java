package net.daisyquest.daisyquestgame.Service;


import net.daisyquest.daisyquestgame.Model.Land;
import net.daisyquest.daisyquestgame.Model.LandPartition;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Repository.LandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



import java.util.List;
import java.util.Map;

@Service
public class LandService {

    @Autowired
    private LandRepository landRepository;

    @Autowired
    private PlayerService playerService;

    @Autowired
    private CurrencyService currencyService;
    @Transactional
    public void processAllLandAndPartitions() {
        List<Land> allLands = landRepository.findAll();
        for (Land land : allLands) {
            processLand(land);
        }
    }
    @Transactional
    public Land updateLand(Land land) {
        if (land.getId() == null) {
            throw new IllegalArgumentException("Cannot update a land without an ID");
        }
        return landRepository.save(land);
    }

    public Player getPlayer(String playerId) {
        return playerService.getPlayer(playerId);
    }

    public List<Land> getLandsForSale(){
        return landRepository.findAllForSale();
    }

    public Land getLandByCoordinates(int x, int y) {
        return landRepository.findByXCoordinateAndYCoordinate(x, y);
    }



    private void processLand(Land land) {
        if (land.isPartitioned()) {
            for (LandPartition partition : land.getPartitions()) {
                processPartition(land, partition);
            }
        } else {
            // Process unpartitioned land
            Player owner = land.getOwner();
            if (owner != null) {
                int payout = calculatePayout(land, 1.0);
                playerService.addResources(owner.getId(), payout);
            }
        }
        landRepository.save(land);
    }

    private void processPartition(Land land, LandPartition partition) {
        partition.decrementUpdatesTilPayout();
        if (partition.shouldPayout()) {
            Player governor = partition.getGovernor();
            if (governor != null) {
                int payout = calculatePayout(land, partition.getArea());
                playerService.addResources(governor.getId(), payout);
            }
            partition.resetUpdatesTilPayout();
        }
    }

    private int calculatePayout(Land land, double area) {
        double basePayout = 100 * area; // Base payout of 100 resources per full land area
        double landTypeBonus = land.getLandType().getResourceBonus();
        double landTypePenalty = land.getLandType().getDevelopmentPenalty();

        double adjustedPayout = basePayout * (1 + landTypeBonus - landTypePenalty);
        return (int) Math.round(adjustedPayout);
    }
    @Transactional
    public Land buyLand(String landId, String buyerId, String currencyType) {
        Land land = landRepository.findById(landId)
                .orElseThrow(() -> new IllegalArgumentException("Land not found"));

        if (!land.isForSale()) {
            throw new IllegalStateException("This land is not for sale");
        }

        Player buyer = playerService.getPlayer(buyerId);
        if (buyer == null) {
            throw new IllegalArgumentException("Buyer not found");
        }

        int price = land.getSalePrice().getOrDefault(currencyType, 0);
        if (price == 0) {
            throw new IllegalArgumentException("Land is not available for purchase with this currency");
        }

        if (!playerService.hasSufficientCurrency(buyer, currencyType, price)) {
            throw new IllegalStateException("Insufficient funds to purchase the land");
        }

        playerService.deductCurrency(buyer, currencyType, price);
        if (land.getOwner() != null) {
            playerService.addCurrency(land.getOwner(), currencyType, price);
        }

        land.setOwner(buyer);
        land.setForSale(false);
        land.setSalePrice(null);

        return landRepository.save(land);
    }

    @Transactional
    public Land sellLand(String landId, Map<String, Integer> prices) {
        Land land = landRepository.findById(landId)
                .orElseThrow(() -> new IllegalArgumentException("Land not found"));

        if (land.getOwner() == null) {
            throw new IllegalStateException("This land has no owner");
        }

        land.setForSale(true);
        land.setSalePrice(prices);

        return landRepository.save(land);
    }

    @Transactional
    public Land cancelSale(String landId) {
        Land land = landRepository.findById(landId)
                .orElseThrow(() -> new IllegalArgumentException("Land not found"));

        if (!land.isForSale()) {
            throw new IllegalStateException("This land is not for sale");
        }

        land.setForSale(false);
        land.setSalePrice(null);

        return landRepository.save(land);
    }

    @Transactional
    public Land transferOwnership(String landId, String newOwnerId) {
        Land land = landRepository.findById(landId)
                .orElseThrow(() -> new IllegalArgumentException("Land not found"));

        Player newOwner = playerService.getPlayer(newOwnerId);
        if (newOwner == null) {
            throw new IllegalArgumentException("New owner not found");
        }

        land.setOwner(newOwner);
        land.setForSale(false);
        land.setSalePrice(null);
        return landRepository.save(land);
    }

    public Land getLand(String landId) {
        return landRepository.findById(landId)
                .orElseThrow(() -> new IllegalArgumentException("Land not found"));
    }

    public boolean isLandForSale(String landId) {
        Land land = getLand(landId);
        return land.isForSale();
    }

    public Map<String, Integer> getLandPrice(String landId) {
        Land land = getLand(landId);
        if (!land.isForSale()) {
            throw new IllegalStateException("This land is not for sale");   }
            return land.getSalePrice();
        }
    }
