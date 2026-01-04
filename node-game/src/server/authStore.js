import crypto from "crypto";
import { createInMemoryDataStore } from "./dataStore.js";

const USERNAME_PATTERN = /^[a-z0-9_]{3,16}$/i;
const MIN_PASSWORD_LENGTH = 6;

function normalizeUsername(username) {
  if (typeof username !== "string") {
    return "";
  }
  return username.trim().toLowerCase();
}

function hashPassword(password, salt) {
  return crypto.createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function validateCredentials(username, password) {
  if (!username || !password) {
    return "Username and password are required.";
  }
  if (!USERNAME_PATTERN.test(username)) {
    return "Username must be 3-16 characters using letters, numbers, or underscores.";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return "Password must be at least 6 characters.";
  }
  return null;
}

export function createAuthStore({ nowFn = Date.now, dataStore } = {}) {
  const store = dataStore ?? createInMemoryDataStore();

  async function registerUser({ username, password } = {}) {
    const normalized = normalizeUsername(username);
    const error = validateCredentials(normalized, password ?? "");
    if (error) {
      return { error };
    }
    const existing = await store.getUser(normalized);
    if (existing) {
      return { error: "Username is already registered." };
    }
    const salt = crypto.randomBytes(8).toString("hex");
    const passwordHash = hashPassword(password, salt);
    const user = {
      username: normalized,
      salt,
      passwordHash,
      createdAt: nowFn()
    };
    await store.createUser(user);
    return { user: { username: user.username, createdAt: user.createdAt } };
  }

  async function authenticateUser({ username, password } = {}) {
    const normalized = normalizeUsername(username);
    if (!normalized || !password) {
      return { error: "Username and password are required." };
    }
    const user = await store.getUser(normalized);
    if (!user) {
      return { error: "Account not found." };
    }
    const passwordHash = hashPassword(password, user.salt);
    if (passwordHash !== user.passwordHash) {
      return { error: "Invalid credentials." };
    }
    return { user: { username: user.username, createdAt: user.createdAt } };
  }

  async function hasUser(username) {
    const normalized = normalizeUsername(username);
    if (!normalized) {
      return false;
    }
    return Boolean(await store.getUser(normalized));
  }

  return Object.freeze({
    registerUser,
    authenticateUser,
    hasUser
  });
}
