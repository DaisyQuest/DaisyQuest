import { createApp } from "./src/server/app.js";

const app = createApp();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`DaisyQuest Node game running on http://localhost:${port}`);
});
