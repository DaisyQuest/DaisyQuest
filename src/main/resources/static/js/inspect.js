(() => {
    const resultContainer = () => document.getElementById('inspect-results');

    function renderResult(message, payload) {
        const container = resultContainer();
        if (!container) {
            return;
        }
        container.innerHTML = '';
        if (message) {
            const msg = document.createElement('p');
            msg.className = 'text-muted';
            msg.textContent = message;
            container.appendChild(msg);
        }
        if (!payload) {
            return;
        }
        const list = document.createElement('ul');
        list.className = 'list-group';
        Object.entries(payload).forEach(([key, value]) => {
            const item = document.createElement('li');
            item.className = 'list-group-item';
            item.textContent = `${key}: ${value}`;
            list.appendChild(item);
        });
        container.appendChild(list);
    }

    function extractPlayerSummary(player) {
        return {
            Username: player.username,
            Level: player.level,
            Mana: `${player.currentMana}/${player.maxMana}`,
            Location: player.currentSubmapId
                ? `Submap ${player.currentSubmapId} (${player.submapCoordinateX}, ${player.submapCoordinateY})`
                : `World (${player.worldPositionX}, ${player.worldPositionY})`,
            Duelable: player.duelable
        };
    }

    function extractNpcSummary(npc) {
        return {
            Name: npc.name,
            Mana: `${npc.currentMana}/${npc.maxMana}`,
            Duelable: npc.duelable,
            Items: npc.items ? Object.keys(npc.items).length : 0,
            Spells: npc.spells ? npc.spells.length : 0
        };
    }

    async function requestInspection(endpoint, targetId) {
        const playerId = localStorage.getItem('playerId');
        if (!playerId) {
            renderResult('No player session found.');
            return null;
        }
        if (!targetId) {
            renderResult('Target ID is required.');
            return null;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inspectorId: playerId, targetId })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            renderResult(data.error || 'Inspection failed.');
            return null;
        }
        return data;
    }

    async function handlePlayerInspect() {
        const targetId = document.getElementById('inspect-player-id')?.value?.trim();
        const data = await requestInspection('/api/inspect/player', targetId);
        if (data?.player) {
            renderResult('Player inspection complete.', extractPlayerSummary(data.player));
        }
    }

    async function handleNpcInspect() {
        const targetId = document.getElementById('inspect-npc-id')?.value?.trim();
        const data = await requestInspection('/api/inspect/npc', targetId);
        if (data?.npcTemplate) {
            renderResult('NPC inspection complete.', extractNpcSummary(data.npcTemplate));
        }
    }

    async function handleNpcDialog() {
        const playerId = localStorage.getItem('playerId');
        const npcTemplateId = document.getElementById('inspect-npc-id')?.value?.trim();
        if (!playerId || !npcTemplateId) {
            renderResult('Provide a player session and NPC template ID to request dialog.');
            return;
        }

        const response = await fetch('/api/dialogs/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerId,
                sourceType: 'npc',
                sourceId: npcTemplateId,
                message: 'Greetings, traveler.'
            })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            renderResult(data.error || 'Dialog request failed.');
            return;
        }
        if (window.DialogUI?.showDialog) {
            window.DialogUI.showDialog(data);
        }
    }

    function bindInspectActions() {
        document.getElementById('inspect-player-button')?.addEventListener('click', handlePlayerInspect);
        document.getElementById('inspect-npc-button')?.addEventListener('click', handleNpcInspect);
        document.getElementById('inspect-npc-dialog')?.addEventListener('click', handleNpcDialog);
    }

    document.addEventListener('DOMContentLoaded', () => {
        bindInspectActions();
    });
})();
