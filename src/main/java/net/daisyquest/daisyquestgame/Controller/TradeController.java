package net.daisyquest.daisyquestgame.Controller;

import net.daisyquest.daisyquestgame.Model.ErrorResponse;
import net.daisyquest.daisyquestgame.Model.ItemTransferRequest;
import net.daisyquest.daisyquestgame.Model.TradeResponseRequest;
import net.daisyquest.daisyquestgame.Service.TradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trades")
public class TradeController {

    @Autowired
    private TradeService tradeService;

    @PostMapping("/request")
    public ResponseEntity<?> requestTrade(@RequestBody ItemTransferRequest request) {
        Object result = tradeService.requestTrade(request);
        if (result instanceof ErrorResponse) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/respond")
    public ResponseEntity<?> respondToTrade(@RequestBody TradeResponseRequest request) {
        Object result = tradeService.respondToTrade(request.getTradeId(), request.getResponderId(), request.isAccept());
        if (result instanceof ErrorResponse) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }
}
