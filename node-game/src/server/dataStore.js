import { MongoClient } from "mongodb";

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value;
}

export function createInMemoryDataStore() {
  const users = new Map();

  async function init() {}

  async function close() {}

  async function getUser(username) {
    return clone(users.get(username));
  }

  async function createUser(user) {
    users.set(user.username, clone(user));
    return clone(user);
  }

  async function updateUser(username, updates) {
    const existing = users.get(username);
    if (!existing) {
      return null;
    }
    const next = { ...existing, ...clone(updates) };
    users.set(username, next);
    return clone(next);
  }

  async function savePlayerState(username, playerState) {
    const existing = users.get(username);
    if (!existing) {
      return null;
    }
    const next = { ...existing, playerState: clone(playerState) };
    users.set(username, next);
    return clone(next);
  }

  async function getPlayerState(username) {
    return clone(users.get(username)?.playerState ?? null);
  }

  return Object.freeze({
    init,
    close,
    getUser,
    createUser,
    updateUser,
    savePlayerState,
    getPlayerState
  });
}

export function createMongoDataStore({ mongoUrl, dbName = "daisyquest" } = {}) {
  if (!mongoUrl) {
    throw new Error("Mongo URL is required.");
  }
  const client = new MongoClient(mongoUrl);
  let usersCollection = null;

  async function init() {
    await client.connect();
    const db = client.db(dbName);
    usersCollection = db.collection("users");
    await usersCollection.createIndex({ username: 1 }, { unique: true });
  }

  async function close() {
    await client.close();
  }

  async function getUser(username) {
    if (!usersCollection) {
      throw new Error("Mongo store not initialized.");
    }
    return await usersCollection.findOne({ username });
  }

  async function createUser(user) {
    if (!usersCollection) {
      throw new Error("Mongo store not initialized.");
    }
    await usersCollection.insertOne(user);
    return user;
  }

  async function updateUser(username, updates) {
    if (!usersCollection) {
      throw new Error("Mongo store not initialized.");
    }
    await usersCollection.updateOne({ username }, { $set: updates });
    return await getUser(username);
  }

  async function savePlayerState(username, playerState) {
    return await updateUser(username, { playerState });
  }

  async function getPlayerState(username) {
    const user = await getUser(username);
    return user?.playerState ?? null;
  }

  return Object.freeze({
    init,
    close,
    getUser,
    createUser,
    updateUser,
    savePlayerState,
    getPlayerState
  });
}
