class CombatManager {
    startCombat() {
        console.log('Starting combat');
        fetch('/api/combat/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerIds: [playerId, 'AI1', 'AI2'], playerTeams: {} })
        })
            .then(response => response.json())
            .then(combat => {
                console.log('Combat started:', combat);
                currentCombatId = combat.id;
                this.updateCombatUI(combat);
                document.getElementById('combatLobby').style.display = 'none';
                document.getElementById('combatArea').style.display = 'block';
                this.fetchPlayerSpells();
                this.pollCombatStatus();
            })
            .catch(error => console.error('Error starting combat:', error));
    }

    fetchPlayerSpells() {
        fetch(`/api/players/${playerId}/spells`)
            .then(response => response.json())
            .then(spells => {
                playerSpells = spells;
            })
            .catch(error => console.error('Error fetching player spells:', error));
    }

    pollCombatStatus() {
        if (!currentCombatId) {
            console.log('No active combat to poll');
            return;
        }

        console.log('Polling combat status for:', currentCombatId);
        fetch(`/api/combat/${currentCombatId}`)
            .then(response => response.json())
            .then(combat => {
                console.log('Received combat update:', combat);
                if (combat.active) {
                    this.updateCombatUI(combat);
                    setTimeout(() => this.pollCombatStatus(), 2000);
                } else {
                    console.log('Combat ended');
                    this.showCombatResults(combat);
                }
            })
            .catch(error => {
                console.error('Error polling combat status:', error);
                setTimeout(() => this.pollCombatStatus(), 2000);
            });
    }

    updateCombatUI(combat) {
        console.log('Updating combat UI:', combat);
        uiManager.updateCombatInfo(combat);
        uiManager.updateSpellCooldowns(combat, playerSpells);
        uiManager.updateActionButtons(combat, playerId);
        uiManager.updateSelectionVisibility(combat, playerId);
    }

     performAction(actionType) {
        selectedAction = actionType;
        const spellSelection = document.getElementById('spellSelection');
        const targetSelection = document.getElementById('targetSelection');

        spellSelection.style.display = 'none';
        targetSelection.style.display = 'none';

        if (actionType === 'SPELL') {
            spellSelection.style.display = 'block';
            updateSpellSelection();
            updateSpellInfo();
        } else {
            updateTargetSelection();
            targetSelection.style.display = 'block';
        }
    }
     handleSpellSelection() {
        const spellId = document.getElementById('spellSelect').value;
        selectedSpell = playerSpells.find(spell => spell.id === spellId);
        updateSpellInfo();
        document.getElementById('targetSelection').style.display = 'block';
        updateTargetSelection();
    }

     updateSpellSelection() {
        const spellSelect = document.getElementById('spellSelect');
        spellSelect.innerHTML = '';
        playerSpells.forEach(spell => {
            const option = document.createElement('option');
            option.value = spell.id;
            option.textContent = spell.name;
            spellSelect.appendChild(option);
        });
        updateSpellInfo();
    }

     updateSpellInfo() {
        const spellId = document.getElementById('spellSelect').value;
        selectedSpell = playerSpells.find(spell => spell.id === spellId);

        if (selectedSpell) {
            document.getElementById('spellInfoName').textContent = selectedSpell.name;
            document.getElementById('spellInfoDescription').textContent = selectedSpell.description;
            document.getElementById('spellInfoManaCost').textContent = `Mana Cost: ${selectedSpell.manaCost}`;
            document.getElementById('spellInfoCooldown').textContent = `Cooldown: ${selectedSpell.cooldown} turns`;
        }
    }
     updateTargetSelection() {
        const targetSelect = document.getElementById('targetSelect');
        targetSelect.innerHTML = '';

        fetch(`/api/combat/${currentCombatId}`)
            .then(response => response.json())
            .then(combat => {
                combat.playerIds.forEach(id => {
                    if (id !== playerId && combat.playerHealth[id] > 0) {
                        const option = document.createElement('option');
                        option.value = id;
                        option.textContent = id;
                        targetSelect.appendChild(option);
                    }
                });
            })
            .catch(error => console.error('Error updating target selection:', error));
    }
     confirmAction() {
        const targetPlayerId = document.getElementById('targetSelect').value;
        if (!targetPlayerId) {
            alert('Please select a target.');
            return;
        }

        let actionData = {
            playerId: playerId,
            type: selectedAction,
            targetPlayerId: targetPlayerId,
            actionPoints: 1
        };

        if (selectedAction === 'SPELL') {
            if (!selectedSpell) {
                alert('Please select a spell.');
                return;
            }
            actionData.spellId = selectedSpell.id;
        }

        fetch(`/api/combat/${currentCombatId}/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actionData)
        })
            .then(response => response.json())
            .then(updatedCombat => {
                updateCombatUI(updatedCombat);
                document.getElementById('spellSelection').style.display = 'none';
                document.getElementById('targetSelection').style.display = 'none';
                if (!updatedCombat.active) {
                    showCombatResults(updatedCombat);
                }
            })
            .catch(error => console.error('Error performing action:', error));

        selectedSpell = null;
    }

     showCombatResults(combat) {
        document.getElementById('combatArea').style.display = 'none';
        document.getElementById('combatResults').style.display = 'block';
        const resultsDiv = document.getElementById('combatResults');
        resultsDiv.innerHTML = `
        <h2>Combat Ended</h2>
        <p>Winner: ${determineWinner(combat)}</p>
        <p>Final Health:</p>
        <ul>
            ${Object.entries(combat.playerHealth).map(([id, health]) =>` <li>${id}: ${health}</li>`).join('')
        }
        </ul>
        <button onclick="returnToLobby()">Return to Lobby</button> 
        `
    }

     determineWinner(combat) {
        return Object.entries(combat.playerHealth)
            .find(([id, health]) => health > 0)[0];
    }

     returnToLobby() {
        currentCombatId = null;
        document.getElementById('combatResults').style.display = 'none';
        document.getElementById('combatLobby').style.display = 'block';
    }

     endCombat() {
        currentCombatId = null;
        document.getElementById('combatResults').style.display = 'none';
        document.getElementById('combatArea').style.display = 'none';
        document.getElementById('combatLobby').style.display = 'block';
        updatePlayerInfo();
    }

     updateTurnTimer(startTime, duration) {
        const timerElement = document.getElementById('turnTimer');
        const updateTimer = () => {
            const now = Date.now();
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            const remainingSeconds = Math.max(0, duration - elapsedSeconds);
            timerElement.textContent = remainingSeconds;
            if (remainingSeconds > 0) {
                setTimeout(updateTimer, 1000);
            }
        };
        updateTimer();
    }
}

window.CombatManager = new CombatManager();
