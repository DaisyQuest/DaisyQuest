import { createAuthStore } from "../src/server/authStore.js";

describe("auth store", () => {
  test("rejects invalid registration payloads", () => {
    const store = createAuthStore({ nowFn: () => 100 });
    expect(store.registerUser()).toEqual({ error: "Username and password are required." });
    expect(store.registerUser({ username: "a", password: "secret" })).toEqual({
      error: "Username must be 3-16 characters using letters, numbers, or underscores."
    });
    expect(store.registerUser({ username: "valid_user" })).toEqual({
      error: "Username and password are required."
    });
    expect(store.registerUser({ username: "valid_user", password: "123" })).toEqual({
      error: "Password must be at least 6 characters."
    });
  });

  test("registers and authenticates users", () => {
    const store = createAuthStore({ nowFn: () => 1234 });
    const registration = store.registerUser({ username: "Hero", password: "secret1" });
    expect(registration.user).toEqual({ username: "hero", createdAt: 1234 });
    expect(store.hasUser("HERO")).toBe(true);
    expect(store.registerUser({ username: "Hero", password: "secret1" })).toEqual({
      error: "Username is already registered."
    });

    expect(store.authenticateUser()).toEqual({ error: "Username and password are required." });
    expect(store.authenticateUser({ username: "hero" })).toEqual({
      error: "Username and password are required."
    });
    expect(store.authenticateUser({ username: "unknown", password: "secret1" })).toEqual({
      error: "Account not found."
    });
    expect(store.authenticateUser({ username: "hero", password: "badpass" })).toEqual({
      error: "Invalid credentials."
    });

    const auth = store.authenticateUser({ username: "HeRo", password: "secret1" });
    expect(auth.user.username).toBe("hero");
    expect(store.hasUser({})).toBe(false);
  });

  test("uses default configuration", () => {
    const store = createAuthStore();
    const result = store.registerUser({ username: "Traveler", password: "secret1" });
    expect(result.user.username).toBe("traveler");
  });
});
