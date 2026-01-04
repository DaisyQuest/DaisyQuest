package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.ErrorResponse;
import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Model.ItemTransferRequest;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.PlayerInventory;
import net.daisyquest.daisyquestgame.Model.TradeRequest;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import net.daisyquest.daisyquestgame.Repository.PlayerInventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TradeService {
    private static final double TRADE_RANGE = 100.0;

    private final Map<String, TradeRequest> trades = new ConcurrentHashMap<>();

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private ItemService itemService;

    @Autowired
    private PlayerInventoryRepository playerInventoryRepository;

    public TradeRequest getTrade(String tradeId) {
        return trades.get(tradeId);
    }

    public Object requestTrade(ItemTransferRequest request) {
        if (request == null || request.getItemId() == null || request.getFromPlayerId() == null
                || request.getToPlayerId() == null || request.getQuantity() <= 0) {
            return new ErrorResponse("Invalid trade request.");
        }

        Player fromPlayer = playerRepository.findById(request.getFromPlayerId()).orElse(null);
        Player toPlayer = playerRepository.findById(request.getToPlayerId()).orElse(null);
        if (fromPlayer == null || toPlayer == null) {
            return new ErrorResponse("Invalid player IDs.");
        }

        if (!arePlayersInSameLocation(fromPlayer, toPlayer)) {
            return new ErrorResponse("Players are not in the same location.");
        }

        if (calculateDistance(fromPlayer, toPlayer) > TRADE_RANGE) {
            return new ErrorResponse("Players are too far apart to trade.");
        }

        PlayerInventory inventory = playerInventoryRepository.findByPlayerId(fromPlayer.getId());
        if (inventory == null || !inventory.hasItem(request.getItemId(), request.getQuantity())) {
            return new ErrorResponse("Item not owned by requesting player.");
        }

        if (!itemService.existsById(request.getItemId())) {
            return new ErrorResponse("Item not found.");
        }

        TradeRequest trade = new TradeRequest(
                UUID.randomUUID().toString(),
                request.getFromPlayerId(),
                request.getToPlayerId(),
                request.getItemId(),
                request.getQuantity(),
                "PENDING",
                Instant.now()
        );
        trades.put(trade.getId(), trade);
        return trade;
    }

    public Object respondToTrade(String tradeId, String responderId, boolean accept) {
        TradeRequest trade = trades.get(tradeId);
        if (trade == null) {
            return new ErrorResponse("Trade not found.");
        }
        if (!trade.getToPlayerId().equals(responderId)) {
            return new ErrorResponse("Only the recipient can respond to this trade.");
        }

        if (!"PENDING".equals(trade.getStatus())) {
            return new ErrorResponse("Trade is no longer pending.");
        }

        if (!accept) {
            trade.setStatus("DECLINED");
            return trade;
        }

        Player fromPlayer = playerRepository.findById(trade.getFromPlayerId()).orElse(null);
        Player toPlayer = playerRepository.findById(trade.getToPlayerId()).orElse(null);
        if (fromPlayer == null || toPlayer == null) {
            trade.setStatus("FAILED");
            return new ErrorResponse("Players are no longer available.");
        }

        if (!arePlayersInSameLocation(fromPlayer, toPlayer) ||
                calculateDistance(fromPlayer, toPlayer) > TRADE_RANGE) {
            trade.setStatus("FAILED");
            return new ErrorResponse("Players are too far apart to trade.");
        }

        PlayerInventory fromInventory = playerInventoryRepository.findByPlayerId(fromPlayer.getId());
        PlayerInventory toInventory = playerInventoryRepository.findByPlayerId(toPlayer.getId());
        if (fromInventory == null || toInventory == null ||
                !fromInventory.hasItem(trade.getItemId(), trade.getQuantity())) {
            trade.setStatus("FAILED");
            return new ErrorResponse("Item no longer available.");
        }

        Item item = itemService.getItem(trade.getItemId());
        if (item == null) {
            trade.setStatus("FAILED");
            return new ErrorResponse("Item not found.");
        }

        try {
            fromInventory.removeItem(trade.getItemId(), trade.getQuantity());
            toInventory.addItem(item, trade.getQuantity());
        } catch (Exception e) {
            trade.setStatus("FAILED");
            return new ErrorResponse(e.getMessage());
        }

        playerInventoryRepository.save(fromInventory);
        playerInventoryRepository.save(toInventory);
        trade.setStatus("COMPLETED");
        return trade;
    }

    private boolean arePlayersInSameLocation(Player player1, Player player2) {
        if (player1.getCurrentSubmapId() != null && player2.getCurrentSubmapId() != null) {
            return player1.getCurrentSubmapId().equals(player2.getCurrentSubmapId());
        }
        return player1.getCurrentSubmapId() == null && player2.getCurrentSubmapId() == null;
    }

    private double calculateDistance(Player player1, Player player2) {
        if (player1.getCurrentSubmapId() != null) {
            int dx = player1.getSubmapCoordinateX() - player2.getSubmapCoordinateX();
            int dy = player1.getSubmapCoordinateY() - player2.getSubmapCoordinateY();
            return Math.sqrt(dx * dx + dy * dy);
        }
        int dx = player1.getWorldPositionX() - player2.getWorldPositionX();
        int dy = player1.getWorldPositionY() - player2.getWorldPositionY();
        return Math.sqrt(dx * dx + dy * dy);
    }
}
