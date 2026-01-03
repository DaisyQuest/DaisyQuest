import request from "supertest";
import { createApp } from "../src/server/app.js";

describe("server app", () => {
  const rng = () => 0;

  test("handles auth flows and gameplay endpoints", async () => {
    let now = 0;
    const app = createApp({ nowFn: () => (now += 10000), rng });

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
    const app = createApp({ nowFn: () => 1000, rng });

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
});
