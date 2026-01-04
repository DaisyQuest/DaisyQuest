const MINIMAP_ENTITY_STYLES = {
    SELF: { symbol: '◆', color: '#fbbf24', label: 'You' },
    PLAYER: { symbol: '●', color: '#38bdf8', label: 'Player' },
    NPC: { symbol: '▲', color: '#f97316', label: 'NPC' },
    WORLD_OBJECT: { symbol: '■', color: '#a78bfa', label: 'Object' }
};

const DEFAULT_STYLE = { symbol: '?', color: '#e2e8f0', label: 'Unknown' };

function getMinimapEntityStyle(entityType) {
    return MINIMAP_ENTITY_STYLES[entityType] || DEFAULT_STYLE;
}

function buildMinimapLegendItems() {
    return Object.entries(MINIMAP_ENTITY_STYLES).map(([type, style]) => ({
        type,
        symbol: style.symbol,
        color: style.color,
        label: style.label
    }));
}

function toggleMinimapVisibility(state, elements) {
    const nextVisible = !state.isVisible;
    state.isVisible = nextVisible;
    elements.container.classList.toggle('minimap-hidden', !nextVisible);
    elements.toggleButton.setAttribute('aria-pressed', String(nextVisible));
    elements.toggleButton.textContent = nextVisible ? 'Hide' : 'Show';
    return state;
}

function projectToMinimap(centerX, centerY, radius, entry, canvas) {
    if (radius <= 0) {
        return {
            x: canvas.width / 2,
            y: canvas.height / 2
        };
    }
    const halfWidth = canvas.width / 2;
    const halfHeight = canvas.height / 2;
    const normalizedX = (entry.x - centerX) / radius;
    const normalizedY = (entry.y - centerY) / radius;
    return {
        x: halfWidth + normalizedX * halfWidth,
        y: halfHeight + normalizedY * halfHeight
    };
}

function renderMinimap(canvas, data) {
    if (!canvas || !data) {
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

    const { centerX, centerY, radius, entries } = data;
    entries.forEach(entry => {
        const style = getMinimapEntityStyle(entry.entityType);
        const point = projectToMinimap(centerX, centerY, radius, entry, canvas);
        ctx.fillStyle = style.color;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(style.symbol, point.x, point.y);
    });
}

function renderLegend(container) {
    if (!container) {
        return;
    }
    container.innerHTML = '';
    const legendItems = buildMinimapLegendItems();
    legendItems.forEach(item => {
        const row = document.createElement('div');
        row.className = 'minimap-legend-row';
        const symbol = document.createElement('span');
        symbol.className = 'minimap-legend-symbol';
        symbol.textContent = item.symbol;
        symbol.style.color = item.color;
        const label = document.createElement('span');
        label.className = 'minimap-legend-label';
        label.textContent = item.label;
        row.appendChild(symbol);
        row.appendChild(label);
        container.appendChild(row);
    });
}

async function fetchMinimapData(playerId) {
    const response = await fetch(`/api/world-map/minimap?playerId=${encodeURIComponent(playerId)}`);
    if (!response.ok) {
        throw new Error('Failed to fetch minimap data');
    }
    return response.json();
}

function initializeMinimap() {
    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
        return;
    }

    const container = document.getElementById('minimap-panel');
    const canvas = document.getElementById('minimap-canvas');
    const toggleButton = document.getElementById('minimap-toggle');
    const legend = document.getElementById('minimap-legend');
    if (!container || !canvas || !toggleButton) {
        return;
    }

    renderLegend(legend);

    const state = { isVisible: true };
    toggleButton.setAttribute('aria-pressed', 'true');
    toggleButton.textContent = 'Hide';

    toggleButton.addEventListener('click', () => {
        toggleMinimapVisibility(state, { container, toggleButton });
    });

    const update = async () => {
        if (!state.isVisible) {
            return;
        }
        try {
            const data = await fetchMinimapData(playerId);
            renderMinimap(canvas, data);
        } catch (error) {
            console.error('Error updating minimap:', error);
        }
    };

    update();
    setInterval(update, 2000);
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeMinimap);
}

const DaisyQuestMinimap = {
    getMinimapEntityStyle,
    buildMinimapLegendItems,
    toggleMinimapVisibility
};

if (typeof window !== 'undefined') {
    window.DaisyQuestMinimap = DaisyQuestMinimap;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DaisyQuestMinimap;
}
