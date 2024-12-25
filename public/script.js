const messageBar = document.querySelector(".bar-wrapper input");
const sendBtn = document.querySelector(".bar-wrapper button");
const messageBox = document.querySelector(".message-box");

// Test server connection on page load
async function testServerConnection() {
    try {
        const response = await fetch('/api/test');
        const data = await response.json();
        console.log('Server connection test:', data);
    } catch (error) {
        console.error('Server connection test failed:', error);
    }
}

testServerConnection();

function formatTime() {
    return new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: 'numeric',
        hour12: true 
    });
}

function createMessage(content, isUser = false) {
    const time = formatTime();
    const sanitizedContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `
        <div class="chat ${isUser ? 'message' : 'response'}">
            <div class="avatar">
                <img src="${isUser ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' : 'https://api.dicebear.com/7.x/bottts/svg?seed=chatbot'}" alt="${isUser ? 'User' : 'Bot'}">
            </div>
            <div class="message-content">
                <div class="message-info">
                    <span class="name">${isUser ? 'You' : 'Support Bot'}</span>
                    <span class="time">${time}</span>
                </div>
                <span class="message-text">${sanitizedContent}</span>
            </div>
        </div>`;
}

function createTypingIndicator() {
    return `
        <div class="chat response" id="typing-indicator">
            <div class="avatar">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=chatbot" alt="Bot">
            </div>
            <div class="message-content">
                <div class="message-info">
                    <span class="name">Support Bot</span>
                    <span class="time">${formatTime()}</span>
                </div>
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        </div>`;
}

async function sendMessage() {
    const message = messageBar.value.trim();
    if (message.length === 0) return;

    // Clear input
    messageBar.value = "";

    // Add user message
    messageBox.insertAdjacentHTML("beforeend", createMessage(message, true));
    messageBox.scrollTop = messageBox.scrollHeight;

    // Add typing indicator
    messageBox.insertAdjacentHTML("beforeend", createTypingIndicator());
    messageBox.scrollTop = messageBox.scrollHeight;

    try {
        console.log('Sending message:', message);  // Debug log
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received response:', data);  // Debug log

        // Remove typing indicator
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }

        if (data.error) {
            throw new Error(data.error);
        }

        // Add bot response
        messageBox.insertAdjacentHTML("beforeend", createMessage(data.response));
        messageBox.scrollTop = messageBox.scrollHeight;
    } catch (error) {
        console.error('Error details:', error);
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        const errorMessage = "I apologize, but I'm having trouble processing your request right now. " +
            "Please check the console for error details and ensure the server is running correctly.";
        messageBox.insertAdjacentHTML("beforeend", createMessage(errorMessage));
        messageBox.scrollTop = messageBox.scrollHeight;
    }
}

// Debounce function to prevent multiple rapid submissions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedSendMessage = debounce(sendMessage, 250);

sendBtn.addEventListener("click", debouncedSendMessage);
messageBar.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        debouncedSendMessage();
    }
});

// Make sure DOM is loaded before accessing elements
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, elements available:', {
        messageBar: !!messageBar,
        sendBtn: !!sendBtn,
        messageBox: !!messageBox
    });
});