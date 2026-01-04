import crypto from "crypto";

export const TRADE_STATUS = Object.freeze({
  REQUESTED: "requested",
  ACTIVE: "active",
  DECLINED: "declined",
  CANCELLED: "cancelled",
  COMPLETED: "completed"
});

function normalizeItems(items) {
  if (!items || typeof items !== "object") {
    return {};
  }
  return Object.fromEntries(
    Object.entries(items)
      .filter(([, quantity]) => Number.isFinite(quantity) && quantity > 0)
      .map(([itemId, quantity]) => [itemId, Math.floor(quantity)])
  );
}

function buildTradeSnapshot(trade) {
  return {
    id: trade.id,
    status: trade.status,
    participants: [...trade.participants],
    offers: {
      [trade.participants[0]]: { ...trade.offers[trade.participants[0]] },
      [trade.participants[1]]: { ...trade.offers[trade.participants[1]] }
    },
    confirmations: { ...trade.confirmations },
    createdAt: trade.createdAt,
    updatedAt: trade.updatedAt
  };
}

export function createTradeManager({ nowFn = Date.now } = {}) {
  const trades = new Map();

  function getTrade(tradeId) {
    return trades.get(tradeId) ?? null;
  }

  function getTradeSnapshot(tradeId) {
    const trade = trades.get(tradeId);
    return trade ? buildTradeSnapshot(trade) : null;
  }

  function listTradesForUser(username) {
    return Array.from(trades.values())
      .filter((trade) => trade.participants.includes(username))
      .map((trade) => buildTradeSnapshot(trade));
  }

  function createTradeRequest({ from, to }) {
    if (!from || !to) {
      return { error: "Both participants are required." };
    }
    if (from === to) {
      return { error: "Cannot trade with yourself." };
    }
    const id = crypto.randomUUID();
    const now = nowFn();
    const trade = {
      id,
      status: TRADE_STATUS.REQUESTED,
      participants: [from, to],
      offers: {
        [from]: {},
        [to]: {}
      },
      confirmations: {
        [from]: false,
        [to]: false
      },
      createdAt: now,
      updatedAt: now
    };
    trades.set(id, trade);
    return { trade: buildTradeSnapshot(trade) };
  }

  function respondToTrade({ tradeId, username, accept }) {
    const trade = trades.get(tradeId);
    if (!trade) {
      return { error: "Trade not found." };
    }
    if (trade.status !== TRADE_STATUS.REQUESTED) {
      return { error: "Trade is not awaiting a response." };
    }
    if (trade.participants[1] !== username) {
      return { error: "Only the invited player can respond." };
    }
    trade.status = accept ? TRADE_STATUS.ACTIVE : TRADE_STATUS.DECLINED;
    trade.updatedAt = nowFn();
    return { trade: buildTradeSnapshot(trade) };
  }

  function updateOffer({ tradeId, username, items }) {
    const trade = trades.get(tradeId);
    if (!trade) {
      return { error: "Trade not found." };
    }
    if (trade.status !== TRADE_STATUS.ACTIVE) {
      return { error: "Trade is not active." };
    }
    if (!trade.participants.includes(username)) {
      return { error: "Player not part of this trade." };
    }
    trade.offers[username] = normalizeItems(items);
    trade.confirmations = {
      [trade.participants[0]]: false,
      [trade.participants[1]]: false
    };
    trade.updatedAt = nowFn();
    return { trade: buildTradeSnapshot(trade) };
  }

  function setConfirmation({ tradeId, username }) {
    const trade = trades.get(tradeId);
    if (!trade) {
      return { error: "Trade not found." };
    }
    if (trade.status !== TRADE_STATUS.ACTIVE) {
      return { error: "Trade is not active." };
    }
    if (!trade.participants.includes(username)) {
      return { error: "Player not part of this trade." };
    }
    trade.confirmations[username] = true;
    trade.updatedAt = nowFn();
    const ready =
      trade.confirmations[trade.participants[0]] && trade.confirmations[trade.participants[1]];
    return { trade: buildTradeSnapshot(trade), ready };
  }

  function cancelTrade({ tradeId, username }) {
    const trade = trades.get(tradeId);
    if (!trade) {
      return { error: "Trade not found." };
    }
    if (!trade.participants.includes(username)) {
      return { error: "Player not part of this trade." };
    }
    if (![TRADE_STATUS.REQUESTED, TRADE_STATUS.ACTIVE].includes(trade.status)) {
      return { error: "Trade cannot be cancelled." };
    }
    trade.status = TRADE_STATUS.CANCELLED;
    trade.updatedAt = nowFn();
    return { trade: buildTradeSnapshot(trade) };
  }

  function completeTrade(tradeId) {
    const trade = trades.get(tradeId);
    if (!trade) {
      return { error: "Trade not found." };
    }
    trade.status = TRADE_STATUS.COMPLETED;
    trade.updatedAt = nowFn();
    return { trade: buildTradeSnapshot(trade) };
  }

  return Object.freeze({
    getTrade,
    getTradeSnapshot,
    listTradesForUser,
    createTradeRequest,
    respondToTrade,
    updateOffer,
    setConfirmation,
    cancelTrade,
    completeTrade
  });
}
