import request from "supertest";
import { createApp } from "../src/server/app.js";
import { createInMemoryDataStore } from "../src/server/dataStore.js";
import { createGameSession } from "../src/server/gameSession.js";

describe("server app", () => {
  const rng = () => 0;

  test("handles auth flows and gameplay endpoints", async () => {
    let now = 0;
    const app = createApp({
      nowFn: () => (now += 10000),
      rng,
      dataStore: createInMemoryDataStore()
    });

    const badRegister = await request(app)
      .post("/api/auth/register")
      .send({ username: "a", password: "short" });
    expect(badRegister.status).toBe(400);

    const register = await request(app)
      .post("/api/auth/register")
      .send({ username: "Hero", password: "secret1" });
    expect(register.status).toBe(201);
    const token = register.body.token;

    const unauthorized = await request(app).get("/api/bootstrap");
    expect(unauthorized.status).toBe(401);

    const authHeader = { Authorization: `Bearer ${token}` };
    const bootstrap = await request(app).get("/api/bootstrap").set(authHeader);
    expect(bootstrap.status).toBe(200);

    const health = await request(app).get("/health");
    expect(health.status).toBe(200);

    const reset = await request(app)
      .post("/api/battle/reset")
      .set(authHeader)
      .send({ npcId: "ember_wyrmling" });
    expect(reset.status).toBe(200);

    const actionError = await request(app)
      .post("/api/battle/action")
      .set(authHeader)
      .send({ action: "mystery" });
    expect(actionError.status).toBe(400);

    let actionResponse = await request(app)
      .post("/api/battle/action")
      .set(authHeader)
      .send({ action: "attack" });
    expect(actionResponse.status).toBe(200);

    let attempts = 0;
    while (actionResponse.body.state.enemy.health > 0 && attempts < 12) {
      actionResponse = await request(app)
        .post("/api/battle/action")
        .set(authHeader)
        .send({ action: "attack" });
      attempts += 1;
    }
    expect(actionResponse.body.state.enemy.health).toBe(0);

    const tick = await request(app).post("/api/battle/tick").set(authHeader);
    expect(tick.status).toBe(200);

    const itemError = await request(app).post("/api/registry/items").set(authHeader).send({});
    expect(itemError.status).toBe(400);

    const itemSuccess = await request(app)
      .post("/api/registry/items")
      .set(authHeader)
      .send({
        id: "test_item",
        name: "Test",
        description: "Test",
        rarity: "COMMON",
        equippable: false
      });
    expect(itemSuccess.status).toBe(200);

    const recipeError = await request(app)
      .post("/api/registry/recipes")
      .set(authHeader)
      .send({ id: "bad", name: "Bad", resultItemId: "missing", ingredients: { missing: 1 } });
    expect(recipeError.status).toBe(400);

    const recipeSuccess = await request(app)
      .post("/api/registry/recipes")
      .set(authHeader)
      .send({
        id: "test_recipe",
        name: "Test Recipe",
        resultItemId: "test_item",
        ingredients: { ember_scale: 1 }
      });
    expect(recipeSuccess.status).toBe(200);

    const craftError = await request(app)
      .post("/api/crafting/attempt")
      .set(authHeader)
      .send({ recipeId: "missing" });
    expect(craftError.status).toBe(400);

    const craftSuccess = await request(app)
      .post("/api/crafting/attempt")
      .set(authHeader)
      .send({ recipeId: "test_recipe" });
    expect(craftSuccess.status).toBe(200);

    const equipError = await request(app)
      .post("/api/inventory/equip")
      .set(authHeader)
      .send({ itemId: "" });
    expect(equipError.status).toBe(400);

    const equipSuccess = await request(app)
      .post("/api/inventory/equip")
      .set(authHeader)
      .send({ itemId: "wyrmling_helm" });
    expect(equipSuccess.status).toBe(200);

    const unequipError = await request(app)
      .post("/api/inventory/unequip")
      .set(authHeader)
      .send({ slot: "" });
    expect(unequipError.status).toBe(400);

    const unequipSuccess = await request(app)
      .post("/api/inventory/unequip")
      .set(authHeader)
      .send({ slot: "HEAD" });
    expect(unequipSuccess.status).toBe(200);

    let rewardResponse = await request(app).post("/api/rewards/claim").set(authHeader);
    expect(rewardResponse.status).toBe(400);

    let rewardAttempts = 0;
    while (rewardResponse.status === 400 && rewardAttempts < 3) {
      await request(app).post("/api/battle/reset").set(authHeader).send({ npcId: "ember_wyrmling" });
      let victory;
      do {
        victory = await request(app)
          .post("/api/battle/action")
          .set(authHeader)
          .send({ action: "attack" });
      } while (victory.body.state.enemy.health > 0);
      rewardResponse = await request(app).post("/api/rewards/claim").set(authHeader);
      rewardAttempts += 1;
    }
    expect(rewardResponse.status).toBe(200);

    const registry = await request(app).get("/api/registry").set(authHeader);
    expect(registry.status).toBe(200);

    const logout = await request(app).post("/api/auth/logout").set(authHeader);
    expect(logout.status).toBe(200);

    const postLogout = await request(app).get("/api/bootstrap").set(authHeader);
    expect(postLogout.status).toBe(401);
  });

  test("rejects invalid login and supports login success", async () => {
    const app = createApp({ nowFn: () => 1000, rng, dataStore: createInMemoryDataStore() });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ username: "hero", password: "secret1" });
    expect(login.status).toBe(401);

    await request(app)
      .post("/api/auth/register")
      .send({ username: "hero", password: "secret1" });

    const loginSuccess = await request(app)
      .post("/api/auth/login")
      .send({ username: "hero", password: "secret1" });
    expect(loginSuccess.status).toBe(200);
  });

  test("creates app with defaults", async () => {
    const app = createApp();
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
  });

  test("rejects trade confirmation when inventory changes after offers", async () => {
    const dataStore = createInMemoryDataStore();
    const app = createApp({ nowFn: () => 1000, rng, dataStore });
    await request(app)
      .post("/api/auth/register")
      .send({ username: "Hero", password: "secret1" });
    await request(app)
      .post("/api/auth/register")
      .send({ username: "Ally", password: "secret1" });

    const seededSession = createGameSession({ username: "seed", rng });
    seededSession.grantItem("wyrmling_helm", 1);
    const snapshot = seededSession.getPersistenceSnapshot();
    await dataStore.savePlayerState("hero", snapshot);
    await dataStore.savePlayerState("ally", snapshot);

    const heroLogin = await request(app)
      .post("/api/auth/login")
      .send({ username: "Hero", password: "secret1" });
    const allyLogin = await request(app)
      .post("/api/auth/login")
      .send({ username: "Ally", password: "secret1" });
    const heroAuth = { Authorization: `Bearer ${heroLogin.body.token}` };
    const allyAuth = { Authorization: `Bearer ${allyLogin.body.token}` };

    const tradeRequest = await request(app)
      .post("/api/trades/request")
      .set(heroAuth)
      .send({ targetUsername: "Ally" });
    const tradeId = tradeRequest.body.trade.id;
    await request(app)
      .post("/api/trades/respond")
      .set(allyAuth)
      .send({ tradeId, accept: true });
    await request(app)
      .post("/api/trades/offer")
      .set(heroAuth)
      .send({ tradeId, itemId: "wyrmling_helm", quantity: 1 });
    await request(app)
      .post("/api/trades/offer")
      .set(allyAuth)
      .send({ tradeId, itemId: "wyrmling_helm", quantity: 1 });

    await request(app)
      .post("/api/inventory/equip")
      .set(allyAuth)
      .send({ itemId: "wyrmling_helm" });

    await request(app).post("/api/trades/confirm").set(heroAuth).send({ tradeId });
    const confirm = await request(app)
      .post("/api/trades/confirm")
      .set(allyAuth)
      .send({ tradeId });
    expect(confirm.status).toBe(400);
    expect(confirm.body.error).toBe("Insufficient inventory for trade.");
  });

  test("skips persistence when data store does not support it", async () => {
    const dataStore = {
      init: async () => {},
      close: async () => {},
      getUser: async () => null,
      createUser: async (user) => user,
      updateUser: async () => null,
      getPlayerState: async () => null
    };
    const app = createApp({ dataStore });
    const register = await request(app)
      .post("/api/auth/register")
      .send({ username: "NoPersist", password: "secret1" });
    expect(register.status).toBe(201);
  });

  test("handles sparse trade offers with fallback defaults", async () => {
    const dataStore = createInMemoryDataStore();
    const tradeManager = {
      listTradesForUser: () => [],
      createTradeRequest: () => ({ error: "not used" }),
      respondToTrade: () => ({ error: "not used" }),
      cancelTrade: () => ({ error: "not used" }),
      updateOffer: ({ tradeId }) => ({
        trade: {
          id: tradeId,
          status: "active",
          participants: ["alpha", "beta"],
          offers: {},
          confirmations: { alpha: false, beta: false },
          createdAt: 0,
          updatedAt: 0
        }
      }),
      setConfirmation: ({ tradeId }) => ({ trade: { id: tradeId }, ready: true }),
      getTrade: () => ({
        id: "stub",
        status: "active",
        participants: ["alpha", "beta"],
        offers: {}
      }),
      getTradeSnapshot: () => ({
        id: "stub",
        status: "completed",
        participants: ["alpha", "beta"],
        offers: { alpha: {}, beta: {} },
        confirmations: { alpha: true, beta: true },
        createdAt: 0,
        updatedAt: 0
      }),
      completeTrade: () => ({ trade: { id: "stub" } })
    };
    const app = createApp({ dataStore, tradeManager });
    const alpha = await request(app)
      .post("/api/auth/register")
      .send({ username: "Alpha", password: "secret1" });
    const beta = await request(app)
      .post("/api/auth/register")
      .send({ username: "Beta", password: "secret1" });
    const authAlpha = { Authorization: `Bearer ${alpha.body.token}` };
    const authBeta = { Authorization: `Bearer ${beta.body.token}` };

    const offer = await request(app)
      .post("/api/trades/offer")
      .set(authAlpha)
      .send({ tradeId: "stub", itemId: "ember_scale", quantity: 1 });
    expect(offer.status).toBe(400);

    const confirm = await request(app)
      .post("/api/trades/confirm")
      .set(authBeta)
      .send({ tradeId: "stub" });
    expect(confirm.status).toBe(200);
  });

  test("supports server-authoritative trading flows", async () => {
    let now = 0;
    const app = createApp({
      rng,
      dataStore: createInMemoryDataStore(),
      nowFn: () => (now += 10000)
    });

    const registerOne = await request(app)
      .post("/api/auth/register")
      .send({ username: "TraderOne", password: "secret1" });
    const registerTwo = await request(app)
      .post("/api/auth/register")
      .send({ username: "TraderTwo", password: "secret1" });
    const tokenOne = registerOne.body.token;
    const tokenTwo = registerTwo.body.token;
    const authOne = { Authorization: `Bearer ${tokenOne}` };
    const authTwo = { Authorization: `Bearer ${tokenTwo}` };

    const listTrades = await request(app).get("/api/trades").set(authOne);
    expect(listTrades.status).toBe(200);

    for (let i = 0; i < 3; i += 1) {
      await request(app).post("/api/battle/reset").set(authOne).send({ npcId: "ember_wyrmling" });
      let victoryOne;
      do {
        victoryOne = await request(app)
          .post("/api/battle/action")
          .set(authOne)
          .send({ action: "attack" });
      } while (victoryOne.body.state.enemy.health > 0);
    }

    await request(app).post("/api/battle/reset").set(authTwo).send({ npcId: "ember_wyrmling" });
    let victoryTwo;
    do {
      victoryTwo = await request(app)
        .post("/api/battle/action")
        .set(authTwo)
        .send({ action: "attack" });
    } while (victoryTwo.body.state.enemy.health > 0);

    const requestTrade = await request(app)
      .post("/api/trades/request")
      .set(authOne)
      .send({ targetUsername: "tradertwo" });
    expect(requestTrade.status).toBe(201);

    const respondTrade = await request(app)
      .post("/api/trades/respond")
      .set(authTwo)
      .send({ tradeId: requestTrade.body.trade.id, accept: true });
    expect(respondTrade.body.trade.status).toBe("active");

    const offerOne = await request(app)
      .post("/api/trades/offer")
      .set(authOne)
      .send({ tradeId: requestTrade.body.trade.id, itemId: "ember_scale", quantity: 1 });
    expect(offerOne.status).toBe(200);

    const removeOffer = await request(app)
      .post("/api/trades/offer")
      .set(authOne)
      .send({ tradeId: requestTrade.body.trade.id, itemId: "ember_scale", quantity: -1 });
    expect(removeOffer.status).toBe(200);

    const offerTwo = await request(app)
      .post("/api/trades/offer")
      .set(authTwo)
      .send({ tradeId: requestTrade.body.trade.id, itemId: "ember_scale", quantity: 1 });
    expect(offerTwo.status).toBe(200);

    const confirmOne = await request(app)
      .post("/api/trades/confirm")
      .set(authOne)
      .send({ tradeId: requestTrade.body.trade.id });
    expect(confirmOne.status).toBe(200);

    const confirmTwo = await request(app)
      .post("/api/trades/confirm")
      .set(authTwo)
      .send({ tradeId: requestTrade.body.trade.id });
    expect(confirmTwo.status).toBe(200);
  });

  test("rejects invalid trade requests and confirmations", async () => {
    let now = 0;
    const app = createApp({
      rng,
      dataStore: createInMemoryDataStore(),
      nowFn: () => (now += 10000)
    });

    const registerSolo = await request(app)
      .post("/api/auth/register")
      .send({ username: "Solo", password: "secret1" });
    const authSolo = { Authorization: `Bearer ${registerSolo.body.token}` };

    await request(app).post("/api/battle/reset").set(authSolo).send({ npcId: "ember_wyrmling" });
    let soloVictory;
    do {
      soloVictory = await request(app)
        .post("/api/battle/action")
        .set(authSolo)
        .send({ action: "attack" });
    } while (soloVictory.body.state.enemy.health > 0);

    const missingTarget = await request(app)
      .post("/api/trades/request")
      .set(authSolo)
      .send({});
    expect(missingTarget.status).toBe(400);

    const missingPlayer = await request(app)
      .post("/api/trades/request")
      .set(authSolo)
      .send({ targetUsername: "ghost" });
    expect(missingPlayer.status).toBe(404);

    const registerBuddy = await request(app)
      .post("/api/auth/register")
      .send({ username: "Buddy", password: "secret1" });
    const authBuddy = { Authorization: `Bearer ${registerBuddy.body.token}` };

    const selfTrade = await request(app)
      .post("/api/trades/request")
      .set(authSolo)
      .send({ targetUsername: "solo" });
    expect(selfTrade.status).toBe(400);

    const trade = await request(app)
      .post("/api/trades/request")
      .set(authSolo)
      .send({ targetUsername: "buddy" });

    const offerBeforeAccept = await request(app)
      .post("/api/trades/offer")
      .set(authSolo)
      .send({ tradeId: trade.body.trade.id, itemId: "ember_scale", quantity: 1 });
    expect(offerBeforeAccept.status).toBe(400);

    const confirmMissing = await request(app)
      .post("/api/trades/confirm")
      .set(authSolo)
      .send({ tradeId: "missing" });
    expect(confirmMissing.status).toBe(400);

    const wrongRespond = await request(app)
      .post("/api/trades/respond")
      .set(authSolo)
      .send({ tradeId: trade.body.trade.id, accept: true });
    expect(wrongRespond.status).toBe(400);

    const acceptTrade = await request(app)
      .post("/api/trades/respond")
      .set(authBuddy)
      .send({ tradeId: trade.body.trade.id, accept: true });
    expect(acceptTrade.status).toBe(200);

    const badOfferPayload = await request(app)
      .post("/api/trades/offer")
      .set(authSolo)
      .send({ tradeId: trade.body.trade.id });
    expect(badOfferPayload.status).toBe(400);

    const missingTrade = await request(app)
      .post("/api/trades/offer")
      .set(authSolo)
      .send({ tradeId: "missing", itemId: "ember_scale", quantity: 1 });
    expect(missingTrade.status).toBe(404);

    const excessiveOffer = await request(app)
      .post("/api/trades/offer")
      .set(authSolo)
      .send({ tradeId: trade.body.trade.id, itemId: "moonsteel_ingot", quantity: 1 });
    expect(excessiveOffer.status).toBe(400);

    const removeTooMany = await request(app)
      .post("/api/trades/offer")
      .set(authSolo)
      .send({ tradeId: trade.body.trade.id, itemId: "ember_scale", quantity: -1 });
    expect(removeTooMany.status).toBe(400);

    await request(app)
      .post("/api/trades/confirm")
      .set(authBuddy)
      .send({ tradeId: trade.body.trade.id });

    await request(app).post("/api/auth/logout").set(authBuddy);

    const confirmOffline = await request(app)
      .post("/api/trades/confirm")
      .set(authSolo)
      .send({ tradeId: trade.body.trade.id });
    expect(confirmOffline.status).toBe(400);

    const cancelMissing = await request(app)
      .post("/api/trades/cancel")
      .set(authSolo)
      .send({ tradeId: "missing" });
    expect(cancelMissing.status).toBe(400);

    const cancelTrade = await request(app)
      .post("/api/trades/cancel")
      .set(authSolo)
      .send({ tradeId: trade.body.trade.id });
    expect(cancelTrade.status).toBe(200);
  });

  test("blocks confirmations when inventory changes after offering", async () => {
    let now = 0;
    const app = createApp({
      rng,
      dataStore: createInMemoryDataStore(),
      nowFn: () => (now += 10000)
    });

    const registerOne = await request(app)
      .post("/api/auth/register")
      .send({ username: "Crafter", password: "secret1" });
    const registerTwo = await request(app)
      .post("/api/auth/register")
      .send({ username: "Watcher", password: "secret1" });
    const authOne = { Authorization: `Bearer ${registerOne.body.token}` };
    const authTwo = { Authorization: `Bearer ${registerTwo.body.token}` };

    await request(app).post("/api/battle/reset").set(authOne).send({ npcId: "ember_wyrmling" });
    let victoryOne;
    do {
      victoryOne = await request(app)
        .post("/api/battle/action")
        .set(authOne)
        .send({ action: "attack" });
    } while (victoryOne.body.state.enemy.health > 0);

    const trade = await request(app)
      .post("/api/trades/request")
      .set(authOne)
      .send({ targetUsername: "watcher" });
    await request(app)
      .post("/api/trades/respond")
      .set(authTwo)
      .send({ tradeId: trade.body.trade.id, accept: true });

    await request(app)
      .post("/api/trades/offer")
      .set(authOne)
      .send({ tradeId: trade.body.trade.id, itemId: "wyrmling_helm", quantity: 1 });

    const equipAttempt = await request(app)
      .post("/api/inventory/equip")
      .set(authOne)
      .send({ itemId: "wyrmling_helm" });
    expect(equipAttempt.status).toBe(200);

    await request(app)
      .post("/api/trades/confirm")
      .set(authTwo)
      .send({ tradeId: trade.body.trade.id });

    const confirmFail = await request(app)
      .post("/api/trades/confirm")
      .set(authOne)
      .send({ tradeId: trade.body.trade.id });
    expect(confirmFail.status).toBe(400);
  });
});
