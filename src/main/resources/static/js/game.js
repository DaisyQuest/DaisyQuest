let playerId;

document.addEventListener('DOMContentLoaded', () => {
    playerId = localStorage.getItem('playerId');
    if (!playerId) {
        window.location.href = '/';
    } else {
        updatePlayerInfo();
        updateQuestList();
    }
});

function updatePlayerInfo() {
    fetch(`/api/players/${playerId}`)
        .then(response => response.json())
        .then(player => {
            const playerInfo = document.getElementById('playerInfo');
            playerInfo.innerHTML = `
                <h6>Player: ${player.username}</h6>
                <p>Level: ${player.level}</p>
                <p>Total Experience: ${player.totalExperience}</p>
                <h6>Attributes:</h6>
                <ul class="list-group">
                    ${Object.entries(player.attributes || {}).map(([key, value]) =>
                `<li class="list-group-item">${key}: Level ${value.level} (XP: ${value.experience})</li>`
            ).join('')}
                </ul>
            `;
        });
}

function updateQuestList() {
    fetch('/api/quests')
        .then(response => response.json())
        .then(quests => {
            const questList = document.getElementById('questList');
            questList.innerHTML = `
                <ul class="list-group">
                    ${quests.map(quest => `
                        <li class="list-group-item">
                            <h6>${quest.name}</h6>
                            <p>${quest.description}</p>
                            <div class="quest-info">
                                <strong>Rewards:</strong>
                                <ul>
                                    <li>Experience: ${quest.experienceReward}</li>
                                    ${Object.entries(quest.attributeRewards || {}).map(([attr, value]) =>
                `<li>${attr}: +${value}</li>`
            ).join('')}
                                    ${Object.entries(quest.itemRewards || {}).map(([item, quantity]) =>
                `<li>${item}: ${quantity}</li>`
            ).join('')}
                                </ul>
                                <strong>Requirements:</strong>
                                <ul>
                                    ${Object.entries(quest.requirements || {}).map(([attr, value]) =>
                `<li>${attr}: ${value}</li>`
            ).join('')}
                                </ul>
                            </div>
                            <button class="btn btn-primary btn-sm mt-2" onclick="startQuest('${quest.id}')">Start Quest</button>
                        </li>
                    `).join('')}
                </ul>
            `;
        });
}

function startQuest(questId) {
    fetch(`/api/quests/${questId}/start?playerId=${playerId}`, { method: 'POST' })
        .then(response => response.json())
        .then(quest => {
            const activeTask = document.getElementById('activeTask');
            activeTask.innerHTML = `
                <h6>${quest.name}</h6>
                <p>${quest.description}</p>
                <p>Time remaining: <span id="timeRemaining">${quest.duration.toFixed(1)}</span> seconds</p>
                <div class="progress">
                    <div id="questProgress" class="progress-bar smooth-progress" role="progressbar" style="width: 0%"></div>
                </div>
            `;
            startQuestTimer(quest.duration, questId);
        });
}

function startActivity(activityId) {
    fetch(`/api/activities/${activityId}/start?playerId=${playerId}`, { method: 'POST' })
        .then(response => response.json())
        .then(activity => {
            const activeTask = document.getElementById('activeTask');
            activeTask.innerHTML = `
                <h6>${activity.name}</h6>
                <p>${activity.description}</p>
                <p>Time remaining: <span id="timeRemaining">${activity.duration.toFixed(1)}</span> seconds</p>
                <div class="progress">
                    <div id="questProgress" class="progress-bar smooth-progress" role="progressbar" style="width: 0%"></div>
                </div>
            `;
            startQuestTimer(activity.duration, activityId);
        });
}

function startQuestTimer(duration, questId) {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;
    const timerElement = document.getElementById('timeRemaining');
    const progressBar = document.getElementById('questProgress');

    // Add transition for smoother progress bar updates
    progressBar.style.transition = 'width 0.1s linear';

    function updateTimer() {
        const currentTime = Date.now();
        const timeRemaining = Math.max(0, endTime - currentTime);
        const progress = 1 - (timeRemaining / (duration * 1000));

        // Update time remaining
        timerElement.textContent = (timeRemaining / 1000).toFixed(1);

        // Update progress bar
        progressBar.style.width = `${progress * 100}%`;

        if (timeRemaining > 0) {
            requestAnimationFrame(updateTimer);
        } else {
            completeQuest(questId);
        }
    }

    requestAnimationFrame(updateTimer);
}

function completeQuest(questId) {
    fetch(`/api/quests/${questId}/complete?playerId=${playerId}`, {method: 'POST'})
        .then(response => response.json())
        .then(result => {
            alert(`Quest completed!\nExperience gained: ${result.experienceGained}\nAttribute increases: ${JSON.stringify(result.attributeIncreases)}`);
            updatePlayerInfo();
            updateQuestList();
            document.getElementById('activeQuest').innerHTML = '';
        });

    function updateActivityList() {
        fetch('/api/activities')
            .then(response => response.json())
            .then(activities => {
                const activityList = document.getElementById('activityList');
                activityList.innerHTML = `
                <ul class="list-group">
                    ${activities.map(activity => `
                        <li class="list-group-item">
                            <h6>${activity.name}</h6>
                            <p>${activity.description}</p>
                            <div class="activity-info">
                                <strong>Rewards:</strong>
                                <ul>
                                    <li>Experience: ${activity.experienceReward}</li>
                                    ${Object.entries(activity.attributeRewards || {}).map(([attr, value]) =>
                    `<li>${attr}: +${value}</li>`
                ).join('')}
                                    ${Object.entries(activity.itemRewards || {}).map(([item, quantity]) =>
                    `<li>${item}: ${quantity}</li>`
                ).join('')}
                                </ul>
                                <strong>Requirements:</strong>
                                <ul>
                                    ${Object.entries(activity.requirements || {}).map(([attr, value]) =>
                    `<li>${attr}: ${value}</li>`
                ).join('')}
                                </ul>
                            </div>
                            <button class="btn btn-primary btn-sm mt-2" onclick="startActivity('${activity.id}')">Start Activity</button>
                        </li>
                    `).join('')}
                </ul>
            `;
            });
    }
}
    function startTaskTimer(duration, taskId, taskType) {
        let timeRemaining = duration;
        const timerElement = document.getElementById('timeRemaining');
        const progressBar = document.getElementById('taskProgress');
        const timer = setInterval(() => {
            timeRemaining--;
            timerElement.textContent = timeRemaining;
            const progressPercentage = ((duration - timeRemaining) / duration) * 100;
            progressBar.style.width = `${progressPercentage}%`;
            if (timeRemaining <= 0) {
                clearInterval(timer);
                if (taskType === 'quest') {
                    completeQuest(taskId);
                } else {
                    completeActivity(taskId);
                }
            }
        }, 1000);
    }

    function completeActivity(activityId) {
        fetch(`/api/activities/${activityId}/complete?playerId=${playerId}`, { method: 'POST' })
            .then(response => response.json())
            .then(result => {
                alert(`Activity completed!\nExperience gained: ${result.experienceReward}\nAttribute increases: ${JSON.stringify(result.attributeRewards)}`);
                updatePlayerInfo();
                updateActivityList();
                document.getElementById('activeTask').innerHTML = '';
            });
    }