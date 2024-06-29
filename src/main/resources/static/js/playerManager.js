// playerManager.js


class PlayerManager {
    constructor() {
        console.log('PlayerManager instantiated');
    }
    updatePlayerInfo(playerId) {
        fetch(`/api/players/${playerId}`)
            .then(response => response.json())
            .then(player => {
                uiManager.updatePlayerInfoUI(player);
            });
    }

    fetchAttributes(playerId) {
        return fetch(`/api/players/${playerId}/attributes`)
            .then(response => response.json())
            .then(data => {
                attributes = data;
                uiManager.createAttributeTabs('quest');
                uiManager.createAttributeTabs('activity');
            });
    }
}

window.PlayerManager = new PlayerManager();