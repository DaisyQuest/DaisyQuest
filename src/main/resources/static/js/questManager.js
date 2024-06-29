// questManager.js


class QuestManager {
    updateQuestList(attributes) {
        fetch('/api/quests')
            .then(response => response.json())
            .then(quests => {
                attributes.forEach(attr => {
                    const questList = document.getElementById(`quest-${attr}`);
                    const filteredQuests = quests.filter(quest => quest.requirements && quest.requirements[attr]);
                    questList.innerHTML = uiManager.createTaskList(filteredQuests, 'quest');
                });
            });
    }

    updateActivityList(attributes) {
        fetch('/api/activities')
            .then(response => response.json())
            .then(activities => {
                attributes.forEach(attr => {
                    const activityList = document.getElementById(`activity-${attr}`);
                    const filteredActivities = activities.filter(activity => activity.requirements && activity.requirements[attr]);
                    activityList.innerHTML = uiManager.createTaskList(filteredActivities, 'activity');
                });
            });
    }

     startQuest(questId) {
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
                startQuestTimer(quest.duration, questId)});
    }

     startActivity(activityId) {
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

     startQuestTimer(duration, questId) {
        const startTime = Date.now();
        const endTime = startTime + duration * 1000;
        const timerElement = document.getElementById('timeRemaining');
        const progressBar = document.getElementById('questProgress');

        progressBar.style.transition = 'width 0.1s linear';

        function updateTimer() {
            const currentTime = Date.now();
            const timeRemaining = Math.max(0, endTime - currentTime);
            const progress = 1 - (timeRemaining / (duration * 1000));

            timerElement.textContent = (timeRemaining / 1000).toFixed(1);
            progressBar.style.width = `${progress * 100}%`;

            if (timeRemaining > 0) {
                requestAnimationFrame(updateTimer);
            } else {
                completeQuest(questId);
            }
        }

        requestAnimationFrame(updateTimer);
    }

     completeQuest(questId) {
        fetch(`/api/quests/${questId}/complete?playerId=${playerId}`, {method: 'POST'})
            .then(response => response.json())
            .then(result => {
                alert(`Quest completed!\nExperience gained: ${result.experienceGained}\nAttribute increases: ${JSON.stringify(result.attributeIncreases)}`);
                updatePlayerInfo();
                updateQuestList();
                document.getElementById('activeTask').innerHTML = '';
            });
    }
}

window.QuestManager = new QuestManager();