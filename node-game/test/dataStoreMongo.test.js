import { jest } from "@jest/globals";

const mockCreateIndex = jest.fn();
const mockFindOne = jest.fn();
const mockInsertOne = jest.fn();
const mockUpdateOne = jest.fn();
const mockCollection = {
  createIndex: mockCreateIndex,
  findOne: mockFindOne,
  insertOne: mockInsertOne,
  updateOne: mockUpdateOne
};
const mockDb = {
  collection: jest.fn(() => mockCollection)
};
const mockConnect = jest.fn();
const mockClose = jest.fn();

class MockMongoClient {
  constructor(url) {
    this.url = url;
    this.connect = mockConnect;
    this.close = mockClose;
    this.db = jest.fn(() => mockDb);
  }
}

jest.unstable_mockModule("mongodb", () => ({ MongoClient: MockMongoClient }));

const { createMongoDataStore } = await import("../src/server/dataStore.js");

describe("mongo data store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("requires mongo url", () => {
    expect(() => createMongoDataStore()).toThrow("Mongo URL is required.");
  });

  test("connects and performs CRUD operations", async () => {
    mockFindOne.mockResolvedValueOnce({ username: "hero" });
    const store = createMongoDataStore({ mongoUrl: "mongodb://test" });

    await store.init();
    expect(mockConnect).toHaveBeenCalled();
    expect(mockDb.collection).toHaveBeenCalledWith("users");
    expect(mockCreateIndex).toHaveBeenCalledWith({ username: 1 }, { unique: true });

    await store.createUser({ username: "hero" });
    expect(mockInsertOne).toHaveBeenCalledWith({ username: "hero" });

    await store.getUser("hero");
    expect(mockFindOne).toHaveBeenCalledWith({ username: "hero" });

    await store.updateUser("hero", { createdAt: 1 });
    expect(mockUpdateOne).toHaveBeenCalledWith({ username: "hero" }, { $set: { createdAt: 1 } });

    mockFindOne.mockResolvedValueOnce({ username: "hero", playerState: { state: { xp: 1 } } });
    const playerState = await store.getPlayerState("hero");
    expect(playerState.state.xp).toBe(1);

    mockFindOne.mockResolvedValueOnce(null);
    const missingState = await store.getPlayerState("missing");
    expect(missingState).toBeNull();

    await store.savePlayerState("hero", { state: { xp: 2 } });
    expect(mockUpdateOne).toHaveBeenLastCalledWith(
      { username: "hero" },
      { $set: { playerState: { state: { xp: 2 } } } }
    );

    await store.close();
    expect(mockClose).toHaveBeenCalled();
  });

  test("throws before init", async () => {
    const store = createMongoDataStore({ mongoUrl: "mongodb://test" });
    await expect(store.getUser("hero")).rejects.toThrow("Mongo store not initialized.");
    await expect(store.createUser({ username: "hero" })).rejects.toThrow(
      "Mongo store not initialized."
    );
    await expect(store.updateUser("hero", { createdAt: 1 })).rejects.toThrow(
      "Mongo store not initialized."
    );
  });
});
