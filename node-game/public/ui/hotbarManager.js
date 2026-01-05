export const DEFAULT_HOTBAR_SIZE = 4;

export function normalizeHotbarSlots(slots, size = DEFAULT_HOTBAR_SIZE) {
  const nextSlots = Array.isArray(slots) ? [...slots] : [];
  if (nextSlots.length > size) {
    nextSlots.length = size;
  }
  while (nextSlots.length < size) {
    nextSlots.push(null);
  }
  return nextSlots.map((slot) => (slot == null ? null : slot));
}

export function createHotbarState({
  slots,
  size = DEFAULT_HOTBAR_SIZE,
  isCombatLocked = () => false
} = {}) {
  let hotbarSlots = normalizeHotbarSlots(slots, size);
  let combatLocked = isCombatLocked;

  function getSlots() {
    return [...hotbarSlots];
  }

  function getSize() {
    return size;
  }

  function canEdit() {
    return !combatLocked();
  }

  function setCombatLocked(nextLocked) {
    if (typeof nextLocked === "function") {
      combatLocked = nextLocked;
    } else {
      combatLocked = () => Boolean(nextLocked);
    }
  }

  function setSlot(index, value) {
    if (!canEdit()) {
      return { error: "Combat locked." };
    }
    if (!Number.isInteger(index) || index < 0 || index >= size) {
      return { error: "Invalid slot." };
    }
    hotbarSlots = [...hotbarSlots];
    hotbarSlots[index] = value ?? null;
    return { slots: getSlots() };
  }

  function moveSlot(fromIndex, toIndex) {
    if (!canEdit()) {
      return { error: "Combat locked." };
    }
    if (
      !Number.isInteger(fromIndex) ||
      !Number.isInteger(toIndex) ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= size ||
      toIndex >= size
    ) {
      return { error: "Invalid slot." };
    }
    if (fromIndex === toIndex) {
      return { slots: getSlots() };
    }
    const nextSlots = [...hotbarSlots];
    const sourceValue = nextSlots[fromIndex] ?? null;
    nextSlots[fromIndex] = nextSlots[toIndex] ?? null;
    nextSlots[toIndex] = sourceValue;
    hotbarSlots = nextSlots;
    return { slots: getSlots() };
  }

  function replaceSlots(nextSlots) {
    hotbarSlots = normalizeHotbarSlots(nextSlots, size);
    return { slots: getSlots() };
  }

  return Object.freeze({
    getSlots,
    getSize,
    canEdit,
    setCombatLocked,
    setSlot,
    moveSlot,
    replaceSlots
  });
}

export function buildHotbarDragPayloadFromElement(element) {
  if (!element) {
    return null;
  }
  const spellId = element.dataset?.spellId;
  if (spellId) {
    return {
      source: "spellbook",
      actionId: spellId,
      book: element.dataset?.spellbook ?? ""
    };
  }
  const slotIndexRaw = element.dataset?.hotbarSlot;
  if (slotIndexRaw == null) {
    return null;
  }
  const slotIndex = Number(slotIndexRaw);
  if (!Number.isInteger(slotIndex)) {
    return null;
  }
  return { source: "hotbar", slotIndex };
}

export function parseHotbarDragPayload(dataTransfer) {
  if (!dataTransfer?.getData) {
    return null;
  }
  const raw =
    dataTransfer.getData("application/json") || dataTransfer.getData("text/plain");
  if (!raw) {
    return null;
  }
  try {
    const payload = JSON.parse(raw);
    if (!payload || typeof payload !== "object") {
      return null;
    }
    if (payload.source === "spellbook" && typeof payload.actionId === "string") {
      return payload;
    }
    if (payload.source === "hotbar" && Number.isInteger(payload.slotIndex)) {
      return payload;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export function resolveHotbarDrop({ state, payload, targetIndex }) {
  if (!state?.canEdit()) {
    return { error: "Combat locked." };
  }
  if (!Number.isInteger(targetIndex)) {
    return { error: "Invalid slot." };
  }
  if (!payload) {
    return { error: "Missing drag payload." };
  }
  if (payload.source === "spellbook") {
    return state.setSlot(targetIndex, payload.actionId);
  }
  if (payload.source === "hotbar") {
    return state.moveSlot(payload.slotIndex, targetIndex);
  }
  return { error: "Unknown drag source." };
}

export function createHotbarDragHandlers({ state, onUpdate, onReject } = {}) {
  function handleDragStart(event) {
    const payload = buildHotbarDragPayloadFromElement(event?.currentTarget);
    if (!payload || !event?.dataTransfer?.setData) {
      return;
    }
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(event) {
    const targetIndex = Number(event?.currentTarget?.dataset?.hotbarSlot);
    if (!Number.isInteger(targetIndex)) {
      return;
    }
    if (!state?.canEdit()) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const targetIndex = Number(event?.currentTarget?.dataset?.hotbarSlot);
    const payload = parseHotbarDragPayload(event?.dataTransfer);
    const result = resolveHotbarDrop({ state, payload, targetIndex });
    if (result.error) {
      onReject?.(result);
      return;
    }
    onUpdate?.(result.slots ?? []);
  }

  return Object.freeze({ handleDragStart, handleDragOver, handleDrop });
}
