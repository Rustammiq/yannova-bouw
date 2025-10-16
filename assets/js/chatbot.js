// AI Chatbot voor Yannova Ramen en Deuren met Supabase integratie
class YannovaChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.sessionId = this.generateSessionId();
    this.isTyping = false;
    this.lastMessageId = null;
    this.pollingInterval = null;
    this.apiBaseUrl = window.location.origin + (window.location.port ? ':' + window.location.port : '') + '/api'; // Dynamic API URL
    this.retryCount = 0;
    this.maxRetries = 3;
    this.init();
  }

  init() {
    this.createChatbotHTML();
    this.bindEvents();
    this.loadChatHistory();
    this.sendWelcomeMessage();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  createChatbotHTML() {
    const chatbotHTML = `
            <div id="yannova-chatbot" class="chatbot-container">
                <div class="chatbot-toggle" id="chatbot-toggle">
                    <i class="fas fa-comments"></i>
                    <span class="notification-badge" id="notification-badge" style="display: none;">1</span>
                </div>
                <div class="chatbot-window" id="chatbot-window">
                    <div class="chatbot-header">
                        <div class="chatbot-title">
                            <i class="fas fa-home"></i>
                            <span>Yannova Assistent</span>
                        </div>
                        <button class="chatbot-close" id="chatbot-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="chatbot-messages" id="chatbot-messages">
                        <!-- Messages will be inserted here -->
                    </div>
                    <div class="chatbot-input-container">
                        <div class="quick-actions" id="quick-actions">
                            <button class="quick-action-btn" data-action="offerte">Offerte aanvragen</button>
                            <button class="quick-action-btn" data-action="contact">Contact opnemen</button>
                            <button class="quick-action-btn" data-action="openingstijden">Openingstijden</button>
                        </div>
                        <div class="chatbot-input-wrapper">
                            <input type="text" id="chatbot-input" placeholder="Stel uw vraag..." maxlength="500">
                            <button id="chatbot-send">
                                <i class="fas fa-paper-plane"></i>
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
                    background: #d4a574;
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
                }

                .chatbot-window {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 350px;
                    height: 500px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
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
                    background: #2c3e50;
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

                .chatbot-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 18px;
                    padding: 5px;
                    border-radius: 50%;
                    transition: background 0.3s;
                }

                .chatbot-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .chatbot-messages {
                    flex: 1;
                    padding: 15px;
                    overflow-y: auto;
                    background: #f8f9fa;
                }

                .message {
                    margin-bottom: 15px;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                }

                .message.user {
                    flex-direction: row-reverse;
                }

                .message-avatar {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
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
                    padding: 10px 15px;
                    border-radius: 15px;
                    font-size: 14px;
                    line-height: 1.4;
                }

                .message.user .message-content {
                    background: #d4a574;
                    color: #1a1a1a;
                }

                .message.bot .message-content {
                    background: white;
                    color: #333;
                    border: 1px solid #e0e0e0;
                }

                .typing-indicator {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 10px 15px;
                    background: white;
                    border-radius: 15px;
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
                    padding: 10px 15px;
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .quick-action-btn {
                    background: #f0f0f0;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 15px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .quick-action-btn:hover {
                    background: #d4a574;
                    color: white;
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
                    padding: 10px 15px;
                    border: 1px solid #ddd;
                    border-radius: 25px;
                    outline: none;
                    font-size: 14px;
                }

                #chatbot-input:focus {
                    border-color: #d4a574;
                }

                #chatbot-send {
                    width: 40px;
                    height: 40px;
                    background: #d4a574;
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
                    background: #b8935f;
                    transform: scale(1.1);
                }

                @media (max-width: 480px) {
                    .chatbot-window {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 120px);
                        bottom: 80px;
                        right: 20px;
                        left: 20px;
                    }
                }
            </style>
        `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  bindEvents() {
    const toggle = document.getElementById('chatbot-toggle');
    const close = document.getElementById('chatbot-close');
    const input = document.getElementById('chatbot-input');
    const send = document.getElementById('chatbot-send');
    const quickActions = document.querySelectorAll('.quick-action-btn');

    toggle.addEventListener('click', () => this.toggleChatbot());
    close.addEventListener('click', () => this.closeChatbot());
    send.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {this.sendMessage();}
    });

    quickActions.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        this.handleQuickAction(action);
      });
    });
  }

  toggleChatbot() {
    this.isOpen = !this.isOpen;
    const window = document.getElementById('chatbot-window');
    const badge = document.getElementById('notification-badge');

    if (this.isOpen) {
      window.classList.add('open');
      badge.style.display = 'none';
      // Start polling when chatbot opens
      if (!this.pollingInterval) {
        this.startPolling();
      }
    } else {
      window.classList.remove('open');
      // Stop polling when chatbot closes to save resources
      this.stopPolling();
    }
  }

  closeChatbot() {
    this.isOpen = false;
    document.getElementById('chatbot-window').classList.remove('open');
  }

  sendWelcomeMessage() {
    const welcomeMessage = {
      text: 'Hallo! Ik ben de Yannova assistent. Hoe kan ik u vandaag helpen?',
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

    // Save to localStorage
    this.saveChatHistory();
  }

  showTypingIndicator() {
    if (this.isTyping) {return;}

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
  }

  hideTypingIndicator() {
    const typingElement = document.getElementById('typing-indicator');
    if (typingElement) {
      typingElement.remove();
    }
    this.isTyping = false;
  }

  async sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();

    if (!message) {return;}

    // Add user message
    this.addMessage({ text: message }, 'user');
    input.value = '';

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Send message to Supabase via API
      const response = await fetch(`${this.apiBaseUrl}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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

        // Start polling for real-time updates if not already started
        if (!this.pollingInterval) {
          this.startPolling();
        }
      } else {
        this.addMessage({ text: 'Er is een fout opgetreden. Probeer het later opnieuw.' }, 'bot');
      }
    } catch (error) {
      // console.error('Error sending message:', error);
      this.hideTypingIndicator();
      this.addMessage({ text: 'Er is een fout opgetreden. Probeer het later opnieuw.' }, 'bot');
    }
  }

  // Start polling for real-time updates
  startPolling() {
    this.pollingInterval = setInterval(async() => {
      await this.checkForUpdates();
    }, 2000); // Check every 2 seconds
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Check for new messages
  async checkForUpdates() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/chat/updates/${this.sessionId}?lastMessageId=${this.lastMessageId || ''}`);
      const data = await response.json();

      if (data.success && data.hasNewMessages) {
        data.messages.forEach(message => {
          if (message.message_type === 'bot' && message.id !== this.lastMessageId) {
            this.addMessage({ text: message.response }, 'bot');
            this.lastMessageId = message.id;
          }
        });
      }
    } catch (error) {
      // console.error('Error checking for updates:', error);
    }
  }

  handleQuickAction(action) {
    const responses = {
      offerte: 'Voor een offerte kunt u ons contactformulier invullen of bellen naar +32 (0)477 28 10 28. We maken graag een afspraak om uw wensen te bespreken.',
      contact: 'U kunt ons bereiken via:\n📞 Telefoon: +32 (0)477 28 10 28\n📧 Email: info@yannovabouw.ai\n📍 Adres: Industrieweg 123, 1234 AB Amsterdam',
      openingstijden: 'Onze openingstijden zijn:\n🕐 Maandag t/m Vrijdag: 8:00 - 18:00\n🕐 Zaterdag: 9:00 - 16:00\n🕐 Zondag: Gesloten'
    };

    this.showTypingIndicator();
    setTimeout(() => {
      this.hideTypingIndicator();
      this.addMessage({ text: responses[action] }, 'bot');
    }, 800);
  }

  generateResponse(userMessage) {
    const message = userMessage.toLowerCase();

    // Check if this is a quote request (contains project details)
    if (this.isQuoteRequest(message)) {
      this.processQuoteRequest(userMessage);
      return 'Ik ga een offerte voor u opstellen op basis van uw aanvraag. Dit duurt even...';
    }

    // FAQ responses
    const responses = {
      'prijs': 'Voor een exacte prijsopgave hebben we meer informatie nodig over uw project. Kunt u ons bellen op +32 (0)477 28 10 28 of het contactformulier invullen?',
      'kosten': 'Voor een exacte prijsopgave hebben we meer informatie nodig over uw project. Kunt u ons bellen op +32 (0)477 28 10 28 of het contactformulier invullen?',
      'offerte': 'We maken graag een offerte voor u! Bel ons op +32 (0)477 28 10 28 of vul het contactformulier in voor een vrijblijvende afspraak.',
      'garantie': 'Wij bieden uitgebreide garantie op al onze producten en installaties. De garantievoorwaarden verschillen per product. Neem contact op voor specifieke informatie.',
      'installatie': 'Ons team van gecertificeerde vakmensen zorgt voor professionele installatie. We werken snel en netjes volgens planning.',
      'onderhoud': 'We bieden regelmatig onderhoud voor optimale prestaties. Neem contact op voor een onderhoudsplan op maat.',
      'isolatieglas': 'We werken met hoogwaardig isolatieglas voor energiebesparing en comfort. Verschillende types beschikbaar voor elke toepassing.',
      'schuifdeuren': 'Moderne schuifdeuren voor binnen en buiten. Verschillende materialen en systemen beschikbaar.',
      'garagedeuren': 'Professionele garagedeuren met hoge isolatiewaarden. Veilig, duurzaam en stijlvol.',
      'renovatie': 'We helpen graag bij uw renovatieproject. Van advies tot uitvoering, alles onder één dak.',
      'nieuwbouw': 'Voor nieuwbouwprojecten werken we samen met architecten en aannemers voor perfecte integratie.',
      'contact': 'U kunt ons bereiken via telefoon +32 (0)477 28 10 28, email info@yannovabouw.ai of het contactformulier op onze website.',
      'adres': 'Ons adres is Industrieweg 123, 1234 AB Amsterdam.',
      'openingstijden': 'Ma-Vr: 8:00-18:00, Za: 9:00-16:00, Zo: gesloten.',
      'ervaring': 'We hebben meer dan 15 jaar ervaring in de branche met duizenden tevreden klanten.',
      'kwaliteit': 'We werken uitsluitend met A-merken en bieden uitgebreide garanties op al onze producten.'
    };

    // Check for keywords
    for (const [keyword, response] of Object.entries(responses)) {
      if (message.includes(keyword)) {
        return response;
      }
    }

    // Default responses
    const defaultResponses = [
      'Dat is een interessante vraag! Voor specifieke informatie kunt u het beste contact opnemen met ons team.',
      'Ik kan u helpen met informatie over onze diensten. Wat zou u graag willen weten?',
      'Voor gedetailleerde informatie raad ik aan om contact op te nemen via +32 (0)477 28 10 28.',
      'Dat is een goede vraag! Onze specialisten kunnen u hier meer over vertellen.',
      'Ik begrijp uw vraag. Voor persoonlijk advies kunt u het beste contact opnemen.'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  isQuoteRequest(message) {
    // Check if message contains project details
    const quoteIndicators = [
      'ik wil graag', 'ik ben geïnteresseerd', 'ik heb nodig',
      'ramen vervangen', 'deuren vervangen', 'nieuwe ramen',
      'centimeter', 'meter', 'cm', 'm²', 'vierkante meter',
      'kunststof', 'aluminium', 'hout', 'dubbel glas', 'triple glas',
      'hr++', 'isolatieglas', 'schuifdeur', 'schuifpui'
    ];

    return quoteIndicators.some(indicator => message.includes(indicator));
  }

  processQuoteRequest(userMessage) {
    // Trigger quote processing
    const event = new CustomEvent('quoteRequest', {
      detail: userMessage
    });
    document.dispatchEvent(event);

    // Track analytics
    if (window.yannovaAnalytics) {
      window.yannovaAnalytics.trackChatbotInteraction('quote_request', {
        messageLength: userMessage.length,
        hasDimensions: /\d+\s*(?:bij|x|×)\s*\d+/.test(userMessage),
        hasMaterial: /kunststof|aluminium|hout/.test(userMessage)
      });
    }
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
        // Show notification if there are unread messages
        if (this.messages.length > 0 && !this.isOpen) {
          document.getElementById('notification-badge').style.display = 'flex';
        }
      }
    } catch (e) {

    }
  }

  // Method to clear chat history
  clearHistory() {
    this.messages = [];
    localStorage.removeItem('yannova_chat_history');
    document.getElementById('chatbot-messages').innerHTML = '';
    this.sendWelcomeMessage();
  }

  // Method to get chat statistics
  getStats() {
    return {
      totalMessages: this.messages.length,
      userMessages: this.messages.filter(m => m.sender === 'user').length,
      botMessages: this.messages.filter(m => m.sender === 'bot').length,
      sessionId: this.sessionId,
      startTime: this.messages[0]?.timestamp || new Date()
    };
  }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.yannovaChatbot = new YannovaChatbot();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = YannovaChatbot;
}
