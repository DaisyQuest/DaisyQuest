export const INTERACTION_TYPES = Object.freeze({
  PLAYER: "player",
  NPC: "npc",
  OBJECT: "object",
  TERRAIN: "terrain"
});

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
        layer: Number.parseInt(element.dataset.interactionLayer ?? "0", 10) || 0
      });
    });
  });
  return targets;
}

export function resolveInteractionCandidates({ point, targets, includeTerrain = true }) {
  const candidates = targets
    .filter((target) => isPointInsideRect(point, target.element.getBoundingClientRect()))
    .map((target) => ({
      id: target.id,
      type: target.type,
      layer: target.layer,
      label: target.label
    }))
    .sort((a, b) => b.layer - a.layer);

  if (includeTerrain) {
    candidates.push({
      id: "terrain",
      type: INTERACTION_TYPES.TERRAIN,
      layer: 0,
      label: "terrain"
    });
  }

  return candidates;
}

export function createWorldInteractionClient({
  surfaces,
  apiRequest,
  onDecision,
  onContextAction
}) {
  const targetSurfaces = Array.isArray(surfaces) ? surfaces : [surfaces];
  let lastCandidates = [];
  let contextMenu = null;

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
      onDecision?.(payload);
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
      document.body.appendChild(contextMenu);
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
    contextMenu.style.left = `${position.x}px`;
    contextMenu.style.top = `${position.y}px`;
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
    return resolveInteractionCandidates({ point, targets });
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
