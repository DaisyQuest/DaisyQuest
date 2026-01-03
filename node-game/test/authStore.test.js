import { createAuthStore } from "../src/server/authStore.js";
import { createInMemoryDataStore } from "../src/server/dataStore.js";

describe("auth store", () => {
  test("rejects invalid registration payloads", async () => {
    const store = createAuthStore({ nowFn: () => 100, dataStore: createInMemoryDataStore() });
    await expect(store.registerUser()).resolves.toEqual({
      error: "Username and password are required."
    });
    await expect(store.registerUser({ username: "a", password: "secret" })).resolves.toEqual({
      error: "Username must be 3-16 characters using letters, numbers, or underscores."
    });
    await expect(store.registerUser({ username: "valid_user" })).resolves.toEqual({
      error: "Username and password are required."
    });
    await expect(store.registerUser({ username: "valid_user", password: "123" })).resolves.toEqual({
      error: "Password must be at least 6 characters."
    });
  });

  test("registers and authenticates users", async () => {
    const store = createAuthStore({ nowFn: () => 1234, dataStore: createInMemoryDataStore() });
    const registration = await store.registerUser({ username: "Hero", password: "secret1" });
    expect(registration.user).toEqual({ username: "hero", createdAt: 1234 });
    await expect(store.hasUser("HERO")).resolves.toBe(true);
    await expect(store.registerUser({ username: "Hero", password: "secret1" })).resolves.toEqual({
      error: "Username is already registered."
    });

    await expect(store.authenticateUser()).resolves.toEqual({
      error: "Username and password are required."
    });
    await expect(store.authenticateUser({ username: "hero" })).resolves.toEqual({
      error: "Username and password are required."
    });
    await expect(store.authenticateUser({ username: "unknown", password: "secret1" })).resolves.toEqual({
      error: "Account not found."
    });
    await expect(store.authenticateUser({ username: "hero", password: "badpass" })).resolves.toEqual({
      error: "Invalid credentials."
    });

    const auth = await store.authenticateUser({ username: "HeRo", password: "secret1" });
    expect(auth.user.username).toBe("hero");
    await expect(store.hasUser({})).resolves.toBe(false);
  });

  test("uses default configuration", async () => {
    const store = createAuthStore();
    const result = await store.registerUser({ username: "Traveler", password: "secret1" });
    expect(result.user.username).toBe("traveler");
  });
});
