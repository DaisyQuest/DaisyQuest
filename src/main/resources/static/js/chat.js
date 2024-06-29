let stompClient = null;
let username = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded. Checking for chat initialization...');
    initializeChatWhenReady();
});

function initializeChatWhenReady() {
    const usernameElement = document.getElementById('username');
    if (usernameElement && usernameElement.textContent) {
        username = usernameElement.textContent;
        console.log('Username found:', username);
        initializeChat();
    } else {
        console.log('Username element not found or empty. Attempting to fetch player data...');
        fetchPlayerData();
    }
}

function fetchPlayerData() {
    const playerId = localStorage.getItem('playerId');
    if (!playerId) {
        console.error('Player ID not found in localStorage');
        setTimeout(initializeChatWhenReady, 1000);
        return;
    }

    fetch(`/api/players/${playerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(player => {
            if (player && player.username) {
                username = player.username;
                console.log('Username fetched:', username);
                initializeChat();
            } else {
                console.error('Invalid player data received');
                setTimeout(initializeChatWhenReady, 1000);
            }
        })
        .catch(error => {
            console.error('Error fetching player data:', error);
            setTimeout(initializeChatWhenReady, 1000);        });
}

function initializeChat() {
    console.log('Initializing chat for user:', username);
    connectWebSocket();
}

function connectWebSocket() {
    console.log('Attempting to connect to WebSocket');
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = function(str) {
        console.log('STOMP Debug:', str);
    };
    stompClient.connect({}, onConnected, onError);
}

function onConnected() {
    console.log('Connected to WebSocket');
    stompClient.subscribe('/topic/public', onMessageReceived);
    const joinMessage = {
        senderId: username,
        type: 'JOIN'
    };
    console.log('Sending join message:', joinMessage);
    stompClient.send("/app/chat.addUser", {}, JSON.stringify(joinMessage));
}
function onError(error) {
    console.error('WebSocket Error:', error);
    setTimeout(connectWebSocket, 5000);
}

function onMessageReceived(payload) {
    console.log('Raw message received:', payload);
    if (!payload.body) {
        console.error('Received payload with no body');
        return;
    }

    try {
        console.log('Attempting to parse payload body:', payload.body);
        const message = safeJSONParse(payload.body);
        if (message) {
            console.log('Successfully parsed message:', message);
            displayMessage(message);
        } else {
            console.error('Failed to parse message body');
        }
    } catch (error) {
        console.error('Error in onMessageReceived:', error);
    }
}

function displayMessage(message) {
    console.log('Displaying message:', message);
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
        console.error('Chat messages container not found');
        return;
    }

    const messageElement = document.createElement('div');

    if (message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.senderId + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.senderId + ' left!';
    } else {
        messageElement.classList.add('chat-message');

        const avatarElement = document.createElement('span');
        const avatarText = document.createTextNode(message.senderId[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.senderId);

        messageElement.appendChild(avatarElement);

        const usernameElement = document.createElement('span');
        const usernameText = document.createTextNode(message.senderId);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    const textElement = document.createElement('p');
    const messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendChatMessage() {
    const messageInput = document.getElementById('chatInput');
    const messageContent = messageInput.value.trim();

    if (messageContent && stompClient) {
        const chatMessage = {
            senderId: username,
            content: messageContent,
            type: 'CHAT'
        };

        console.log('Sending chat message:', chatMessage);
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
}

function getAvatarColor(messageSender) {
    let hash = 0;
    for (let i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
}

const colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

// Utility function to safely parse JSON
function safeJSONParse(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        console.error('JSON Parse Error:', e);
        console.log('Failed to parse:', str);
        return null;
    }
}