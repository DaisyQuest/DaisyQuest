export const INTERACTION_TYPES = Object.freeze({
  PLAYER: "player",
  NPC: "npc",
  OBJECT: "object",
  TERRAIN: "terrain"
});

const DEFAULT_INTERACTION_RADIUS = 0.14;

export function collectInteractionTargets(surfaces) {
  const targets = [];
  surfaces.forEach((surface) => {
    if (!surface) {
      return;
    }
    surface.querySelectorAll("[data-interaction-type]").forEach((element) => {
      const type = element.dataset.interactionType;
      if (!type) {
        return;
      }
      targets.push({
        element,
        id: element.dataset.interactionId ?? "",
        label: element.dataset.interactionLabel ?? element.textContent?.trim() ?? "",
        type,
        layer: Number.parseInt(element.dataset.interactionLayer ?? "0", 10) || 0,
        isHostile: element.dataset.interactionHostile === "true",
        xPercent: parsePercent(element.dataset.interactionXPercent),
        yPercent: parsePercent(element.dataset.interactionYPercent),
        range: parsePercent(element.dataset.interactionRadius)
      });
    });
  });
  return targets;
}

export function resolveInteractionCandidates({
  point,
  targets,
  surface,
  includeTerrain = true,
  maxDistance = DEFAULT_INTERACTION_RADIUS
}) {
  const pointPercent = resolvePointPercent(point, surface);
  const candidates = targets
    .map((target) => resolveCandidate(target, point, pointPercent, maxDistance))
    .filter(Boolean)
    .sort((a, b) => {
      if (b.layer !== a.layer) {
        return b.layer - a.layer;
      }
      const distanceA = a.distance ?? Number.POSITIVE_INFINITY;
      const distanceB = b.distance ?? Number.POSITIVE_INFINITY;
      return distanceA - distanceB;
    });

  if (includeTerrain) {
    candidates.push({
      id: "terrain",
      type: INTERACTION_TYPES.TERRAIN,
      layer: 0,
      label: "terrain",
      distance: null
    });
  }

  return candidates;
}

export function createWorldInteractionClient({
  surfaces,
  apiRequest,
  onDecision,
  onContextAction,
  contextMenuContainer,
  interactionRange = DEFAULT_INTERACTION_RADIUS
}) {
  const targetSurfaces = Array.isArray(surfaces) ? surfaces : [surfaces];
  let lastCandidates = [];
  let contextMenu = null;
  const resolvedContextMenuContainer = resolveContextMenuContainer(contextMenuContainer);

  function handlePrimaryClick(event) {
    if (!isValidSurfaceTarget(event.target)) {
      return;
    }
    const candidates = buildCandidatesFromEvent(event);
    lastCandidates = candidates;
    apiRequest("/api/world-interactions/action", {
      method: "POST",
      body: {
        clickType: "primary",
        candidates
      }
    }).then((payload) => {
      onDecision?.(payload, {
        event,
        candidates,
        point: { x: event.clientX, y: event.clientY },
        surface: event.currentTarget
      });
    });
  }

  function handleContextMenu(event) {
    if (!isValidSurfaceTarget(event.target)) {
      return;
    }
    event.preventDefault();
    const candidates = buildCandidatesFromEvent(event);
    lastCandidates = candidates;
    apiRequest("/api/world-interactions/context-menu", {
      method: "POST",
      body: { candidates }
    }).then((payload) => {
      renderContextMenu(payload?.options ?? [], { x: event.clientX, y: event.clientY });
    });
  }

  function handleContextAction(option) {
    if (!option) {
      return;
    }
    apiRequest("/api/world-interactions/context-action", {
      method: "POST",
      body: {
        option,
        candidates: lastCandidates
      }
    }).then((payload) => {
      onContextAction?.(payload);
      hideContextMenu();
    });
  }

  function renderContextMenu(options, position) {
    if (!contextMenu) {
      contextMenu = document.createElement("div");
      contextMenu.className = "context-menu";
      resolvedContextMenuContainer.appendChild(contextMenu);
    }
    contextMenu.innerHTML = "";
    const list = document.createElement("ul");
    list.className = "context-menu__list";
    options.forEach((option) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "context-menu__option";
      button.textContent = formatOptionLabel(option);
      button.addEventListener("click", () => handleContextAction(option));
      item.appendChild(button);
      list.appendChild(item);
    });
    contextMenu.appendChild(list);
    const menuPosition = resolveContextMenuPosition(position, resolvedContextMenuContainer);
    contextMenu.style.left = `${menuPosition.x}px`;
    contextMenu.style.top = `${menuPosition.y}px`;
    contextMenu.style.display = options.length ? "block" : "none";
  }

  function hideContextMenu() {
    if (!contextMenu) {
      return;
    }
    contextMenu.style.display = "none";
    contextMenu.innerHTML = "";
  }

  function buildCandidatesFromEvent(event) {
    const targets = collectInteractionTargets(targetSurfaces);
    const point = { x: event.clientX, y: event.clientY };
    return resolveInteractionCandidates({
      point,
      targets,
      surface: event.currentTarget,
      maxDistance: interactionRange
    });
  }

  function isValidSurfaceTarget(target) {
    return targetSurfaces.some((surface) => surface && surface.contains(target));
  }

  function handleDocumentClick(event) {
    if (contextMenu && !contextMenu.contains(event.target)) {
      hideContextMenu();
    }
  }

  targetSurfaces.forEach((surface) => {
    if (!surface) {
      return;
    }
    surface.addEventListener("click", handlePrimaryClick);
    surface.addEventListener("contextmenu", handleContextMenu);
  });

  document.addEventListener("click", handleDocumentClick);

  return {
    destroy() {
      targetSurfaces.forEach((surface) => {
        if (!surface) {
          return;
        }
        surface.removeEventListener("click", handlePrimaryClick);
        surface.removeEventListener("contextmenu", handleContextMenu);
      });
      document.removeEventListener("click", handleDocumentClick);
      hideContextMenu();
      if (contextMenu) {
        contextMenu.remove();
        contextMenu = null;
      }
    },
    getLastCandidates() {
      return lastCandidates;
    },
    getContextMenu() {
      return contextMenu;
    }
  };
}

function isPointInsideRect(point, rect) {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

function formatOptionLabel(option) {
  if (!option) {
    return "";
  }
  return option.charAt(0).toUpperCase() + option.slice(1);
}

function resolveContextMenuContainer(container) {
  if (container && container.nodeType === 1) {
    return container;
  }
  return document.body;
}

function resolveContextMenuPosition(position, container) {
  if (!container || container === document.body) {
    return position;
  }
  const rect = container.getBoundingClientRect?.() ?? { left: 0, top: 0 };
  return {
    x: position.x - rect.left,
    y: position.y - rect.top
  };
}

function parsePercent(value) {
  if (value == null || value === "") {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function resolvePointPercent(point, surface) {
  if (!point || !surface?.getBoundingClientRect) {
    return null;
  }
  const rect = surface.getBoundingClientRect();
  if (!rect?.width || !rect?.height) {
    return null;
  }
  return {
    xPercent: clamp((point.x - rect.left) / rect.width, 0, 1),
    yPercent: clamp((point.y - rect.top) / rect.height, 0, 1)
  };
}

function resolveCandidate(target, point, pointPercent, maxDistance) {
  if (!target) {
    return null;
  }
  let matches = false;
  let distance = null;

  if (
    pointPercent &&
    Number.isFinite(target.xPercent) &&
    Number.isFinite(target.yPercent)
  ) {
    distance = Math.hypot(
      pointPercent.xPercent - target.xPercent,
      pointPercent.yPercent - target.yPercent
    );
    const range = Number.isFinite(target.range) ? target.range : maxDistance;
    matches = distance <= range;
  } else if (target.element?.getBoundingClientRect && point) {
    matches = isPointInsideRect(point, target.element.getBoundingClientRect());
  }

  if (!matches) {
    return null;
  }

  return {
    id: target.id,
    type: target.type,
    layer: target.layer,
    label: target.label,
    isHostile: Boolean(target.isHostile),
    distance
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
