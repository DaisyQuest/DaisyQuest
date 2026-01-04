package net.daisyquest.daisyquestgame.Service;

import net.daisyquest.daisyquestgame.Model.ErrorResponse;
import net.daisyquest.daisyquestgame.Model.Item;
import net.daisyquest.daisyquestgame.Model.ItemTransferRequest;
import net.daisyquest.daisyquestgame.Model.Player;
import net.daisyquest.daisyquestgame.Model.PlayerInventory;
import net.daisyquest.daisyquestgame.Model.TradeRequest;
import net.daisyquest.daisyquestgame.Repository.PlayerInventoryRepository;
import net.daisyquest.daisyquestgame.Repository.PlayerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TradeServiceTest {

    @Mock
    private PlayerRepository playerRepository;

    @Mock
    private ItemService itemService;

    @Mock
    private PlayerInventoryRepository playerInventoryRepository;

    @InjectMocks
    private TradeService tradeService;

    @Test
    void requestTradeRejectsInvalidQuantity() {
        ItemTransferRequest request = new ItemTransferRequest("item-1", "from", "to", 0);

        Object result = tradeService.requestTrade(request);

        assertThat(result).isInstanceOf(ErrorResponse.class);
    }

    @Test
    void requestTradeRejectsOutOfRangePlayers() {
        ItemTransferRequest request = new ItemTransferRequest("item-1", "from", "to", 1);
        Player from = buildPlayer("from", 0, 0);
        Player to = buildPlayer("to", 500, 0);
        when(playerRepository.findById("from")).thenReturn(Optional.of(from));
        when(playerRepository.findById("to")).thenReturn(Optional.of(to));

        Object result = tradeService.requestTrade(request);

        assertThat(result).isInstanceOf(ErrorResponse.class);
    }

    @Test
    void requestTradeRejectsWhenItemNotOwned() {
        ItemTransferRequest request = new ItemTransferRequest("item-1", "from", "to", 2);
        Player from = buildPlayer("from", 0, 0);
        Player to = buildPlayer("to", 10, 10);
        when(playerRepository.findById("from")).thenReturn(Optional.of(from));
        when(playerRepository.findById("to")).thenReturn(Optional.of(to));
        PlayerInventory inventory = buildInventory(from.getId(), buildItem("item-1"), 1);
        when(playerInventoryRepository.findByPlayerId(from.getId())).thenReturn(inventory);
        when(itemService.existsById("item-1")).thenReturn(true);

        Object result = tradeService.requestTrade(request);

        assertThat(result).isInstanceOf(ErrorResponse.class);
    }

    @Test
    void respondToTradeRejectsMissingTrade() {
        Object result = tradeService.respondToTrade("missing", "to", true);

        assertThat(result).isInstanceOf(ErrorResponse.class);
    }

    @Test
    void respondToTradeDeclinesWhenRejected() {
        Item item = buildItem("item-1");
        Player from = buildPlayer("from", 0, 0);
        Player to = buildPlayer("to", 10, 10);
        PlayerInventory fromInventory = buildInventory(from.getId(), item, 1);
        when(playerRepository.findById("from")).thenReturn(Optional.of(from));
        when(playerRepository.findById("to")).thenReturn(Optional.of(to));
        when(playerInventoryRepository.findByPlayerId(from.getId())).thenReturn(fromInventory);
        when(itemService.existsById("item-1")).thenReturn(true);

        TradeRequest trade = (TradeRequest) tradeService.requestTrade(
                new ItemTransferRequest("item-1", "from", "to", 1)
        );

        Object result = tradeService.respondToTrade(trade.getId(), "to", false);

        assertThat(result).isInstanceOf(TradeRequest.class);
        assertThat(((TradeRequest) result).getStatus()).isEqualTo("DECLINED");
    }

    @Test
    void respondToTradeTransfersItemsOnAccept() {
        Item item = buildItem("item-1");
        Player from = buildPlayer("from", 0, 0);
        Player to = buildPlayer("to", 10, 10);
        PlayerInventory fromInventory = buildInventory(from.getId(), item, 2);
        PlayerInventory toInventory = buildInventory(to.getId(), null, 0);

        when(playerRepository.findById("from")).thenReturn(Optional.of(from));
        when(playerRepository.findById("to")).thenReturn(Optional.of(to));
        when(playerInventoryRepository.findByPlayerId(from.getId())).thenReturn(fromInventory);
        when(playerInventoryRepository.findByPlayerId(to.getId())).thenReturn(toInventory);
        when(itemService.existsById("item-1")).thenReturn(true);
        when(itemService.getItem("item-1")).thenReturn(item);

        TradeRequest trade = (TradeRequest) tradeService.requestTrade(
                new ItemTransferRequest("item-1", "from", "to", 2)
        );

        Object result = tradeService.respondToTrade(trade.getId(), "to", true);

        assertThat(result).isInstanceOf(TradeRequest.class);
        assertThat(((TradeRequest) result).getStatus()).isEqualTo("COMPLETED");
        assertThat(fromInventory.getItemQuantity("item-1")).isZero();
        assertThat(toInventory.getItemQuantity("item-1")).isEqualTo(2);
    }

    private Player buildPlayer(String id, int x, int y) {
        Player player = new Player();
        player.setId(id);
        player.setWorldPositionX(x);
        player.setWorldPositionY(y);
        return player;
    }

    private Item buildItem(String id) {
        Item item = new Item();
        item.setId(id);
        item.setName("Test Item");
        item.setStackable(true);
        item.setMaxStackSize(10);
        return item;
    }

    private PlayerInventory buildInventory(String playerId, Item item, int quantity) {
        PlayerInventory inventory = new PlayerInventory(playerId, 4);
        if (item != null && quantity > 0) {
            inventory.getInventorySlots().get(0).setItem(item);
            inventory.getInventorySlots().get(0).setQuantity(quantity);
        }
        return inventory;
    }
}
