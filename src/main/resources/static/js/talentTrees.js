let playerTalents = {};
let availableTalentPoints = 0;

function initializeTalentTrees() {
    fetch(`/api/players/${playerId}`)
        .then(response => response.json())
        .then(data => {
            playerTalents = data.player.talents || {};
            availableTalentPoints = data.player.talentPointsAvailable || 0;
            renderTalentTrees();
        })
        .catch(error => console.error('Error fetching player data:', error));
}

function renderTalentTrees() {
    const container = document.getElementById('talentTreesContainer');
    container.innerHTML = '';

    const talentTrees = [
        { name: 'Combat', talents: ['CRITICAL_STRIKE', 'DODGE'] },
        { name: 'Magic', talents: ['FIREBALL_MASTERY', 'ICEBALL_MASTERY', 'THUNDER_MASTERY', 'SPELL_POWER'] },
        { name: 'Utility', talents: ['RESOURCE_EFFICIENCY', 'EXTRA_LOOT', 'MANA_REGENERATION', 'HEALTH_BOOST'] }
    ];

    talentTrees.forEach(tree => {
        const treeElement = document.createElement('div');
        treeElement.className = 'talent-tree';
        treeElement.innerHTML = `<h6>${tree.name}</h6>`;

        tree.talents.forEach(talent => {
            const talentElement = document.createElement('div');
            talentElement.className = 'talent';
            const level = playerTalents[talent] || 0;
            talentElement.innerHTML = `
                <img src="/sprites/talents/${talent.toLowerCase()}.svg" alt="${talent}" class="talent-sprite">
                <div class="talent-info">
                    <span class="talent-name">${talent.replace(/_/g, ' ')}</span>
                    <span class="talent-level">Level: ${level}</span>
                </div>
                <button onclick="upgradeTalent('${talent}')" ${availableTalentPoints > 0 ? '' : 'disabled'}>Upgrade</button>
            `;
            treeElement.appendChild(talentElement);
        });

        container.appendChild(treeElement);
    });

    document.getElementById('availableTalentPoints').textContent = availableTalentPoints;
}

function upgradeTalent(talent) {
    if (availableTalentPoints > 0) {
        fetch(`/api/players/${playerId}/talents/${talent}`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                playerTalents = data.talents;
                availableTalentPoints = data.talentPointsAvailable;
                renderTalentTrees();
            })
            .catch(error => console.error('Error upgrading talent:', error));
    }
}

// Call this function when the Talent Trees tab is shown
document.getElementById('talent-trees-tab').addEventListener('shown.bs.tab', initializeTalentTrees);