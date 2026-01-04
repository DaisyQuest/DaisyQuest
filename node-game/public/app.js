import { createItemRegistry } from "./systems/itemRegistry.js";
import { initializeThemeEngine } from "./themeEngine.js";
import { createCombatMeterPanel } from "./ui/combatMeterPanel.js";
import { createFeedPanel } from "./ui/feedPanel.js";
import { createMinimapPanel } from "./ui/minimapPanel.js";
import { applyGameWorldPanelLayout, createGameWorldLayerStack } from "./ui/gameWorldPanel.js";
import { applySpriteToImage, getBattleSpriteSet } from "./ui/battleSceneAssets.js";
import { applyWorldMapPanelLayout } from "./ui/worldMapPanel.js";
import { createTabController } from "./ui/tabController.js";
import { createWorldInteractionClient } from "./ui/worldInteraction.js";
import { createWorldMapView, getSurfacePercentFromEvent } from "./ui/worldMapView.js";

const logList = document.getElementById("log");
const playerHealth = document.getElementById("player-health");
const playerHealthValue = document.getElementById("player-health-value");
const playerMana = document.getElementById("player-mana");
const playerManaValue = document.getElementById("player-mana-value");
const enemyHealth = document.getElementById("enemy-health");
const enemyHealthValue = document.getElementById("enemy-health-value");
const enemyFocus = document.getElementById("enemy-focus");
const enemyFocusValue = document.getElementById("enemy-focus-value");
const enemyFocusRow = document.getElementById("enemy-focus-row");
const npcSelect = document.getElementById("npc-select");
const npcDescription = document.getElementById("npc-description");
const enemyName = document.getElementById("enemy-name");
const battleScene = document.getElementById("battle-scene");
const battleParticles = document.getElementById("battle-particles");
const battlePlayerSprite = document.getElementById("player-battle-sprite");
const battleEnemySprite = document.getElementById("enemy-battle-sprite");
const playerCardSprite = document.getElementById("player-sprite");
const enemyCardSprite = document.getElementById("enemy-sprite");
const gameWorldPanel = document.querySelector("[data-game-world-panel]");
const gameWorldLayerStack = document.getElementById("game-world-layer-stack");
const playerStatusBanners = document.getElementById("player-status-banners");
const enemyStatusBanners = document.getElementById("enemy-status-banners");
const minimapPanelElement = document.getElementById("minimap-panel");
const minimapCanvas = document.getElementById("minimap-canvas");
const minimapLegend = document.getElementById("minimap-legend");
const minimapToggle = document.getElementById("minimap-toggle");
const worldMapPanel = document.getElementById("world-panel");
const worldMapLayout = document.querySelector(".map-layout");
const worldMapSurface = worldMapPanel?.querySelector(".world-panel__surface") ?? null;
const worldMapEntities = worldMapPanel?.querySelector("[data-world-map-entities]") ?? null;
const worldMapCoordinates =
  worldMapPanel?.querySelector("[data-world-map-coordinates]") ?? null;
const worldMapRegion = worldMapPanel?.querySelector("[data-world-map-region]") ?? null;
const captionGlobal = document.getElementById("caption-global");
const captionPlayer = document.getElementById("caption-player");
const captionEnemy = document.getElementById("caption-enemy");
const inventoryList = document.getElementById("inventory-list");
const equipmentList = document.getElementById("equipment-list");
const lootList = document.getElementById("loot-list");
const recipeSelect = document.getElementById("recipe-select");
const recipeDetails = document.getElementById("recipe-details");
const craftButton = document.getElementById("craft-button");
const craftingResult = document.getElementById("crafting-result");
const progressLevelBadge = document.getElementById("progress-level-badge");
const progressXpLabel = document.getElementById("progress-xp-label");
const progressFill = document.getElementById("progress-fill");
const progressCurrent = document.getElementById("progress-current");
const progressNext = document.getElementById("progress-next");
const milestoneList = document.getElementById("milestone-list");
const rewardDescription = document.getElementById("reward-description");
const claimRewardButton = document.getElementById("claim-reward");
const itemRegistryList = document.getElementById("item-registry-list");
const recipeRegistryList = document.getElementById("recipe-registry-list");
const itemEditor = document.getElementById("item-editor");
const recipeEditor = document.getElementById("recipe-editor");
const itemFormTitle = document.getElementById("item-form-title");
const itemFormMessage = document.getElementById("item-form-message");
const recipeFormTitle = document.getElementById("recipe-form-title");
const recipeFormMessage = document.getElementById("recipe-form-message");
const itemIdField = document.getElementById("item-id");
const itemNameField = document.getElementById("item-name");
const itemDescriptionField = document.getElementById("item-description");
const itemRarityField = document.getElementById("item-rarity");
const itemEquippableField = document.getElementById("item-equippable");
const itemSlotField = document.getElementById("item-slot");
const recipeIdField = document.getElementById("recipe-id");
const recipeNameField = document.getElementById("recipe-name");
const recipeResultField = document.getElementById("recipe-result");
const ingredientsList = document.getElementById("ingredients-list");
const newItemButton = document.getElementById("new-item");
const newRecipeButton = document.getElementById("new-recipe");
const addIngredientButton = document.getElementById("add-ingredient");
const layoutTabButtons = document.querySelectorAll(".layout-tab-button");
const layoutPanels = document.querySelectorAll("[data-tab-panel]");
const tabButtons = document.querySelectorAll(".tab-button");
const registryPanes = document.querySelectorAll(".registry-pane");
const actionButtons = Array.from(document.querySelectorAll("button.action")).filter(
  (button) => !["craft-button", "claim-reward"].includes(button.id)
);

const authStatus = document.getElementById("auth-status");
const authForm = document.getElementById("auth-form");
const authMessage = document.getElementById("auth-message");
const authUsername = document.getElementById("auth-username");
const authPassword = document.getElementById("auth-password");
const logoutButton = document.getElementById("logout-button");
const tradeRequestForm = document.getElementById("trade-request-form");
const tradeTarget = document.getElementById("trade-target");
const tradeRequestMessage = document.getElementById("trade-request-message");
const tradeList = document.getElementById("trade-list");

const API_TOKEN_KEY = "dq-auth-token";

let sessionToken = localStorage.getItem(API_TOKEN_KEY);
let profile = null;
let config = null;
let registrySnapshot = { items: [], recipes: [] };
let runtime = null;
let state = null;
let currentTrades = [];
let combatTimers = {
  globalCooldownUntil: 0,
  actionCooldowns: {},
  queuedAction: null,
  enemyNextActionAt: 0,
  loopId: null,
  enemyPollId: null
};
let pendingAction = false;
let battleSceneInitialized = false;
let worldInteractionClient = null;
const logFeed = createFeedPanel({ listElement: logList });
const lootFeed = createFeedPanel({ listElement: lootList });
const combatMeters = createCombatMeterPanel({
  playerHealth,
  playerHealthValue,
  playerMana,
  playerManaValue,
  enemyHealth,
  enemyHealthValue,
  enemyFocus,
  enemyFocusValue,
  enemyFocusRow
});
const registryTabs = createTabController({
  buttons: tabButtons,
  panels: registryPanes,
  buttonKey: "tab",
  panelKey: "pane"
});
const layoutTabs = createTabController({
  buttons: layoutTabButtons,
  panels: layoutPanels,
  buttonKey: "tabTarget",
  panelKey: "tabPanel"
});
applyGameWorldPanelLayout(gameWorldPanel);
createGameWorldLayerStack({ container: gameWorldLayerStack });
applyWorldMapPanelLayout({
  layout: worldMapLayout,
  panel: worldMapPanel,
  surface: worldMapSurface
});

const minimapPanel = createMinimapPanel({
  container: minimapPanelElement,
  canvas: minimapCanvas,
  toggleButton: minimapToggle,
  legendContainer: minimapLegend,
  fetchMinimap: () => apiRequest("/api/world/minimap")
});

const worldMapView = createWorldMapView({
  surface: worldMapSurface,
  entitiesContainer: worldMapEntities,
  coordinatesLabel: worldMapCoordinates,
  regionLabel: worldMapRegion,
  apiRequest
});

function apiRequest(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers ?? {}) };
  if (sessionToken) {
    headers.Authorization = `Bearer ${sessionToken}`;
  }
  return fetch(path, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  }).then(async (response) => {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload.error || `Request failed (${response.status}).`;
      throw new Error(message);
    }
    return payload;
  });
}

function buildRuntime(snapshot) {
  if (!config) {
    return null;
  }
  return {
    itemRegistry: createItemRegistry({
      items: snapshot.items,
      recipes: snapshot.recipes,
      lootTables: {},
      rarityColors: config.rarityColors ?? {},
      equipmentSlots: config.equipmentSlots ?? []
    })
  };
}

function applySessionSnapshot(payload) {
  if (!payload) {
    return;
  }
  if (payload.token) {
    sessionToken = payload.token;
    localStorage.setItem(API_TOKEN_KEY, sessionToken);
  }
  if (payload.profile) {
    profile = payload.profile;
  }
  if (payload.config) {
    config = payload.config;
  }
  if (payload.registry) {
    registrySnapshot = payload.registry;
  }
  if (payload.state) {
    state = {
      ...payload.state,
      claimedRewards: new Set(payload.state.claimedRewards ?? [])
    };
  }
  if (payload.timers) {
    combatTimers = {
      ...combatTimers,
      ...payload.timers
    };
  }
  if (payload.trades) {
    currentTrades = payload.trades;
  }
  if (config && registrySnapshot) {
    runtime = buildRuntime(registrySnapshot);
  }
}

function pushLog(lines) {
  logFeed.pushLines(lines);
}

function pushLoot(lines) {
  lootFeed.pushLines(lines);
}

function updateMeters() {
  combatMeters.render(state);
}

function updateBattleSceneSprites() {
  if (!state) {
    return;
  }
  const playerSprites = getBattleSpriteSet({
    combatant: state.player,
    role: "player"
  });
  const enemySprites = getBattleSpriteSet({
    combatant: state.enemy,
    role: "enemy"
  });

  applySpriteToImage(
    battlePlayerSprite,
    playerSprites.scene,
    `${state.player.name} battle sprite`
  );
  applySpriteToImage(
    playerCardSprite,
    playerSprites.portrait,
    `${state.player.name} portrait`
  );
  applySpriteToImage(
    battleEnemySprite,
    enemySprites.scene,
    `${state.enemy.name} battle sprite`
  );
  applySpriteToImage(
    enemyCardSprite,
    enemySprites.portrait,
    `${state.enemy.name} portrait`
  );
}

function applyBattleLayout(layout) {
  if (!battleScene || !layout) {
    return;
  }
  const setPercent = (variable, value) => {
    if (typeof value !== "number") {
      return;
    }
    battleScene.style.setProperty(variable, `${value}%`);
  };

  setPercent("--battle-baseline-y", layout.arenaBaseline?.yPercent);
  setPercent("--battle-player-x", layout.spritePlacement?.player?.xPercent);
  setPercent("--battle-player-y", layout.spritePlacement?.player?.yPercent);
  setPercent("--battle-enemy-x", layout.spritePlacement?.enemy?.xPercent);
  setPercent("--battle-enemy-y", layout.spritePlacement?.enemy?.yPercent);
  battleScene.style.setProperty(
    "--battle-player-scale",
    layout.spritePlacement?.player?.scale ?? 1
  );
  battleScene.style.setProperty(
    "--battle-enemy-scale",
    layout.spritePlacement?.enemy?.scale ?? 1
  );

  setPercent("--battle-player-effect-x", layout.effectBounds?.player?.xPercent);
  setPercent("--battle-player-effect-y", layout.effectBounds?.player?.yPercent);
  setPercent("--battle-player-effect-width", layout.effectBounds?.player?.widthPercent);
  setPercent("--battle-player-effect-height", layout.effectBounds?.player?.heightPercent);
  setPercent("--battle-enemy-effect-x", layout.effectBounds?.enemy?.xPercent);
  setPercent("--battle-enemy-effect-y", layout.effectBounds?.enemy?.yPercent);
  setPercent("--battle-enemy-effect-width", layout.effectBounds?.enemy?.widthPercent);
  setPercent("--battle-enemy-effect-height", layout.effectBounds?.enemy?.heightPercent);

  setPercent("--battle-caption-player-x", layout.captionZones?.player?.xPercent);
  setPercent("--battle-caption-player-y", layout.captionZones?.player?.yPercent);
  setPercent("--battle-caption-player-width", layout.captionZones?.player?.widthPercent);
  setPercent("--battle-caption-player-height", layout.captionZones?.player?.heightPercent);
  setPercent("--battle-caption-enemy-x", layout.captionZones?.enemy?.xPercent);
  setPercent("--battle-caption-enemy-y", layout.captionZones?.enemy?.yPercent);
  setPercent("--battle-caption-enemy-width", layout.captionZones?.enemy?.widthPercent);
  setPercent("--battle-caption-enemy-height", layout.captionZones?.enemy?.heightPercent);
  setPercent("--battle-caption-global-x", layout.captionZones?.global?.xPercent);
  setPercent("--battle-caption-global-y", layout.captionZones?.global?.yPercent);
  setPercent("--battle-caption-global-width", layout.captionZones?.global?.widthPercent);
  setPercent("--battle-caption-global-height", layout.captionZones?.global?.heightPercent);
}

function applyBattlePolish(polish) {
  if (!battleScene || !polish) {
    return;
  }
  const pulsing = polish.pulsingHighlights ?? {};
  if (typeof pulsing.opacity === "number") {
    battleScene.style.setProperty("--dq-battle-effect-opacity", pulsing.opacity);
  }
  if (typeof pulsing.speedMs === "number") {
    battleScene.style.setProperty("--dq-battle-effect-speed", `${pulsing.speedMs}ms`);
  }
}

function buildBattleSceneParticles() {
  if (!battleParticles || !config?.battleScene?.polish?.ambientParticles) {
    return;
  }
  battleParticles.innerHTML = "";
  const count = config.battleScene.polish.ambientParticles.count ?? 12;
  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    particle.className = "battle-particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${50 + Math.random() * 40}%`;
    particle.style.animationDelay = `${Math.random() * 4}s`;
    particle.style.animationDuration = `${4 + Math.random() * 4}s`;
    battleParticles.appendChild(particle);
  }
}

function wireParallax() {
  if (!battleScene || battleSceneInitialized) {
    return;
  }
  const layers = Array.from(battleScene.querySelectorAll(".parallax-layer"));
  const layerSpeeds = config?.battleScene?.polish?.parallaxLayers ?? [];
  const resolveSpeed = (index) => layerSpeeds[index]?.speed ?? 0.2;

  battleScene.addEventListener("mousemove", (event) => {
    const rect = battleScene.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    layers.forEach((layer, index) => {
      const speed = resolveSpeed(index);
      layer.style.setProperty("--dq-layer-x", `${x * speed * 40}px`);
      layer.style.setProperty("--dq-layer-y", `${y * speed * 40}px`);
    });
  });

  battleScene.addEventListener("mouseleave", () => {
    layers.forEach((layer) => {
      layer.style.setProperty("--dq-layer-x", "0px");
      layer.style.setProperty("--dq-layer-y", "0px");
    });
  });

  battleSceneInitialized = true;
}

function resolveStatusBanner(statusId) {
  const statuses = config?.battleScene?.overlays?.statusBanners ?? [];
  return statuses.find((status) => status.id === statusId) ?? null;
}

function showStatusBanner(target, statusId) {
  const container = target === "player" ? playerStatusBanners : enemyStatusBanners;
  if (!container) {
    return;
  }
  const status = resolveStatusBanner(statusId);
  if (!status) {
    return;
  }
  const banner = document.createElement("div");
  banner.className = "status-banner";
  banner.dataset.tone = status.tone ?? "accent";
  banner.textContent = status.label ?? statusId;
  container.appendChild(banner);
  const duration = config?.battleScene?.overlays?.durationsMs?.status ?? 2600;
  window.setTimeout(() => banner.remove(), duration);
}

function spawnHitNumber(target, text, variant = "damage") {
  const zone =
    target === "player" ? captionPlayer : target === "enemy" ? captionEnemy : captionGlobal;
  if (!zone) {
    return;
  }
  const hit = document.createElement("div");
  hit.className = "hit-number";
  if (variant === "crit") {
    hit.classList.add("hit-number--crit");
  }
  if (variant === "heal") {
    hit.classList.add("hit-number--heal");
  }
  hit.textContent = text;
  zone.appendChild(hit);
  const duration = config?.battleScene?.overlays?.durationsMs?.hit ?? 1400;
  window.setTimeout(() => hit.remove(), duration);
}

function handleBattleEvent(event) {
  if (!event) {
    return;
  }
  const rules = config?.battleScene?.overlays?.statusRules ?? [];
  rules
    .filter((rule) => rule.source === event.source && rule.action === event.action)
    .forEach((rule) => showStatusBanner(rule.target, rule.status));

  if (event.damage > 0) {
    const target = event.source === "player" ? "enemy" : "player";
    spawnHitNumber(target, `-${event.damage}`);
  } else if (event.failed) {
    const target = event.source === "player" ? "enemy" : "player";
    spawnHitNumber(target, "Miss", "crit");
  }

  if (event.healed > 0) {
    const target = event.source === "player" ? "player" : "enemy";
    spawnHitNumber(target, `+${event.healed}`, "heal");
  }
}

function clearBattleOverlays() {
  [captionGlobal, captionPlayer, captionEnemy, playerStatusBanners, enemyStatusBanners].forEach(
    (container) => {
      if (container) {
        container.innerHTML = "";
      }
    }
  );
}

function initializeBattleScene() {
  if (!config?.battleScene) {
    return;
  }
  applyBattleLayout(config.battleScene.layout);
  applyBattlePolish(config.battleScene.polish);
  buildBattleSceneParticles();
  wireParallax();
}

function initializeWorldInteractions() {
  if (worldInteractionClient || !worldMapSurface) {
    return;
  }
  worldInteractionClient = createWorldInteractionClient({
    surfaces: [worldMapSurface],
    apiRequest,
    onDecision: handleInteractionDecision,
    onContextAction: handleContextActionResult
  });
}

async function handleInteractionDecision(payload, meta) {
  if (!payload) {
    return;
  }
  const summary = describeInteractionTarget(payload.resolvedTarget);
  if (payload.action === "move") {
    const percent = getSurfacePercentFromEvent({
      event: meta?.event,
      surface: worldMapSurface
    });
    if (!percent) {
      pushLog([`You move toward ${summary}.`]);
      return;
    }
    try {
      const result = await worldMapView.moveToPercent(percent);
      const movement = result?.movement;
      if (movement?.moved) {
        pushLog([`You move toward ${summary}.`]);
      } else {
        pushLog([`You are already at (${movement?.to?.x ?? "?"}, ${movement?.to?.y ?? "?"}).`]);
      }
      minimapPanel.refresh();
    } catch (error) {
      pushLog([error.message]);
    }
    return;
  }
  if (payload.action === "interact") {
    pushLog([`You attempt to interact with ${summary}.`]);
  }
}

function handleContextActionResult(payload) {
  if (!payload) {
    return;
  }
  const summary = describeInteractionTarget(payload.resolvedTarget);
  pushLog([`Context action "${payload.selectedOption}" sent to ${summary}.`]);
}

function describeInteractionTarget(target) {
  if (!target) {
    return "the terrain";
  }
  const candidates = worldInteractionClient?.getLastCandidates?.() ?? [];
  const match = candidates.find((candidate) => candidate.id === target.id);
  return match?.label || target.id || target.type || "unknown target";
}

function updateActionButtons(now = Date.now()) {
  const gcdRemaining = Math.max(0, combatTimers.globalCooldownUntil - now);
  const combatLocked = !state || state.player.health <= 0 || state.enemy.health <= 0;

  actionButtons.forEach((button) => {
    const action = button.dataset.action;
    const baseLabel = button.dataset.baseLabel ?? button.textContent;
    const actionRemaining = Math.max(0, (combatTimers.actionCooldowns[action] ?? 0) - now);
    let suffix = "";

    if (actionRemaining > 0) {
      suffix = ` (${Math.ceil(actionRemaining / 1000)}s)`;
      button.disabled = true;
    } else {
      if (combatTimers.queuedAction === action) {
        suffix = " (queued)";
      } else if (gcdRemaining > 0) {
        suffix = ` (${Math.ceil(gcdRemaining / 1000)}s)`;
      }
      button.disabled = combatLocked;
    }

    button.textContent = `${baseLabel}${suffix}`;
  });
}

function formatOfferLines(offer) {
  const entries = Object.entries(offer ?? {});
  if (entries.length === 0) {
    return ["No items offered."];
  }
  return entries.map(([itemId, quantity]) => {
    const item = runtime?.itemRegistry.getItem(itemId);
    return `${item ? item.name : itemId} x${quantity}`;
  });
}

function buildInventoryOptions(select) {
  select.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select item";
  select.appendChild(placeholder);
  if (!state || !runtime) {
    return;
  }
  Object.entries(state.inventory ?? {}).forEach(([itemId, quantity]) => {
    if (quantity <= 0) {
      return;
    }
    const item = runtime.itemRegistry.getItem(itemId);
    const option = document.createElement("option");
    option.value = itemId;
    option.textContent = `${item ? item.name : itemId} (${quantity})`;
    select.appendChild(option);
  });
}

function renderTrades(trades) {
  tradeList.innerHTML = "";
  currentTrades = trades ?? [];
  if (!profile) {
    return;
  }
  if (!currentTrades.length) {
    const empty = document.createElement("p");
    empty.textContent = "No active trades. Invite someone to begin.";
    tradeList.appendChild(empty);
    return;
  }
  currentTrades.forEach((trade) => {
    const card = document.createElement("div");
    card.className = "trade-card";
    const other = trade.participants.find((name) => name !== profile.username) ?? "Unknown";
    card.innerHTML = `
      <div>
        <h4>Trade with ${other}</h4>
        <p class="trade-meta">Status: ${trade.status}</p>
      </div>
    `;
    const myOffer = document.createElement("div");
    myOffer.className = "trade-offer";
    const myOfferLines = formatOfferLines(trade.offers?.[profile.username]);
    myOffer.innerHTML = `
      <strong>Your Offer</strong>
      <ul>${myOfferLines.map((line) => `<li>${line}</li>`).join("")}</ul>
    `;
    const theirOffer = document.createElement("div");
    theirOffer.className = "trade-offer";
    const theirOfferLines = formatOfferLines(trade.offers?.[other]);
    theirOffer.innerHTML = `
      <strong>${other}'s Offer</strong>
      <ul>${theirOfferLines.map((line) => `<li>${line}</li>`).join("")}</ul>
    `;
    card.appendChild(myOffer);
    card.appendChild(theirOffer);

    const actions = document.createElement("div");
    actions.className = "trade-actions";

    if (trade.status === "requested" && trade.participants[1] === profile.username) {
      const acceptButton = document.createElement("button");
      acceptButton.type = "button";
      acceptButton.className = "action";
      acceptButton.textContent = "Accept";
      acceptButton.addEventListener("click", () => handleTradeRespond(trade.id, true));
      const declineButton = document.createElement("button");
      declineButton.type = "button";
      declineButton.className = "secondary";
      declineButton.textContent = "Decline";
      declineButton.addEventListener("click", () => handleTradeRespond(trade.id, false));
      actions.appendChild(acceptButton);
      actions.appendChild(declineButton);
    }

    if (trade.status === "active") {
      const form = document.createElement("form");
      form.className = "trade-form-inline";
      form.innerHTML = `
        <label>
          Item
          <select name="item"></select>
        </label>
        <label>
          Quantity
          <input name="quantity" type="number" min="1" value="1" />
        </label>
        <label>
          Action
          <select name="mode">
            <option value="add">Add</option>
            <option value="remove">Remove</option>
          </select>
        </label>
        <button class="secondary" type="submit">Update Offer</button>
      `;
      const select = form.querySelector("select[name='item']");
      buildInventoryOptions(select);
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const itemId = select.value;
        const quantity = Number(form.querySelector("input[name='quantity']").value);
        const mode = form.querySelector("select[name='mode']").value;
        if (!itemId || !Number.isFinite(quantity) || quantity <= 0) {
          pushLog(["Select an item and quantity."]);
          return;
        }
        handleTradeOffer(trade.id, itemId, mode === "remove" ? -quantity : quantity);
      });
      card.appendChild(form);

      const confirmButton = document.createElement("button");
      confirmButton.type = "button";
      confirmButton.className = "action";
      confirmButton.textContent = trade.confirmations?.[profile.username]
        ? "Confirmed"
        : "Confirm Trade";
      confirmButton.disabled = Boolean(trade.confirmations?.[profile.username]);
      confirmButton.addEventListener("click", () => handleTradeConfirm(trade.id));
      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.className = "secondary";
      cancelButton.textContent = "Cancel";
      cancelButton.addEventListener("click", () => handleTradeCancel(trade.id));
      actions.appendChild(confirmButton);
      actions.appendChild(cancelButton);
    }

    if (actions.childElementCount > 0) {
      card.appendChild(actions);
    }
    tradeList.appendChild(card);
  });
}

async function refreshTrades() {
  if (!sessionToken) {
    return;
  }
  try {
    const payload = await apiRequest("/api/trades");
    renderTrades(payload.trades ?? []);
  } catch (error) {
    pushLog([error.message]);
  }
}

async function handleTradeRequest(targetUsername) {
  try {
    const payload = await apiRequest("/api/trades/request", {
      method: "POST",
      body: { targetUsername }
    });
    tradeRequestMessage.textContent = "Trade request sent.";
    tradeRequestMessage.classList.remove("error");
    renderTrades([...currentTrades, payload.trade]);
  } catch (error) {
    tradeRequestMessage.textContent = error.message;
    tradeRequestMessage.classList.add("error");
  }
}

async function handleTradeRespond(tradeId, accept) {
  try {
    const payload = await apiRequest("/api/trades/respond", {
      method: "POST",
      body: { tradeId, accept }
    });
    renderTrades(
      currentTrades.map((trade) => (trade.id === payload.trade.id ? payload.trade : trade))
    );
  } catch (error) {
    pushLog([error.message]);
  }
}

async function handleTradeOffer(tradeId, itemId, quantity) {
  try {
    const payload = await apiRequest("/api/trades/offer", {
      method: "POST",
      body: { tradeId, itemId, quantity }
    });
    applySessionSnapshot(payload);
    renderTrades(
      currentTrades.map((trade) => (trade.id === payload.trade.id ? payload.trade : trade))
    );
    renderInventory();
  } catch (error) {
    pushLog([error.message]);
  }
}

async function handleTradeConfirm(tradeId) {
  try {
    const payload = await apiRequest("/api/trades/confirm", {
      method: "POST",
      body: { tradeId }
    });
    applySessionSnapshot(payload);
    await refreshTrades();
    renderInventory();
  } catch (error) {
    pushLog([error.message]);
  }
}

async function handleTradeCancel(tradeId) {
  try {
    const payload = await apiRequest("/api/trades/cancel", {
      method: "POST",
      body: { tradeId }
    });
    renderTrades(
      currentTrades.map((trade) => (trade.id === payload.trade.id ? payload.trade : trade))
    );
  } catch (error) {
    pushLog([error.message]);
  }
}

function populateNpcSelect() {
  npcSelect.innerHTML = "";
  (config?.npcs ?? []).forEach((npc, index) => {
    const option = document.createElement("option");
    option.value = npc.id;
    option.textContent = npc.name;
    if (index === 0) {
      option.selected = true;
    }
    npcSelect.appendChild(option);
  });
}

function getSelectedNpc() {
  return (config?.npcs ?? []).find((npc) => npc.id === npcSelect.value) ?? config?.npcs?.[0];
}

function renderInventory() {
  inventoryList.innerHTML = "";
  if (!state || !runtime) {
    return;
  }
  const entries = Object.entries(state.inventory ?? {});
  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Your satchel is empty.";
    inventoryList.appendChild(empty);
    return;
  }
  entries.forEach(([itemId, quantity]) => {
    const item = runtime.itemRegistry.getItem(itemId);
    const row = document.createElement("div");
    row.className = "inventory-item";
    const rarityColor = item ? runtime.itemRegistry.getRarityColor(item.rarity) : "#fff";
    row.innerHTML = `
      <div class="inventory-item-main">
        <span class="inventory-item-name" style="color: ${rarityColor};"></span>
        <span class="inventory-item-quantity">x${quantity}</span>
      </div>
      <p class="inventory-item-description">${item ? item.description : "No description"}</p>
      <div class="inventory-item-actions"></div>
    `;
    row.querySelector(".inventory-item-name").textContent = item ? item.name : "Unknown Item";
    const actions = row.querySelector(".inventory-item-actions");
    if (item?.equippable) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "secondary";
      button.textContent = "Equip";
      button.addEventListener("click", async () => {
        try {
          const payload = await apiRequest("/api/inventory/equip", {
            method: "POST",
            body: { itemId }
          });
          applySessionSnapshot(payload);
          pushLog(payload.log);
          renderInventory();
          renderEquipment();
        } catch (error) {
          pushLog([error.message]);
        }
      });
      actions.appendChild(button);
    }
    inventoryList.appendChild(row);
  });
  renderTrades(currentTrades);
}

function renderEquipment() {
  equipmentList.innerHTML = "";
  if (!state || !config || !runtime) {
    return;
  }
  (config.equipmentSlots ?? []).forEach((slot) => {
    const wrapper = document.createElement("div");
    wrapper.className = "equipment-slot";
    const equippedId = state.equipment?.[slot];
    const item = equippedId ? runtime.itemRegistry.getItem(equippedId) : null;
    wrapper.innerHTML = `
      <div class="equipment-slot-header">
        <span class="equipment-slot-name">${slot.replace("_", " ")}</span>
        <span class="equipment-slot-item">${item ? item.name : "Empty"}</span>
      </div>
    `;
    if (item) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "secondary";
      button.textContent = "Unequip";
      button.addEventListener("click", async () => {
        try {
          const payload = await apiRequest("/api/inventory/unequip", {
            method: "POST",
            body: { slot }
          });
          applySessionSnapshot(payload);
          pushLog(payload.log);
          renderInventory();
          renderEquipment();
        } catch (error) {
          pushLog([error.message]);
        }
      });
      wrapper.appendChild(button);
    }
    equipmentList.appendChild(wrapper);
  });
}

function populateRecipes() {
  recipeSelect.innerHTML = "";
  registrySnapshot.recipes.forEach((recipe, index) => {
    const option = document.createElement("option");
    option.value = recipe.id;
    option.textContent = recipe.name;
    if (index === 0) {
      option.selected = true;
    }
    recipeSelect.appendChild(option);
  });
}

function renderRecipeDetails() {
  if (!runtime) {
    recipeDetails.textContent = "Select a recipe to see ingredients.";
    return;
  }
  const recipe = runtime.itemRegistry.getRecipe(recipeSelect.value);
  if (!recipe) {
    recipeDetails.textContent = "Select a recipe to see ingredients.";
    return;
  }
  const ingredients = Object.entries(recipe.ingredients)
    .map(([itemId, amount]) => {
      const item = runtime.itemRegistry.getItem(itemId);
      return `${item ? item.name : itemId} x${amount}`;
    })
    .join(", ");
  const result = runtime.itemRegistry.getItem(recipe.resultItemId);
  recipeDetails.textContent = `${result ? result.name : "Unknown"} requires ${ingredients}.`;
}

async function attemptCraft() {
  const recipeId = recipeSelect.value;
  try {
    const payload = await apiRequest("/api/crafting/attempt", {
      method: "POST",
      body: { recipeId }
    });
    applySessionSnapshot(payload);
    craftingResult.textContent = payload.log?.[0] ?? "Crafting complete.";
    pushLog(payload.log);
    renderInventory();
    renderProgression();
  } catch (error) {
    craftingResult.textContent = error.message;
  }
}

async function resetBattle() {
  const npc = getSelectedNpc();
  if (!npc) {
    return;
  }
  logList.innerHTML = "";
  lootList.innerHTML = "";
  clearBattleOverlays();
  try {
    const payload = await apiRequest("/api/battle/reset", {
      method: "POST",
      body: { npcId: npc.id }
    });
    applySessionSnapshot(payload);
    enemyName.textContent = npc.name;
    npcDescription.textContent = npc.description;
    pushLog(payload.log);
    updateMeters();
    updateBattleSceneSprites();
    updateActionButtons();
    startCombatLoop();
  } catch (error) {
    pushLog([error.message]);
  }
}

function renderProgression() {
  if (!state || !config) {
    return;
  }
  const { level, currentXp, nextLevelXp, progress, totalXp } = state.progression;
  progressLevelBadge.textContent = `Level ${level}`;
  progressXpLabel.textContent = `${totalXp} XP`;
  progressFill.style.width = `${progress * 100}%`;
  progressCurrent.textContent = `${currentXp} / ${nextLevelXp} XP`;
  const nextMilestone = (config.rewardMilestones ?? []).find((reward) => reward.level > level);
  progressNext.textContent = nextMilestone
    ? `Next reward at Level ${nextMilestone.level}`
    : "All rewards claimed";

  milestoneList.innerHTML = "";
  (config.rewardMilestones ?? []).forEach((milestone) => {
    const li = document.createElement("li");
    const claimed = state.claimedRewards.has(milestone.level);
    li.textContent = `Level ${milestone.level}: ${milestone.label} ${
      claimed ? "(claimed)" : ""
    }`;
    milestoneList.appendChild(li);
  });

  if (state.pendingReward) {
    rewardDescription.textContent = `Ready to claim: ${state.pendingReward.label}.`;
    claimRewardButton.disabled = false;
  } else {
    rewardDescription.textContent = "Win and craft to unlock your next reward.";
    claimRewardButton.disabled = true;
  }
}

async function claimReward() {
  try {
    const payload = await apiRequest("/api/rewards/claim", { method: "POST" });
    applySessionSnapshot(payload);
    pushLog(payload.log);
    renderInventory();
    renderProgression();
  } catch (error) {
    pushLog([error.message]);
  }
}

function renderRegistryItems() {
  itemRegistryList.innerHTML = "";
  registrySnapshot.items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "registry-card";
    card.innerHTML = `
      <h5>${item.name}</h5>
      <p>${item.description}</p>
      <p>Rarity: ${item.rarity}</p>
    `;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary";
    button.textContent = "Edit";
    button.addEventListener("click", () => populateItemForm(item));
    card.appendChild(button);
    itemRegistryList.appendChild(card);
  });
}

function renderRegistryRecipes() {
  recipeRegistryList.innerHTML = "";
  registrySnapshot.recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "registry-card";
    const ingredients = Object.entries(recipe.ingredients)
      .map(([itemId, amount]) => `${itemId} x${amount}`)
      .join(", ");
    card.innerHTML = `
      <h5>${recipe.name}</h5>
      <p>Result: ${recipe.resultItemId}</p>
      <p>Ingredients: ${ingredients}</p>
    `;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary";
    button.textContent = "Edit";
    button.addEventListener("click", () => populateRecipeForm(recipe));
    card.appendChild(button);
    recipeRegistryList.appendChild(card);
  });
}

function populateItemForm(item) {
  itemFormMessage.textContent = "";
  itemFormMessage.classList.remove("error");
  if (item) {
    itemFormTitle.textContent = `Edit ${item.name}`;
    itemIdField.value = item.id;
    itemIdField.disabled = true;
    itemNameField.value = item.name;
    itemDescriptionField.value = item.description;
    itemRarityField.value = item.rarity;
    itemEquippableField.checked = Boolean(item.equippable);
    itemSlotField.value = item.equipmentSlotTypeString || "";
  } else {
    itemFormTitle.textContent = "Create Item";
    itemIdField.value = "";
    itemIdField.disabled = false;
    itemNameField.value = "";
    itemDescriptionField.value = "";
    itemRarityField.value = "";
    itemEquippableField.checked = false;
    itemSlotField.value = "";
  }
}

function populateRecipeForm(recipe) {
  recipeFormMessage.textContent = "";
  recipeFormMessage.classList.remove("error");
  if (recipe) {
    recipeFormTitle.textContent = `Edit ${recipe.name}`;
    recipeIdField.value = recipe.id;
    recipeIdField.disabled = true;
    recipeNameField.value = recipe.name;
    recipeResultField.value = recipe.resultItemId;
    ingredientsList.innerHTML = "";
    Object.entries(recipe.ingredients).forEach(([itemId, amount]) => {
      addIngredientRow(itemId, amount);
    });
  } else {
    recipeFormTitle.textContent = "Create Recipe";
    recipeIdField.value = "";
    recipeIdField.disabled = false;
    recipeNameField.value = "";
    recipeResultField.value = "";
    ingredientsList.innerHTML = "";
    addIngredientRow();
  }
}

function addIngredientRow(selectedId = "", amount = 1) {
  const row = document.createElement("div");
  row.className = "ingredient-row";
  const select = document.createElement("select");
  registrySnapshot.items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    if (item.id === selectedId) {
      option.selected = true;
    }
    select.appendChild(option);
  });
  const quantity = document.createElement("input");
  quantity.type = "number";
  quantity.min = "1";
  quantity.value = String(amount);
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "secondary";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => row.remove());
  row.appendChild(select);
  row.appendChild(quantity);
  row.appendChild(remove);
  ingredientsList.appendChild(row);
}

function refreshRuntime() {
  runtime = buildRuntime(registrySnapshot);
  populateRecipes();
  renderRecipeDetails();
  renderInventory();
  renderEquipment();
  renderTrades(currentTrades);
  renderRegistryItems();
  renderRegistryRecipes();
  populateRecipeResultOptions();
}

function populateRarityOptions() {
  itemRarityField.innerHTML = '<option value="">Select rarity</option>';
  Object.keys(config?.rarityColors ?? {}).forEach((rarity) => {
    const option = document.createElement("option");
    option.value = rarity;
    option.textContent = rarity;
    itemRarityField.appendChild(option);
  });
}

function populateSlotOptions() {
  itemSlotField.innerHTML = '<option value="">Select slot</option>';
  (config?.equipmentSlots ?? []).forEach((slot) => {
    const option = document.createElement("option");
    option.value = slot;
    option.textContent = slot.replace("_", " ");
    itemSlotField.appendChild(option);
  });
}

function populateRecipeResultOptions() {
  recipeResultField.innerHTML = '<option value="">Select item</option>';
  registrySnapshot.items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    recipeResultField.appendChild(option);
  });
}

itemEditor.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    id: itemIdField.value.trim(),
    name: itemNameField.value.trim(),
    description: itemDescriptionField.value.trim(),
    rarity: itemRarityField.value,
    equippable: itemEquippableField.checked,
    equipmentSlotTypeString: itemEquippableField.checked ? itemSlotField.value : ""
  };
  try {
    const result = await apiRequest("/api/registry/items", { method: "POST", body: payload });
    registrySnapshot = result.registry;
    itemFormMessage.textContent = "Item saved.";
    itemFormMessage.classList.remove("error");
    refreshRuntime();
  } catch (error) {
    itemFormMessage.textContent = error.message;
    itemFormMessage.classList.add("error");
  }
});

recipeEditor.addEventListener("submit", async (event) => {
  event.preventDefault();
  const ingredients = {};
  ingredientsList.querySelectorAll(".ingredient-row").forEach((row) => {
    const selects = row.querySelectorAll("select");
    const inputs = row.querySelectorAll("input");
    const itemId = selects[0].value;
    const amount = Number(inputs[0].value);
    ingredients[itemId] = amount;
  });
  const payload = {
    id: recipeIdField.value.trim(),
    name: recipeNameField.value.trim(),
    resultItemId: recipeResultField.value,
    ingredients
  };
  try {
    const result = await apiRequest("/api/registry/recipes", { method: "POST", body: payload });
    registrySnapshot = result.registry;
    recipeFormMessage.textContent = "Recipe saved.";
    recipeFormMessage.classList.remove("error");
    refreshRuntime();
  } catch (error) {
    recipeFormMessage.textContent = error.message;
    recipeFormMessage.classList.add("error");
  }
});

newItemButton.addEventListener("click", () => populateItemForm(null));
newRecipeButton.addEventListener("click", () => populateRecipeForm(null));
addIngredientButton.addEventListener("click", () => addIngredientRow());
claimRewardButton.addEventListener("click", claimReward);

function wireTabs() {
  registryTabs.wire();
}

function wireLayoutTabs() {
  layoutTabs.wire();
}

async function executePlayerAction(action) {
  if (pendingAction) {
    return;
  }
  pendingAction = true;
  try {
    const payload = await apiRequest("/api/battle/action", { method: "POST", body: { action } });
    applySessionSnapshot(payload);
    pushLog(payload.log);
    pushLoot(payload.loot);
    handleBattleEvent(payload.battleEvent);
    updateMeters();
    renderInventory();
    renderProgression();
  } catch (error) {
    pushLog([error.message]);
  } finally {
    pendingAction = false;
  }
}

function queueAction(action) {
  if (!state || state.player.health <= 0 || state.enemy.health <= 0) {
    return;
  }
  const now = Date.now();
  if (!config?.actions?.[action]) {
    pushLog([`${state.player.name} fumbles an unfamiliar action.`]);
    return;
  }
  if ((combatTimers.actionCooldowns[action] ?? 0) > now) {
    pushLog([`${config.actions[action].label} is recharging.`]);
    return;
  }
  if (combatTimers.globalCooldownUntil > now) {
    combatTimers.queuedAction = action;
    pushLog([`${config.actions[action].label} queued.`]);
    updateActionButtons(now);
    return;
  }
  executePlayerAction(action);
  updateActionButtons(now);
}

async function pollEnemyAction() {
  try {
    const payload = await apiRequest("/api/battle/tick", { method: "POST" });
    applySessionSnapshot(payload);
    handleBattleEvent(payload.battleEvent);
    if (payload.log?.length) {
      pushLog(payload.log);
      updateMeters();
      renderProgression();
    }
    updateActionButtons();
  } catch (error) {
    pushLog([error.message]);
  }
}

function processCombatTick() {
  const now = Date.now();
  if (combatTimers.queuedAction && now >= combatTimers.globalCooldownUntil) {
    const queued = combatTimers.queuedAction;
    if ((combatTimers.actionCooldowns[queued] ?? 0) <= now) {
      combatTimers.queuedAction = null;
      executePlayerAction(queued);
    }
  }
  updateActionButtons(now);
}

function startCombatLoop() {
  if (combatTimers.loopId) {
    return;
  }
  combatTimers.loopId = window.setInterval(processCombatTick, 250);
  combatTimers.enemyPollId = window.setInterval(pollEnemyAction, 900);
}

function updateAuthStatus(profile) {
  if (profile) {
    authStatus.textContent = `Signed in as ${profile.username}`;
    logoutButton.disabled = false;
  } else {
    authStatus.textContent = "Offline";
    logoutButton.disabled = true;
  }
}

function updateActionLabels() {
  actionButtons.forEach((button) => {
    const action = button.dataset.action;
    const label = config?.actions?.[action]?.label ?? button.textContent;
    button.dataset.baseLabel = label;
    button.textContent = label;
  });
}

async function bootstrapSession() {
  if (!sessionToken) {
    return false;
  }
  try {
    const payload = await apiRequest("/api/bootstrap");
    applySessionSnapshot(payload);
    updateAuthStatus(payload.profile);
    return true;
  } catch (error) {
    localStorage.removeItem(API_TOKEN_KEY);
    sessionToken = null;
    updateAuthStatus(null);
    authMessage.textContent = error.message;
    authMessage.classList.add("error");
    return false;
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const mode = event.submitter?.dataset.mode ?? "login";
  authMessage.textContent = "";
  authMessage.classList.remove("error");
  try {
    const payload = await apiRequest(`/api/auth/${mode}`, {
      method: "POST",
      body: { username: authUsername.value.trim(), password: authPassword.value }
    });
    applySessionSnapshot(payload);
    updateAuthStatus(payload.profile);
    initializeGameUI();
  } catch (error) {
    authMessage.textContent = error.message;
    authMessage.classList.add("error");
  }
}

async function handleLogout() {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } finally {
    localStorage.removeItem(API_TOKEN_KEY);
    sessionToken = null;
    profile = null;
    config = null;
    runtime = null;
    state = null;
    currentTrades = [];
    tradeList.innerHTML = "";
    minimapPanel.stop();
    worldMapView.stop();
    updateAuthStatus(null);
    if (worldInteractionClient) {
      worldInteractionClient.destroy();
      worldInteractionClient = null;
    }
  }
}

function initializeGameUI() {
  if (!config || !state) {
    return;
  }
  populateNpcSelect();
  if (state.enemy.id) {
    npcSelect.value = state.enemy.id;
  }
  updateActionLabels();
  populateRarityOptions();
  populateSlotOptions();
  populateRecipeResultOptions();
  wireTabs();
  wireLayoutTabs();
  layoutTabs.setActive("battle");
  populateRecipes();
  renderRecipeDetails();
  populateItemForm(null);
  populateRecipeForm(null);
  renderRegistryItems();
  renderRegistryRecipes();
  renderProgression();
  renderInventory();
  renderEquipment();
  refreshTrades();
  npcDescription.textContent = getSelectedNpc()?.description ?? "";
  enemyName.textContent = state.enemy.name;
  initializeBattleScene();
  initializeWorldInteractions();
  updateBattleSceneSprites();
  updateMeters();
  updateActionButtons();
  startCombatLoop();
  minimapPanel.start();
  worldMapView.start();
}

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    queueAction(button.dataset.action);
  });
});

document.getElementById("reset").addEventListener("click", resetBattle);
npcSelect.addEventListener("change", resetBattle);
recipeSelect.addEventListener("change", renderRecipeDetails);
craftButton.addEventListener("click", attemptCraft);

authForm.addEventListener("submit", handleAuthSubmit);
logoutButton.addEventListener("click", handleLogout);
tradeRequestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  tradeRequestMessage.textContent = "";
  tradeRequestMessage.classList.remove("error");
  const target = tradeTarget.value.trim();
  if (!target) {
    tradeRequestMessage.textContent = "Enter a player name.";
    tradeRequestMessage.classList.add("error");
    return;
  }
  handleTradeRequest(target);
  tradeTarget.value = "";
});

initializeThemeEngine();

bootstrapSession().then((ready) => {
  if (ready) {
    initializeGameUI();
  }
});
