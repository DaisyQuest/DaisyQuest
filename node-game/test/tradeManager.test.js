import { createTradeManager, TRADE_STATUS } from "../src/server/tradeManager.js";

describe("trade manager", () => {
  test("creates, responds, updates, and completes trades", () => {
    let now = 1000;
    const manager = createTradeManager({ nowFn: () => (now += 100) });

    const request = manager.createTradeRequest({ from: "hero", to: "ally" });
    expect(request.trade.status).toBe(TRADE_STATUS.REQUESTED);

    const respond = manager.respondToTrade({
      tradeId: request.trade.id,
      username: "ally",
      accept: true
    });
    expect(respond.trade.status).toBe(TRADE_STATUS.ACTIVE);

    const update = manager.updateOffer({
      tradeId: request.trade.id,
      username: "hero",
      items: { ember_scale: 2 }
    });
    expect(update.trade.offers.hero.ember_scale).toBe(2);
    expect(update.trade.confirmations.hero).toBe(false);

    const cleared = manager.updateOffer({
      tradeId: request.trade.id,
      username: "hero",
      items: null
    });
    expect(Object.keys(cleared.trade.offers.hero)).toHaveLength(0);

    const confirmHero = manager.setConfirmation({
      tradeId: request.trade.id,
      username: "hero"
    });
    expect(confirmHero.ready).toBe(false);

    const confirmAlly = manager.setConfirmation({
      tradeId: request.trade.id,
      username: "ally"
    });
    expect(confirmAlly.ready).toBe(true);

    const completed = manager.completeTrade(request.trade.id);
    expect(completed.trade.status).toBe(TRADE_STATUS.COMPLETED);
  });

  test("handles errors and cancelation", () => {
    const manager = createTradeManager();
    expect(manager.createTradeRequest({ from: "hero" }).error).toBe(
      "Both participants are required."
    );
    expect(manager.createTradeRequest({ from: "hero", to: "hero" }).error).toBe(
      "Cannot trade with yourself."
    );
    expect(manager.respondToTrade({ tradeId: "missing", username: "hero" }).error).toBe(
      "Trade not found."
    );

    const request = manager.createTradeRequest({ from: "hero", to: "ally" });
    const cancel = manager.cancelTrade({ tradeId: request.trade.id, username: "hero" });
    expect(cancel.trade.status).toBe(TRADE_STATUS.CANCELLED);
    expect(
      manager.updateOffer({ tradeId: request.trade.id, username: "hero", items: {} }).error
    ).toBe("Trade is not active.");
  });

  test("rejects unauthorized updates and confirms listings", () => {
    const manager = createTradeManager();
    const request = manager.createTradeRequest({ from: "hero", to: "ally" });
    expect(manager.listTradesForUser("hero")).toHaveLength(1);
    expect(manager.getTradeSnapshot(request.trade.id).id).toBe(request.trade.id);
    expect(manager.getTrade("missing")).toBeNull();
    expect(manager.getTradeSnapshot("missing")).toBeNull();

    const wrongRespond = manager.respondToTrade({
      tradeId: request.trade.id,
      username: "hero",
      accept: true
    });
    expect(wrongRespond.error).toBe("Only the invited player can respond.");

    manager.respondToTrade({ tradeId: request.trade.id, username: "ally", accept: true });
    const wrongOffer = manager.updateOffer({
      tradeId: request.trade.id,
      username: "stranger",
      items: { ember_scale: 1 }
    });
    expect(wrongOffer.error).toBe("Player not part of this trade.");

    const wrongConfirm = manager.setConfirmation({
      tradeId: request.trade.id,
      username: "stranger"
    });
    expect(wrongConfirm.error).toBe("Player not part of this trade.");
  });

  test("guards cancellation and completion rules", () => {
    const manager = createTradeManager();
    expect(manager.completeTrade("missing").error).toBe("Trade not found.");

    const request = manager.createTradeRequest({ from: "hero", to: "ally" });
    manager.respondToTrade({ tradeId: request.trade.id, username: "ally", accept: false });
    const cancel = manager.cancelTrade({ tradeId: request.trade.id, username: "hero" });
    expect(cancel.error).toBe("Trade cannot be cancelled.");

    const wrongCancel = manager.cancelTrade({ tradeId: request.trade.id, username: "stranger" });
    expect(wrongCancel.error).toBe("Player not part of this trade.");
  });

  test("rejects actions for invalid trade states", () => {
    const manager = createTradeManager();
    const request = manager.createTradeRequest({ from: "hero", to: "ally" });
    manager.respondToTrade({ tradeId: request.trade.id, username: "ally", accept: true });

    const repeatRespond = manager.respondToTrade({
      tradeId: request.trade.id,
      username: "ally",
      accept: true
    });
    expect(repeatRespond.error).toBe("Trade is not awaiting a response.");

    expect(manager.updateOffer({ tradeId: "missing", username: "hero", items: {} }).error).toBe(
      "Trade not found."
    );

    manager.completeTrade(request.trade.id);
    const confirmInactive = manager.setConfirmation({
      tradeId: request.trade.id,
      username: "hero"
    });
    expect(confirmInactive.error).toBe("Trade is not active.");

    const normalizeTest = manager.updateOffer({
      tradeId: request.trade.id,
      username: "hero",
      items: null
    });
    expect(normalizeTest.error).toBe("Trade is not active.");
  });
});
