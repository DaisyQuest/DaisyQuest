(() => {
    const AUTO_INIT_FLAG = '__CHAT_UI_DISABLE_AUTO_INIT__';
    let roomId = null;

    function getElements() {
        return {
            messages: document.getElementById('chatMessages'),
            input: document.getElementById('chatInput'),
            send: document.getElementById('chatSendButton'),
            status: document.getElementById('chat-status')
        };
    }

    function setStatus(text, isError = false) {
        const { status } = getElements();
        if (!status) {
            return;
        }
        status.textContent = text;
        status.classList.toggle('text-danger', isError);
    }

    function renderMessage(message) {
        const { messages } = getElements();
        if (!messages) {
            return;
        }
        const wrapper = document.createElement('div');
        wrapper.className = 'chat-message mb-2';
        const header = document.createElement('strong');
        header.textContent = message.senderId ?? 'Unknown';
        const body = document.createElement('span');
        body.className = 'ms-2';
        body.textContent = message.content ?? '';
        wrapper.appendChild(header);
        wrapper.appendChild(body);
        messages.appendChild(wrapper);
        messages.scrollTop = messages.scrollHeight;
    }

    function renderMessages(messages) {
        const { messages: container } = getElements();
        if (!container) {
            return;
        }
        container.innerHTML = '';
        (messages ?? []).forEach(renderMessage);
    }

    async function fetchDefaultRoom() {
        const response = await fetch('/api/chat/rooms/default');
        if (!response.ok) {
            throw new Error('Unable to load chat room.');
        }
        const data = await response.json();
        roomId = data.id;
    }

    async function loadMessages() {
        if (!roomId) {
            return;
        }
        const response = await fetch(`/api/chat/messages/room/${roomId}?limit=50`);
        if (!response.ok) {
            throw new Error('Unable to load messages.');
        }
        const messages = await response.json();
        renderMessages(messages.reverse());
    }

    async function sendMessage() {
        const { input } = getElements();
        const content = input?.value?.trim();
        if (!content) {
            return;
        }
        const senderId = localStorage.getItem('playerId');
        if (!senderId) {
            setStatus('Login required to chat.', true);
            return;
        }
        if (!roomId) {
            setStatus('Chat room not ready.', true);
            return;
        }

        const response = await fetch('/api/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderId,
                content,
                roomId
            })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            setStatus(payload.error || 'Failed to send message.', true);
            return;
        }
        renderMessage(payload);
        if (input) {
            input.value = '';
        }
        setStatus('Message sent.');
    }

    async function initializeChat() {
        const { send, input } = getElements();
        try {
            setStatus('Connecting...');
            await fetchDefaultRoom();
            await loadMessages();
            setStatus('Connected to global chat.');
        } catch (error) {
            setStatus(error.message, true);
        }
        send?.addEventListener('click', sendMessage);
        input?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
            }
        });
    }

    window.ChatUI = {
        initializeChat,
        renderMessage,
        renderMessages,
        setStatus
    };

    if (!window[AUTO_INIT_FLAG]) {
        document.addEventListener('DOMContentLoaded', initializeChat);
    }
})();
