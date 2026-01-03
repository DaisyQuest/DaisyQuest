import { createInMemoryDataStore } from "../src/server/dataStore.js";

describe("data store", () => {
  test("persists users and player state in memory", async () => {
    const store = createInMemoryDataStore();
    await store.init();
    expect(await store.getUser("hero")).toBeUndefined();
    expect(await store.updateUser("hero", { createdAt: 1 })).toBeNull();

    const user = await store.createUser({
      username: "hero",
      salt: "salt",
      passwordHash: "hash",
      createdAt: 1000
    });
    expect(user.username).toBe("hero");

    expect(await store.savePlayerState("missing", { state: {} })).toBeNull();

    const state = { state: { inventory: { ember_scale: 1 } }, timers: { globalCooldownUntil: 0 } };
    await store.savePlayerState("hero", state);
    const storedState = await store.getPlayerState("hero");
    expect(storedState.state.inventory.ember_scale).toBe(1);

    const updated = await store.updateUser("hero", { createdAt: 2000 });
    expect(updated.createdAt).toBe(2000);
    expect(await store.getPlayerState("missing")).toBeNull();
    await store.close();
  });
});
