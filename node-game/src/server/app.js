import express from "express";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createAuthStore } from "./authStore.js";
import { createGameSession } from "./gameSession.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "..", "..", "public");

function getTokenFromRequest(req) {
  const header = req.headers.authorization ?? "";
  if (!header.startsWith("Bearer ")) {
    return "";
  }
  return header.slice("Bearer ".length).trim();
}

export function createApp({ nowFn = Date.now, rng = Math.random } = {}) {
  const app = express();
  const authStore = createAuthStore({ nowFn });
  const sessions = new Map();

  app.use(express.json());
  app.use(express.static(PUBLIC_DIR));

  function createSession(username) {
    const token = crypto.randomUUID();
    const session = createGameSession({ username, nowFn, rng });
    sessions.set(token, session);
    return { token, session };
  }

  function buildBootstrapResponse(session, token) {
    return {
      token,
      profile: { username: session.username },
      ...session.getSnapshot(),
      registry: session.getRegistrySnapshot(),
      config: session.getConfig()
    };
  }

  function requireSession(req, res, next) {
    const token = getTokenFromRequest(req);
    const session = sessions.get(token);
    if (!session) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }
    req.session = session;
    req.sessionToken = token;
    next();
  }

  app.post("/api/auth/register", (req, res) => {
    const { username, password } = req.body;
    const result = authStore.registerUser({ username, password });
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    const { token, session } = createSession(result.user.username);
    res.status(201).json(buildBootstrapResponse(session, token));
  });

  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const result = authStore.authenticateUser({ username, password });
    if (result.error) {
      res.status(401).json({ error: result.error });
      return;
    }
    const { token, session } = createSession(result.user.username);
    res.json(buildBootstrapResponse(session, token));
  });

  app.post("/api/auth/logout", requireSession, (req, res) => {
    sessions.delete(req.sessionToken);
    res.json({ status: "ok" });
  });

  app.get("/api/bootstrap", requireSession, (req, res) => {
    res.json(buildBootstrapResponse(req.session, req.sessionToken));
  });

  app.post("/api/battle/reset", requireSession, (req, res) => {
    const { npcId } = req.body;
    const result = req.session.resetBattle(npcId);
    res.json(result);
  });

  app.post("/api/battle/action", requireSession, (req, res) => {
    const { action } = req.body;
    const result = req.session.attemptAction(action);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  app.post("/api/battle/tick", requireSession, (req, res) => {
    const result = req.session.processEnemyTick();
    res.json(result);
  });

  app.post("/api/crafting/attempt", requireSession, (req, res) => {
    const { recipeId } = req.body;
    const result = req.session.craftItem(recipeId);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  app.post("/api/inventory/equip", requireSession, (req, res) => {
    const { itemId } = req.body;
    const result = req.session.equipItem(itemId);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  app.post("/api/inventory/unequip", requireSession, (req, res) => {
    const { slot } = req.body;
    const result = req.session.unequipItem(slot);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  app.post("/api/rewards/claim", requireSession, (req, res) => {
    const result = req.session.claimReward();
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  app.get("/api/registry", requireSession, (req, res) => {
    res.json({ registry: req.session.getRegistrySnapshot() });
  });

  app.post("/api/registry/items", requireSession, (req, res) => {
    const result = req.session.updateItem(req.body);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  app.post("/api/registry/recipes", requireSession, (req, res) => {
    const result = req.session.updateRecipe(req.body);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return app;
}
