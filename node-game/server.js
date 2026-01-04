import { createApp } from "./src/server/app.js";
import { createMongoDataStore, createInMemoryDataStore } from "./src/server/dataStore.js";

const port = process.env.PORT || 3000;

const mongoUrl = process.env.MONGO_URL;
const dataStore = mongoUrl
  ? createMongoDataStore({ mongoUrl, dbName: process.env.MONGO_DB_NAME })
  : createInMemoryDataStore();

await dataStore.init();

const app = createApp({ dataStore });

app.listen(port, () => {
  console.log(`DaisyQuest Node game running on http://localhost:${port}`);
});
