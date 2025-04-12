// chatLogic.js

// // Any references to your localCurrentPlayer if needed:
// let localCurrentPlayer = null; // We'll fill this from an external reference
//
// // Or a function to set localCurrentPlayer from outside, if needed
// export function setLocalCurrentPlayer(player) {
//     localCurrentPlayer = player;
// }

// This function updates the UI with a new chat message
function addChatMessage(username, message) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    const messageElement = document.createElement('p');
    messageElement.innerHTML = `<strong>${username}:</strong> ${message}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// When Enter is pressed in the #chat-input, post a message
function handleChatInputKeypress(event) {
    if (event.key === 'Enter') {
        const input = event.target;
        const message = input.value.trim();
        if (message !== '') {
            // Send to server (in real code) or just local for now
            addChatMessage(localCurrentPlayer ? localCurrentPlayer.username : 'Anonymous', message);
            input.value = '';
        }
    }
}

// Initialize chat functionality by attaching event listeners
function initChat() {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', handleChatInputKeypress);
    } else {
        console.warn('Chat input (#chat-input) not found in DOM.');
    }
}

// Optional: if you want to directly expose addChatMessage globally
window.initChat = initChat
