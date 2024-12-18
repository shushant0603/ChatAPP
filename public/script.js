const socket = io();
const registerBtn = document.getElementById('register-btn');
const usernameInput = document.getElementById('username');
const chatSection = document.getElementById('chat-section');
const userList = document.getElementById('user-list');
const chatBox = document.getElementById('chat-box');
const chatUserName = document.getElementById('chat-user-name');
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message');

let username = '';

// Register user
registerBtn.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
        socket.emit('register-user', username);
        document.getElementById('register-section').style.display = 'none';
        chatSection.classList.remove('hidden');
    }
});

// Update user list
socket.on('update-user-list', (users) => {
    userList.innerHTML = '';
    users.forEach((user) => {
        if (user !== username) {
            const userItem = document.createElement('li');
            userItem.innerText = user;
            userItem.addEventListener('click', () => openChat(user));
            userList.appendChild(userItem);
        }
    });
});

// Open chat box for selected user
function openChat(user) {
    chatBox.classList.remove('hidden');
    chatUserName.innerText = user;
}

// Send message to selected user
sendMessageBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('private-message', { message, to: chatUserName.innerText, from: username });
        displayMessage(message, 'sent');
        messageInput.value = '';
    }
});

// Display messages in chat
function displayMessage(message, type) {
    const msgElement = document.createElement('div');
    msgElement.classList.add('message', type);
    msgElement.innerText = message;
    messagesContainer.appendChild(msgElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Listen for incoming messages
socket.on('private-message', (data) => {
    if (data.to === username) {
        displayMessage(data.message, 'received');
    }
});
