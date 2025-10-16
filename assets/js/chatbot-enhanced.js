// Enhanced AI Chatbot voor Yannova Ramen en Deuren met WebSocket en Supabase integratie
class YannovaChatbotEnhanced {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.sessionId = this.generateSessionId();
        this.isTyping = false;
        this.lastMessageId = null;
        this.apiBaseUrl = window.location.origin + '/api';
        this.retryCount = 0;
        this.maxRetries = 3;
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.init();
    }

    init() {
        this.createChatbotHTML();
        this.bindEvents();
        this.loadChatHistory();
        this.sendWelcomeMessage();
        this.initWebSocket();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    initWebSocket() {
        try {
            this.socket = io();

            this.socket.on('connect', () => {

                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateConnectionStatus('connected');
            });

            this.socket.on('disconnect', () => {

                this.isConnected = false;
                this.updateConnectionStatus('disconnected');
                this.attemptReconnect();
            });

            this.socket.on('connect_error', (error) => {
                console.error('WebSocket connection error:', error);
                this.isConnected = false;
                this.updateConnectionStatus('error');
            });

            // Listen for real-time updates
            this.socket.on('chat-update', (data) => {
                if (data.sessionId === this.sessionId) {
                    this.handleRealTimeUpdate(data);
                }
            });

            this.socket.on('admin-message', (data) => {
                this.handleAdminMessage(data);
            });

        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            this.updateConnectionStatus('error');
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                `);
                this.initWebSocket();
            }, 2000 * this.reconnectAttempts);
        }
    }

    updateConnectionStatus(status) {
        const statusIndicator = document.getElementById('connection-status');
        if (statusIndicator) {
            statusIndicator.className = `connection-status ${status}`;
            statusIndicator.title = this.getStatusMessage(status);
        }
    }

    getStatusMessage(status) {
        const messages = {
            connected: 'Verbonden met server',
            disconnected: 'Verbinding verbroken',
            error: 'Verbindingsfout'
        };
        return messages[status] || 'Onbekende status';
    }

    createChatbotHTML() {
        const chatbotHTML = `
            <div id="yannova-chatbot" class="chatbot-container">
                <div class="chatbot-toggle" id="chatbot-toggle">
                    <i class="fas fa-comments"></i>
                    <span class="notification-badge" id="notification-badge" style="display: none;">1</span>
                    <div class="connection-status" id="connection-status" title="Verbinding status"></div>
                </div>
                <div class="chatbot-window" id="chatbot-window">
                    <div class="chatbot-header">
                        <div class="chatbot-title">
                            <i class="fas fa-home"></i>
                            <span>Yannova Assistent</span>
                            <div class="typing-indicator-small" id="typing-indicator-small" style="display: none;">
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                                <div class="typing-dot"></div>
                            </div>
                        </div>
                        <div class="chatbot-controls">
                            <button class="chatbot-minimize" id="chatbot-minimize" title="Minimaliseren">
                                <i class="fas fa-minus"></i>
                            </button>
                            <button class="chatbot-close" id="chatbot-close" title="Sluiten">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="chatbot-messages" id="chatbot-messages">
                        <!-- Messages will be inserted here -->
                    </div>
                    <div class="chatbot-input-container">
                        <div class="quick-actions" id="quick-actions">
                            <button class="quick-action-btn" data-action="offerte">
                                <i class="fas fa-calculator"></i>
                                <span>Offerte</span>
                            </button>
                            <button class="quick-action-btn" data-action="contact">
                                <i class="fas fa-phone"></i>
                                <span>Contact</span>
                            </button>
                            <button class="quick-action-btn" data-action="openingstijden">
                                <i class="fas fa-clock"></i>
                                <span>Tijden</span>
                            </button>
                            <button class="quick-action-btn" data-action="garantie">
                                <i class="fas fa-shield-alt"></i>
                                <span>Garantie</span>
                            </button>
                        </div>
                        <div class="chatbot-input-wrapper">
                            <input type="text" id="chatbot-input" placeholder="Stel uw vraag..." maxlength="500" autocomplete="off">
                            <button id="chatbot-send" title="Verstuur bericht">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                        <div class="chatbot-footer">
                            <span class="message-count" id="message-count">0 berichten</span>
                            <button class="clear-history-btn" id="clear-history-btn" title="Geschiedenis wissen">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
        this.addChatbotStyles();
    }

    addChatbotStyles() {
        const styles = `
            <style>
                .chatbot-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 10000;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .chatbot-toggle {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #d4a574, #b8935f);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
                    transition: all 0.3s ease;
                    position: relative;
                }

                .chatbot-toggle:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(212, 165, 116, 0.4);
                }

                .chatbot-toggle i {
                    color: #1a1a1a;
                    font-size: 24px;
                }

                .notification-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #e74c3c;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }

                .connection-status {
                    position: absolute;
                    bottom: -5px;
                    right: -5px;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 2px solid white;
                }

                .connection-status.connected {
                    background: #27ae60;
                }

                .connection-status.disconnected {
                    background: #e74c3c;
                }

                .connection-status.error {
                    background: #f39c12;
                }

                .chatbot-window {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 380px;
                    height: 600px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    border: 1px solid #e0e0e0;
                }

                .chatbot-window.open {
                    display: flex;
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .chatbot-header {
                    background: linear-gradient(135deg, #2c3e50, #34495e);
                    color: white;
                    padding: 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .chatbot-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 600;
                }

                .chatbot-title i {
                    color: #d4a574;
                }

                .typing-indicator-small {
                    display: flex;
                    gap: 3px;
                    margin-left: 10px;
                }

                .typing-indicator-small .typing-dot {
                    width: 4px;
                    height: 4px;
                    background: #d4a574;
                    border-radius: 50%;
                    animation: typingSmall 1.4s infinite;
                }

                .typing-indicator-small .typing-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-indicator-small .typing-dot:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes typingSmall {
                    0%, 60%, 100% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-5px);
                    }
                }

                .chatbot-controls {
                    display: flex;
                    gap: 5px;
                }

                .chatbot-minimize,
                .chatbot-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 5px;
                    border-radius: 50%;
                    transition: background 0.3s;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .chatbot-minimize:hover,
                .chatbot-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .chatbot-messages {
                    flex: 1;
                    padding: 15px;
                    overflow-y: auto;
                    background: #f8f9fa;
                    scroll-behavior: smooth;
                }

                .message {
                    margin-bottom: 15px;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    animation: messageSlide 0.3s ease;
                }

                @keyframes messageSlide {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .message.user {
                    flex-direction: row-reverse;
                }

                .message.user .message-content {
                    background: linear-gradient(135deg, #d4a574, #b8935f);
                    color: #1a1a1a;
                }

                .message.bot .message-content {
                    background: white;
                    color: #333;
                    border: 1px solid #e0e0e0;
                }

                .message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    flex-shrink: 0;
                }

                .message.user .message-avatar {
                    background: #d4a574;
                    color: #1a1a1a;
                }

                .message.bot .message-avatar {
                    background: #2c3e50;
                    color: white;
                }

                .message-content {
                    max-width: 80%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    font-size: 14px;
                    line-height: 1.4;
                    word-wrap: break-word;
                }

                .message-time {
                    font-size: 11px;
                    color: #999;
                    margin-top: 5px;
                    text-align: right;
                }

                .typing-indicator {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 12px 16px;
                    background: white;
                    border-radius: 18px;
                    border: 1px solid #e0e0e0;
                    max-width: 80px;
                }

                .typing-dot {
                    width: 6px;
                    height: 6px;
                    background: #999;
                    border-radius: 50%;
                    animation: typing 1.4s infinite;
                }

                .typing-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-dot:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes typing {
                    0%, 60%, 100% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-10px);
                    }
                }

                .quick-actions {
                    padding: 12px 15px;
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    background: #f8f9fa;
                    border-bottom: 1px solid #e0e0e0;
                }

                .quick-action-btn {
                    background: white;
                    border: 1px solid #e0e0e0;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    flex: 1;
                    min-width: 0;
                }

                .quick-action-btn:hover {
                    background: #d4a574;
                    color: white;
                    border-color: #d4a574;
                    transform: translateY(-1px);
                }

                .quick-action-btn i {
                    font-size: 10px;
                }

                .chatbot-input-wrapper {
                    padding: 15px;
                    display: flex;
                    gap: 10px;
                    background: white;
                    border-top: 1px solid #e0e0e0;
                }

                #chatbot-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 1px solid #ddd;
                    border-radius: 25px;
                    outline: none;
                    font-size: 14px;
                    transition: border-color 0.3s;
                }

                #chatbot-input:focus {
                    border-color: #d4a574;
                }

                #chatbot-send {
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #d4a574, #b8935f);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }

                #chatbot-send:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
                }

                #chatbot-send:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                .chatbot-footer {
                    padding: 8px 15px;
                    background: #f8f9fa;
                    border-top: 1px solid #e0e0e0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    color: #666;
                }

                .message-count {
                    font-weight: 500;
                }

                .clear-history-btn {
                    background: none;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.3s;
                }

                .clear-history-btn:hover {
                    color: #e74c3c;
                    background: rgba(231, 76, 60, 0.1);
                }

                /* Scrollbar styling */
                .chatbot-messages::-webkit-scrollbar {
                    width: 6px;
                }

                .chatbot-messages::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }

                .chatbot-messages::-webkit-scrollbar-thumb {
                    background: #d4a574;
                    border-radius: 3px;
                }

                .chatbot-messages::-webkit-scrollbar-thumb:hover {
                    background: #b8935f;
                }

                @media (max-width: 480px) {
                    .chatbot-window {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 120px);
                        bottom: 80px;
                        right: 20px;
                        left: 20px;
                    }

                    .quick-action-btn span {
                        display: none;
                    }

                    .quick-action-btn {
                        min-width: 40px;
                        justify-content: center;
                    }
                }

                /* Dark mode support */
                @media (prefers-color-scheme: dark) {
                    .chatbot-window {
                        background: #2c3e50;
                        border-color: #34495e;
                    }

                    .chatbot-messages {
                        background: #34495e;
                    }

                    .message.bot .message-content {
                        background: #2c3e50;
                        color: #ecf0f1;
                        border-color: #34495e;
                    }

                    .quick-actions {
                        background: #34495e;
                        border-color: #2c3e50;
                    }

                    .quick-action-btn {
                        background: #2c3e50;
                        color: #ecf0f1;
                        border-color: #34495e;
                    }

                    .chatbot-input-wrapper {
                        background: #2c3e50;
                        border-color: #34495e;
                    }

                    #chatbot-input {
                        background: #34495e;
                        color: #ecf0f1;
                        border-color: #34495e;
                    }

                    .chatbot-footer {
                        background: #34495e;
                        border-color: #2c3e50;
                        color: #bdc3c7;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    bindEvents() {
        const toggle = document.getElementById('chatbot-toggle');
        const close = document.getElementById('chatbot-close');
        const minimize = document.getElementById('chatbot-minimize');
        const input = document.getElementById('chatbot-input');
        const send = document.getElementById('chatbot-send');
        const quickActions = document.querySelectorAll('.quick-action-btn');
        const clearHistory = document.getElementById('clear-history-btn');

        toggle.addEventListener('click', () => this.toggleChatbot());
        close.addEventListener('click', () => this.closeChatbot());
        minimize.addEventListener('click', () => this.minimizeChatbot());
        send.addEventListener('click', () => this.sendMessage());
        clearHistory.addEventListener('click', () => this.clearHistory());

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        input.addEventListener('input', () => {
            this.updateSendButton();
        });

        quickActions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('.quick-action-btn').getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });

        // Auto-resize input
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        });
    }

    toggleChatbot() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbot-window');
        const badge = document.getElementById('notification-badge');

        if (this.isOpen) {
            window.classList.add('open');
            badge.style.display = 'none';
            document.getElementById('chatbot-input').focus();
        } else {
            window.classList.remove('open');
        }
    }

    minimizeChatbot() {
        this.isOpen = false;
        document.getElementById('chatbot-window').classList.remove('open');
    }

    closeChatbot() {
        this.isOpen = false;
        document.getElementById('chatbot-window').classList.remove('open');
    }

    updateSendButton() {
        const input = document.getElementById('chatbot-input');
        const send = document.getElementById('chatbot-send');
        const hasText = input.value.trim().length > 0;

        send.disabled = !hasText || this.isTyping;
        send.style.opacity = hasText && !this.isTyping ? '1' : '0.5';
    }

    sendWelcomeMessage() {
        const welcomeMessage = {
            text: "Hallo! Ik ben de Yannova assistent. Hoe kan ik u vandaag helpen met uw ramen en deuren?",
            timestamp: new Date()
        };
        this.addMessage(welcomeMessage, 'bot');
    }

    addMessage(message, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? 'U' : 'Y';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message.text;

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = new Date().toLocaleTimeString('nl-NL', {
            hour: '2-digit',
            minute: '2-digit'
        });

        content.appendChild(time);
        messageElement.appendChild(avatar);
        messageElement.appendChild(content);
        messagesContainer.appendChild(messageElement);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store message
        this.messages.push({
            ...message,
            sender,
            timestamp: new Date()
        });

        // Update message count
        this.updateMessageCount();

        // Save to localStorage
        this.saveChatHistory();
    }

    updateMessageCount() {
        const count = this.messages.length;
        document.getElementById('message-count').textContent = `${count} bericht${count !== 1 ? 'en' : ''}`;
    }

    showTypingIndicator() {
        if (this.isTyping) return;

        this.isTyping = true;
        const messagesContainer = document.getElementById('chatbot-messages');
        const typingElement = document.createElement('div');
        typingElement.className = 'message bot typing-indicator';
        typingElement.id = 'typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = 'Y';

        const dots = document.createElement('div');
        dots.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

        typingElement.appendChild(avatar);
        typingElement.appendChild(dots);
        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Show typing indicator in header
        document.getElementById('typing-indicator-small').style.display = 'flex';
    }

    hideTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
        this.isTyping = false;
        document.getElementById('typing-indicator-small').style.display = 'none';
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();

        if (!message || this.isTyping) return;

        // Add user message
        this.addMessage({ text: message }, 'user');
        input.value = '';
        this.updateSendButton();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send message to API
            const response = await fetch(`${this.apiBaseUrl}/chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: this.sessionId
                })
            });

            const data = await response.json();

            this.hideTypingIndicator();

            if (data.success) {
                this.addMessage({ text: data.response }, 'bot');
                this.lastMessageId = data.chatId;
            } else {
                this.addMessage({ text: 'Er is een fout opgetreden. Probeer het later opnieuw.' }, 'bot');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.addMessage({ text: 'Er is een fout opgetreden. Probeer het later opnieuw.' }, 'bot');
        }
    }

    handleRealTimeUpdate(data) {
        // Handle real-time updates from WebSocket
        if (data.type === 'new_message') {
            this.addMessage({ text: data.message }, 'bot');
        }
    }

    handleAdminMessage(data) {
        // Handle messages from admin
        this.addMessage({ text: data.message }, 'bot');
        this.showNotification('Nieuw bericht van admin');
    }

    showNotification(message) {
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
            new Notification('Yannova Chatbot', {
                body: message,
                icon: '/assets/images/favicon.ico'
            });
        }
    }

    handleQuickAction(action) {
        const responses = {
            offerte: "Voor een offerte kunt u ons contactformulier invullen of bellen naar +32 (0)477 28 10 28. We maken graag een afspraak om uw wensen te bespreken.",
            contact: "U kunt ons bereiken via:\n📞 Telefoon: +32 (0)477 28 10 28\n📧 Email: info@yannova.nl\n📍 Adres: Industrieweg 123, 1234 AB Amsterdam",
            openingstijden: "Onze openingstijden zijn:\n🕐 Maandag t/m Vrijdag: 8:00 - 18:00\n🕐 Zaterdag: 9:00 - 16:00\n🕐 Zondag: Gesloten",
            garantie: "Op al onze ramen en deuren geven wij uitgebreide garantie. De garantievoorwaarden verschillen per product en leverancier. Neem contact op voor specifieke informatie."
        };

        this.showTypingIndicator();
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addMessage({ text: responses[action] }, 'bot');
        }, 800);
    }

    saveChatHistory() {
        try {
            localStorage.setItem('yannova_chat_history', JSON.stringify(this.messages));
        } catch (e) {

        }
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('yannova_chat_history');
            if (saved) {
                this.messages = JSON.parse(saved);
                this.updateMessageCount();

                // Show notification if there are unread messages
                if (this.messages.length > 0 && !this.isOpen) {
                    document.getElementById('notification-badge').style.display = 'flex';
                }
            }
        } catch (e) {

        }
    }

    clearHistory() {
        if (confirm('Weet u zeker dat u de chatgeschiedenis wilt wissen?')) {
            this.messages = [];
            localStorage.removeItem('yannova_chat_history');
            document.getElementById('chatbot-messages').innerHTML = '';
            this.updateMessageCount();
            this.sendWelcomeMessage();
        }
    }

    getStats() {
        return {
            totalMessages: this.messages.length,
            userMessages: this.messages.filter(m => m.sender === 'user').length,
            botMessages: this.messages.filter(m => m.sender === 'bot').length,
            sessionId: this.sessionId,
            startTime: this.messages[0]?.timestamp || new Date(),
            isConnected: this.isConnected
        };
    }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Initialize enhanced chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.yannovaChatbotEnhanced = new YannovaChatbotEnhanced();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YannovaChatbotEnhanced;
}
