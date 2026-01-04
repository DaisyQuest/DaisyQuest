import express from "express";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createAuthStore } from "./authStore.js";
import { createInMemoryDataStore } from "./dataStore.js";
import { createGameSession } from "./gameSession.js";
import { createTradeManager } from "./tradeManager.js";
import {
  resolveContextAction,
  resolveContextMenu,
  resolveInteractionAction
} from "./worldInteractions.js";

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

export function createApp({
  nowFn = Date.now,
  rng = Math.random,
  dataStore = createInMemoryDataStore(),
  tradeManager = createTradeManager({ nowFn })
} = {}) {
  const app = express();
  const authStore = createAuthStore({ nowFn, dataStore });
  const sessions = new Map();
  const sessionsByUser = new Map();

  app.use(express.json());
  app.use(express.static(PUBLIC_DIR));

  async function createSession(username) {
    const token = crypto.randomUUID();
    const stored = await dataStore.getPlayerState(username);
    const session = createGameSession({
      username,
      nowFn,
      rng,
      initialState: stored?.state ?? null,
      initialTimers: stored?.timers ?? null,
      registrySnapshot: stored?.registry ?? null
    });
    sessions.set(token, session);
    sessionsByUser.set(username, token);
    return { token, session };
  }

  function buildBootstrapResponse(session, token) {
    return {
      token,
      profile: { username: session.username },
      ...session.getSnapshot(),
      registry: session.getRegistrySnapshot(),
      config: session.getConfig(),
      trades: tradeManager.listTradesForUser(session.username)
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

  async function persistSession(session) {
    if (!dataStore?.savePlayerState) {
      return;
    }
    await dataStore.savePlayerState(session.username, session.getPersistenceSnapshot());
  }

  app.post("/api/auth/register", async (req, res) => {
    const { username, password } = req.body;
    const result = await authStore.registerUser({ username, password });
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    const { token, session } = await createSession(result.user.username);
    await persistSession(session);
    res.status(201).json(buildBootstrapResponse(session, token));
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const result = await authStore.authenticateUser({ username, password });
    if (result.error) {
      res.status(401).json({ error: result.error });
      return;
    }
    const { token, session } = await createSession(result.user.username);
    res.json(buildBootstrapResponse(session, token));
  });

  app.post("/api/auth/logout", requireSession, (req, res) => {
    sessionsByUser.delete(req.session.username);
    sessions.delete(req.sessionToken);
    res.json({ status: "ok" });
  });

  app.get("/api/bootstrap", requireSession, (req, res) => {
    res.json(buildBootstrapResponse(req.session, req.sessionToken));
  });

  app.post("/api/battle/reset", requireSession, async (req, res) => {
    const { npcId } = req.body;
    const result = req.session.resetBattle(npcId);
    await persistSession(req.session);
    res.json(result);
  });

  app.post("/api/battle/action", requireSession, async (req, res) => {
    const { action } = req.body;
    const result = req.session.attemptAction(action);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    await persistSession(req.session);
    res.json(result);
  });

  app.post("/api/battle/tick", requireSession, async (req, res) => {
    const result = req.session.processEnemyTick();
    await persistSession(req.session);
    res.json(result);
  });

  app.post("/api/crafting/attempt", requireSession, async (req, res) => {
    const { recipeId } = req.body;
    const result = req.session.craftItem(recipeId);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    await persistSession(req.session);
    res.json(result);
  });

  app.post("/api/inventory/equip", requireSession, async (req, res) => {
    const { itemId } = req.body;
    const result = req.session.equipItem(itemId);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    await persistSession(req.session);
    res.json(result);
  });

  app.post("/api/inventory/unequip", requireSession, async (req, res) => {
    const { slot } = req.body;
    const result = req.session.unequipItem(slot);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    await persistSession(req.session);
    res.json(result);
  });

  app.post("/api/rewards/claim", requireSession, async (req, res) => {
    const result = req.session.claimReward();
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    await persistSession(req.session);
    res.json(result);
  });

  app.get("/api/registry", requireSession, (req, res) => {
    res.json({ registry: req.session.getRegistrySnapshot() });
  });

  app.post("/api/registry/items", requireSession, async (req, res) => {
    const result = req.session.updateItem(req.body);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    await persistSession(req.session);
    res.json(result);
  });

  app.post("/api/registry/recipes", requireSession, async (req, res) => {
    const result = req.session.updateRecipe(req.body);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    await persistSession(req.session);
    res.json(result);
  });

  app.get("/api/trades", requireSession, (req, res) => {
    res.json({ trades: tradeManager.listTradesForUser(req.session.username) });
  });

  app.post("/api/trades/request", requireSession, async (req, res) => {
    const { targetUsername } = req.body;
    if (!targetUsername) {
      res.status(400).json({ error: "Target username is required." });
      return;
    }
    const exists = await authStore.hasUser(targetUsername);
    if (!exists) {
      res.status(404).json({ error: "Target player not found." });
      return;
    }
    const result = tradeManager.createTradeRequest({
      from: req.session.username,
      to: targetUsername.toLowerCase()
    });
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.status(201).json(result);
  });

  app.post("/api/trades/respond", requireSession, (req, res) => {
    const { tradeId, accept } = req.body;
    const result = tradeManager.respondToTrade({
      tradeId,
      username: req.session.username,
      accept: Boolean(accept)
    });
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  app.post("/api/trades/offer", requireSession, (req, res) => {
    const { tradeId, itemId, quantity } = req.body;
    if (!tradeId || !itemId || !Number.isFinite(quantity) || quantity === 0) {
      res.status(400).json({ error: "Trade id, item, and quantity are required." });
      return;
    }
    const trade = tradeManager.getTrade(tradeId);
    if (!trade) {
      res.status(404).json({ error: "Trade not found." });
      return;
    }
    const currentOffer = trade.offers?.[req.session.username] ?? {};
    const nextOffer = { ...currentOffer };
    const nextQuantity = (nextOffer[itemId] ?? 0) + quantity;
    if (nextQuantity < 0) {
      res.status(400).json({ error: "Cannot remove more items than offered." });
      return;
    }
    if (nextQuantity === 0) {
      delete nextOffer[itemId];
    } else {
      nextOffer[itemId] = nextQuantity;
    }
    if (!req.session.canAffordItems(nextOffer)) {
      res.status(400).json({ error: "Offer exceeds available inventory." });
      return;
    }
    const result = tradeManager.updateOffer({
      tradeId,
      username: req.session.username,
      items: nextOffer
    });
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ ...result, ...req.session.getSnapshot() });
  });

  app.post("/api/trades/confirm", requireSession, async (req, res) => {
    const { tradeId } = req.body;
    const result = tradeManager.setConfirmation({ tradeId, username: req.session.username });
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    if (!result.ready) {
      res.json({ ...result, ...req.session.getSnapshot() });
      return;
    }
    const trade = tradeManager.getTrade(tradeId);
    const [from, to] = trade.participants;
    const fromToken = sessionsByUser.get(from);
    const toToken = sessionsByUser.get(to);
    if (!fromToken || !toToken) {
      res.status(400).json({ error: "Both players must be online to complete trade." });
      return;
    }
    const fromSession = sessions.get(fromToken);
    const toSession = sessions.get(toToken);
    const fromOffer = trade.offers[from] ?? {};
    const toOffer = trade.offers[to] ?? {};
    const fromPreview = fromSession.previewInventoryTransaction({
      removeItems: fromOffer,
      addItems: toOffer
    });
    const toPreview = toSession.previewInventoryTransaction({
      removeItems: toOffer,
      addItems: fromOffer
    });
    if (fromPreview.error || toPreview.error) {
      res.status(400).json({ error: fromPreview.error ?? toPreview.error });
      return;
    }
    fromSession.commitInventorySnapshot(fromPreview.inventory);
    toSession.commitInventorySnapshot(toPreview.inventory);
    tradeManager.completeTrade(tradeId);
    await persistSession(fromSession);
    await persistSession(toSession);
    res.json({ trade: tradeManager.getTradeSnapshot(tradeId), ...req.session.getSnapshot() });
  });

  app.post("/api/trades/cancel", requireSession, (req, res) => {
    const { tradeId } = req.body;
    const result = tradeManager.cancelTrade({ tradeId, username: req.session.username });
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json(result);
  });

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/world-interactions/action", requireSession, (req, res) => {
    try {
      const result = resolveInteractionAction(req.body ?? {});
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/world-interactions/context-menu", requireSession, (req, res) => {
    try {
      const result = resolveContextMenu(req.body ?? {});
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/world-interactions/context-action", requireSession, (req, res) => {
    try {
      const result = resolveContextAction(req.body ?? {});
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return app;
}
