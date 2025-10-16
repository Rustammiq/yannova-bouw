// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.charts = {};
        this.chatData = [];
        this.quotesData = [];
        this.currentSection = 'overview';
        this.apiBaseUrl = window.location.origin + (window.location.port ? ':' + window.location.port : '') + '/api'; // Dynamic API URL
        this.refreshInterval = null;
        this.quotesPage = 1;
        this.quotesLimit = 10;
        this.quotesFilters = {
            status: 'all',
            search: '',
            dateFrom: '',
            dateTo: ''
        };
        this.socket = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.bindEvents();
        this.loadDashboardData();
        this.initializeCharts();
        this.loadChatHistory();
        this.loadQuotes();
        this.initWebSocket();
        this.startRealTimeUpdates();
        this.initAIAssistant(); // Initialize AI Assistant
    }

    checkAuthentication() {
        const token = sessionStorage.getItem('admin_token');
        const user = sessionStorage.getItem('admin_user');
        
        if (!token || !user) {
            window.location.href = 'login.html';
            return;
        }

        // Update user info
        document.getElementById('user-name').textContent = user;
        
        // Check session expiry
        const loginTime = sessionStorage.getItem('login_time');
        if (loginTime) {
            const sessionAge = Date.now() - parseInt(loginTime);
            const maxSessionAge = 8 * 60 * 60 * 1000; // 8 hours
            
            if (sessionAge > maxSessionAge) {
                this.logout();
            }
        }
    }

    bindEvents() {
        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('collapsed');
        });

        // Menu navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                this.switchSection(section);
            });
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Chat controls
        document.getElementById('chat-search').addEventListener('input', (e) => {
            this.filterChats(e.target.value);
        });

        document.getElementById('chat-filter').addEventListener('change', (e) => {
            this.filterChatsByPeriod(e.target.value);
        });

        document.getElementById('export-chats').addEventListener('click', () => {
            this.exportChatData();
        });

        // Chart controls
        document.getElementById('chat-period').addEventListener('change', (e) => {
            this.updateChatChart(e.target.value);
        });

        // Settings
        document.getElementById('chatbot-enabled').addEventListener('change', (e) => {
            this.updateChatbotSetting('enabled', e.target.checked);
        });

        document.getElementById('welcome-message').addEventListener('change', (e) => {
            this.updateChatbotSetting('welcomeMessage', e.target.value);
        });

        document.getElementById('response-time').addEventListener('change', (e) => {
            this.updateChatbotSetting('responseTime', parseInt(e.target.value));
        });

        // Quotes section events
        document.getElementById('refresh-quotes')?.addEventListener('click', () => {
            this.loadQuotes();
        });

        document.getElementById('export-quotes')?.addEventListener('click', () => {
            this.exportQuotes();
        });

        document.getElementById('status-filter')?.addEventListener('change', (e) => {
            this.quotesFilters.status = e.target.value;
            this.loadQuotes();
        });

        document.getElementById('search-quotes')?.addEventListener('input', (e) => {
            this.quotesFilters.search = e.target.value;
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => this.loadQuotes(), 500);
        });

        document.getElementById('date-from')?.addEventListener('change', (e) => {
            this.quotesFilters.dateFrom = e.target.value;
            this.loadQuotes();
        });

        document.getElementById('date-to')?.addEventListener('change', (e) => {
            this.quotesFilters.dateTo = e.target.value;
            this.loadQuotes();
        });

        document.getElementById('prev-page')?.addEventListener('click', () => {
            if (this.quotesPage > 1) {
                this.quotesPage--;
                this.loadQuotes();
            }
        });

        document.getElementById('next-page')?.addEventListener('click', () => {
            this.quotesPage++;
            this.loadQuotes();
        });

        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.refreshData();
        }, 30000);
    }

    initWebSocket() {
        // Initialize Socket.IO connection
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            // Authenticate with admin token
            const token = sessionStorage.getItem('admin_token');
            if (token) {
                this.socket.emit('admin-auth', token);
            }
        });

        this.socket.on('admin-authenticated', (data) => {
            console.log('Admin authenticated via WebSocket');
        });

        this.socket.on('new-chat-message', (data) => {
            this.handleNewChatMessage(data);
        });

        this.socket.on('dashboard-stats', (stats) => {
            this.updateDashboardStats(stats);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });
    }

    handleNewChatMessage(data) {
        // Add new message to chat history
        this.chatData.unshift({
            id: Date.now(),
            sessionId: data.sessionId,
            message: data.message,
            response: data.response,
            timestamp: data.timestamp,
            sentimentScore: data.sentimentScore
        });

        // Update chat history display if we're on the chat section
        if (this.currentSection === 'chat') {
            this.displayChatHistory();
        }

        // Show notification
        this.showNotification('Nieuwe chat bericht ontvangen', 'info');
        
        // Update dashboard stats
        this.loadDashboardData();
    }

    updateDashboardStats(stats) {
        // Update dashboard with real-time stats
        document.getElementById('total-chats').textContent = stats.totalChatSessions || 0;
        document.getElementById('avg-response-time').textContent = `${stats.avgResponseTime || 0}s`;
        document.getElementById('satisfaction-rate').textContent = `${stats.satisfactionRate || 0}%`;
        document.getElementById('page-views').textContent = stats.pageViews || 0;
        document.getElementById('chats-today').textContent = stats.totalChatsToday || 0;
        document.getElementById('active-users').textContent = stats.totalActiveUsers || 0;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'info' ? 'info-circle' : 'check-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    switchSection(section) {
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        // Handle content management redirect
        if (section === 'content') {
            window.location.href = 'content-management.html';
            return;
        }

        // Handle image generator section
        if (section === 'image-generator') {
            this.currentSection = 'image-generator';
            // Initialize image generator if not already done
            if (window.adminImageGenerator) {
                window.adminImageGenerator.loadExistingImages();
            }
        }

        // Handle chatbot config section
        if (section === 'chatbot-config') {
            this.updatePageTitle('Chatbot Configuratie & AI Training', 'Beheer je chatbot API en AI instellingen');
            return;
        }

        // Update page title
        const titles = {
            overview: 'Dashboard Overzicht',
            chat: 'Chat Geschiedenis',
            quotes: 'Offerte Beheer',
            'chatbot-config': 'Chatbot Configuratie & AI Training',
            analytics: 'Analytics',
            settings: 'Instellingen'
        };

        const subtitles = {
            overview: 'Welkom terug, hier is uw overzicht',
            chat: 'Bekijk alle chat gesprekken',
            quotes: 'Beheer alle offerte aanvragen',
            'chatbot-config': 'Beheer je chatbot API en AI instellingen',
            analytics: 'Gedetailleerde website analytics',
            settings: 'Configureer uw instellingen'
        };

        document.getElementById('page-title').textContent = titles[section];
        document.getElementById('page-subtitle').textContent = subtitles[section];

        this.currentSection = section;

        // Load section-specific data
        if (section === 'chat') {
            this.loadChatHistory();
        } else if (section === 'analytics') {
            this.loadAnalyticsData();
        }
    }

    loadDashboardData() {
        // Simulate loading dashboard data
        this.updateStats();
        this.loadPopularQuestions();
    }

    updateStats() {
        // Simulate real-time stats updates
        const stats = {
            pageViews: Math.floor(Math.random() * 100) + 1200,
            chats: Math.floor(Math.random() * 20) + 80,
            avgTime: (Math.random() * 0.5 + 2.0).toFixed(1),
            satisfaction: Math.floor(Math.random() * 5) + 90
        };

        // Update stat cards
        document.querySelectorAll('.stat-card h3').forEach((stat, index) => {
            const values = Object.values(stats);
            stat.textContent = values[index];
        });
    }

    loadPopularQuestions() {
        // This would typically come from an API
        const questions = [
            { text: 'Wat zijn jullie openingstijden?', count: 23 },
            { text: 'Kunnen jullie een offerte maken?', count: 18 },
            { text: 'Wat kost isolatieglas?', count: 15 },
            { text: 'Hoe lang duurt een installatie?', count: 12 },
            { text: 'Welke garantie bieden jullie?', count: 9 },
            { text: 'Werken jullie ook in het weekend?', count: 7 },
            { text: 'Wat is de levertijd van ramen?', count: 6 },
            { text: 'Kunnen jullie ook repareren?', count: 5 }
        ];

        const questionsList = document.querySelector('.questions-list');
        questionsList.innerHTML = '';

        questions.forEach(q => {
            const item = document.createElement('div');
            item.className = 'question-item';
            item.innerHTML = `
                <span class="question-text">${q.text}</span>
                <span class="question-count">${q.count}x</span>
            `;
            questionsList.appendChild(item);
        });
    }

    initializeCharts() {
        this.initChatChart();
        this.initPerformanceChart();
        this.initEngagementChart();
        this.initTrafficChart();
    }

    initChatChart() {
        const ctx = document.getElementById('chatChart').getContext('2d');
        
        this.charts.chat = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateDateLabels(7),
                datasets: [{
                    label: 'Chat Gesprekken',
                    data: [12, 19, 15, 25, 22, 18, 23],
                    borderColor: '#d4a574',
                    backgroundColor: 'rgba(212, 165, 116, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f0f0f0'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        
        this.charts.performance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Snel', 'Gemiddeld', 'Langzaam'],
                datasets: [{
                    data: [75, 20, 5],
                    backgroundColor: ['#d4a574', '#f39c12', '#e74c3c'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    initEngagementChart() {
        const ctx = document.getElementById('engagementChart').getContext('2d');
        
        this.charts.engagement = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'],
                datasets: [{
                    label: 'Gebruikers',
                    data: [45, 52, 48, 61, 55, 38, 29],
                    backgroundColor: '#d4a574',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f0f0f0'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    initTrafficChart() {
        const ctx = document.getElementById('trafficChart').getContext('2d');
        
        this.charts.traffic = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Direct', 'Google', 'Social Media', 'Referrals'],
                datasets: [{
                    data: [40, 35, 15, 10],
                    backgroundColor: ['#d4a574', '#3498db', '#e74c3c', '#2ecc71'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateChatChart(period) {
        const days = parseInt(period);
        const labels = this.generateDateLabels(days);
        const data = this.generateRandomData(days, 10, 30);
        
        this.charts.chat.data.labels = labels;
        this.charts.chat.data.datasets[0].data = data;
        this.charts.chat.update();
    }

    generateDateLabels(days) {
        const labels = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' }));
        }
        
        return labels;
    }

    generateRandomData(count, min, max) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return data;
    }

    loadChatHistory() {
        // Simulate chat history data
        const chatHistory = [
            {
                id: 1,
                user: 'Jan de Vries',
                time: '14:30',
                date: '2023-12-15',
                preview: 'Hallo, ik ben geïnteresseerd in nieuwe ramen voor mijn huis...',
                messages: 5,
                sentiment: 'positive'
            },
            {
                id: 2,
                user: 'Maria Jansen',
                time: '13:45',
                date: '2023-12-15',
                preview: 'Wat zijn jullie openingstijden?',
                messages: 3,
                sentiment: 'neutral'
            },
            {
                id: 3,
                user: 'Piet Bakker',
                time: '11:20',
                date: '2023-12-15',
                preview: 'Kunnen jullie een offerte maken voor schuifdeuren?',
                messages: 7,
                sentiment: 'positive'
            },
            {
                id: 4,
                user: 'Lisa van der Berg',
                time: '09:15',
                date: '2023-12-14',
                preview: 'Hoe lang duurt een installatie van isolatieglas?',
                messages: 4,
                sentiment: 'neutral'
            },
            {
                id: 5,
                user: 'Tom Mulder',
                time: '16:30',
                date: '2023-12-14',
                preview: 'Ik heb een probleem met mijn garagedeur...',
                messages: 6,
                sentiment: 'negative'
            }
        ];

        this.chatData = chatHistory;
        this.renderChatList(chatHistory);
    }

    renderChatList(chats) {
        const chatList = document.getElementById('chat-list');
        chatList.innerHTML = '';

        chats.forEach(chat => {
            const item = document.createElement('div');
            item.className = 'chat-item';
            item.innerHTML = `
                <div class="chat-header">
                    <span class="chat-user">${chat.user}</span>
                    <span class="chat-time">${chat.date} ${chat.time}</span>
                </div>
                <div class="chat-preview">${chat.preview}</div>
            `;
            
            item.addEventListener('click', () => {
                this.openChatDetail(chat);
            });
            
            chatList.appendChild(item);
        });
    }

    filterChats(searchTerm) {
        const filtered = this.chatData.filter(chat => 
            chat.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.preview.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderChatList(filtered);
    }

    filterChatsByPeriod(period) {
        const today = new Date();
        let filtered = this.chatData;

        switch (period) {
            case 'today':
                filtered = this.chatData.filter(chat => 
                    new Date(chat.date).toDateString() === today.toDateString()
                );
                break;
            case 'week':
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                filtered = this.chatData.filter(chat => 
                    new Date(chat.date) >= weekAgo
                );
                break;
            case 'month':
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                filtered = this.chatData.filter(chat => 
                    new Date(chat.date) >= monthAgo
                );
                break;
        }

        this.renderChatList(filtered);
    }

    openChatDetail(chat) {
        // This would open a modal or navigate to chat detail
        alert(`Chat details voor ${chat.user}:\n\n${chat.preview}\n\nSentiment: ${chat.sentiment}\nBerichten: ${chat.messages}`);
    }

    exportChatData() {
        const dataStr = JSON.stringify(this.chatData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    loadAnalyticsData() {
        // This would load real analytics data from Google Analytics or similar
        console.log('Loading analytics data...');
    }

    updateChatbotSetting(setting, value) {
        // This would update chatbot settings via API
        console.log(`Updating chatbot setting ${setting} to ${value}`);
        
        // Show success message
        this.showNotification('Instelling opgeslagen', 'success');
    }

    refreshData() {
        if (this.currentSection === 'overview') {
            this.updateStats();
            this.loadPopularQuestions();
        }
    }

    startRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            this.updateStats();
        }, 60000); // Update every minute
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d4edda' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : '#0c5460'};
            padding: 15px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Load quotes from API
    async loadQuotes() {
        try {
            const params = new URLSearchParams({
                limit: this.quotesLimit,
                offset: (this.quotesPage - 1) * this.quotesLimit,
                ...this.quotesFilters
            });

            const response = await fetch(`/quotes?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (!response.ok) throw new Error('Failed to load quotes');

            const data = await response.json();
            this.quotesData = data.quotes || [];
            this.displayQuotes();
            this.updateQuotesPagination(data.total || 0);

        } catch (error) {
            console.error('Error loading quotes:', error);
            this.showNotification('Fout bij laden offertes', 'error');
        }
    }

    displayQuotes() {
        const container = document.getElementById('quotes-list');
        if (!container) return;

        if (this.quotesData.length === 0) {
            container.innerHTML = '<div class="no-data">Geen offertes gevonden</div>';
            return;
        }

        container.innerHTML = this.quotesData.map(quote => `
            <div class="quote-item" data-quote-id="${quote.id}">
                <div class="quote-header">
                    <h3>${quote.user || 'Onbekend'}</h3>
                    <span class="quote-status status-${quote.status || 'pending'}">${this.getStatusText(quote.status)}</span>
                </div>
                <div class="quote-details">
                    <p><strong>Email:</strong> ${quote.email || 'Niet opgegeven'}</p>
                    <p><strong>Project:</strong> ${quote.project || 'Niet opgegeven'}</p>
                    <p><strong>Geschatte waarde:</strong> €${quote.estimated_value || '0'}</p>
                    <p><strong>Datum:</strong> ${quote.created_at || 'Onbekend'}</p>
                </div>
                <div class="quote-actions">
                    <button class="btn btn-primary" onclick="dashboard.viewQuote(${quote.id})">
                        <i class="fas fa-eye"></i> Bekijk
                    </button>
                    <button class="btn btn-secondary" onclick="dashboard.editQuote(${quote.id})">
                        <i class="fas fa-edit"></i> Bewerk
                    </button>
                    <button class="btn btn-danger" onclick="dashboard.deleteQuote(${quote.id})">
                        <i class="fas fa-trash"></i> Verwijder
                    </button>
                </div>
            </div>
        `).join('');
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'In behandeling',
            'in-progress': 'Bezig',
            'completed': 'Voltooid',
            'cancelled': 'Geannuleerd'
        };
        return statusMap[status] || status;
    }

    async exportQuotes() {
        try {
            const params = new URLSearchParams(this.quotesFilters);
            const response = await fetch(`/quotes/export/csv?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `yannova-quotes-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.showNotification('Offertes succesvol geëxporteerd', 'success');

        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Fout bij exporteren offertes', 'error');
        }
    }

    logout() {
        // Clear session data
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_user');
        sessionStorage.removeItem('login_time');

        // Redirect to login
        window.location.href = 'login.html';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

// Add CSS for notifications
const notificationStyles = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// AI Chatbot class for admin interface
class AdminAIAssistant {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.aiChatbot = {
            messages: [],
            isTyping: false,
            sessionId: 'admin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        };

        this.bindEvents();
        this.loadChatHistory();
        this.showWelcomeMessage();
    }

    bindEvents() {
        const input = document.getElementById('ai-chatbot-input');
        const send = document.getElementById('ai-chatbot-send');

        if (input && send) {
            send.addEventListener('click', () => this.sendMessage());
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }
    }

    async sendMessage() {
        const input = document.getElementById('ai-chatbot-input');
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send message to AI assistant
            const response = await this.processMessage(message);

            this.hideTypingIndicator();
            this.addMessage(response, 'bot');

        } catch (error) {
            console.error('Error sending AI message:', error);
            this.hideTypingIndicator();
            this.addMessage('Er is een fout opgetreden. Probeer het later opnieuw.', 'bot');
        }
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('ai-chatbot-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `ai-message ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<p>${this.formatMessage(text)}</p>`;

        messageElement.appendChild(avatar);
        messageElement.appendChild(content);
        messagesContainer.appendChild(messageElement);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store message
        this.aiChatbot.messages.push({
            text,
            sender,
            timestamp: new Date()
        });

        this.saveChatHistory();
    }

    formatMessage(text) {
        // Convert line breaks and basic formatting
        return text.replace(/\n/g, '<br>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    showWelcomeMessage() {
        this.addMessage('Hallo! Ik ben uw Admin AI Assistent. Ik kan u helpen met dashboard inzichten en analytics, chat gesprekken analyseren, offerte beheer ondersteuning, systeem configuratie hulp, en rapportage en exports. Stel gerust uw vraag!', 'bot');
    }

    showTypingIndicator() {
        if (this.aiChatbot.isTyping) return;

        this.aiChatbot.isTyping = true;
        const messagesContainer = document.getElementById('ai-chatbot-messages');
        const typingElement = document.createElement('div');
        typingElement.className = 'ai-message bot';
        typingElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-typing-indicator">
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
                <div class="ai-typing-dot"></div>
            </div>
        `;

        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingElement = document.querySelector('.ai-typing-indicator');
        if (typingElement) {
            typingElement.closest('.ai-message').remove();
        }
        this.aiChatbot.isTyping = false;
    }

    async processMessage(message) {
        // Analyze the message to provide admin-specific responses
        const lowerMessage = message.toLowerCase();

        // Dashboard and analytics queries
        if (lowerMessage.includes('dashboard') || lowerMessage.includes('statistieken')) {
            return this.getDashboardInsights();
        }

        // Chat analysis
        if (lowerMessage.includes('chat') || lowerMessage.includes('gesprekken')) {
            return this.getChatInsights();
        }

        // Quote management
        if (lowerMessage.includes('offerte') || lowerMessage.includes('quotes')) {
            return this.getQuoteInsights();
        }

        // System settings
        if (lowerMessage.includes('instellingen') || lowerMessage.includes('settings')) {
            return this.getSystemInsights();
        }

        // Technical help
        if (lowerMessage.includes('help') || lowerMessage.includes('hulp') || lowerMessage.includes('ondersteuning')) {
            return this.getHelpResponse();
        }

        // Default responses based on context
        return this.getDefaultResponse(lowerMessage);
    }

    getDashboardInsights() {
        return `📊 **Dashboard Inzichten:**

• **Paginaweergaven:** 1,247 (+12% deze week)
• **Chat gesprekken:** 89 (+8% deze week)
• **Gemiddelde sessietijd:** 2.3 minuten
• **Tevredenheid:** 94% (+2% deze week)

💡 **Tip:** De chat activiteit piekt meestal tussen 14:00-16:00 uur.`;
    }

    getChatInsights() {
        return `💬 **Chat Analyse:**

• **Meest gestelde vragen:**
  - Openingstijden (23x gevraagd)
  - Offerte aanvragen (18x gevraagd)
  - Prijsinformatie (15x gevraagd)

• **Gemiddelde responstijd:** 45 seconden
• **Klanttevredenheid:** 94%
• **Conversie naar offertes:** 23%

📈 **Trend:** Chat volume is met 15% gestegen ten opzichte van vorige maand.`;
    }

    getQuoteInsights() {
        return `📋 **Offerte Beheer:**

• **Totaal aantal offertes:** ${document.getElementById('total-quotes')?.textContent || '0'}
• **In behandeling:** ${document.getElementById('pending-quotes')?.textContent || '0'}
• **Totale waarde:** ${document.getElementById('total-value')?.textContent || '€0'}
• **Gemiddelde waarde:** ${document.getElementById('avg-value')?.textContent || '€0'}

✅ **Acties:** ${this.dashboard.quotesData.length} offertes wachten op behandeling.`;
    }

    getSystemInsights() {
        return `⚙️ **Systeem Status:**

• **Chatbot:** ${document.getElementById('chatbot-enabled')?.checked ? 'Actief' : 'Inactief'}
• **Database:** Verbonden
• **Server status:** Online
• **Laatste back-up:** 2 uur geleden

🔧 **Configuratie:** Alle systemen draaien normaal. Geen problemen gedetecteerd.`;
    }

    getHelpResponse() {
        return `🆘 **Admin Help Menu:**

📚 **Beschikbare commando's:**
• "dashboard statistieken" - Overzicht van KPI's
• "chat analyse" - Chat gesprekken inzichten
• "offerte beheer" - Offerte status overzicht
• "systeem status" - Technische informatie

💡 **Tip:** Ik kan ook helpen met specifieke vragen over het admin panel!

Voor technische ondersteuning, neem contact op met de ontwikkelaar.`;
    }

    getDefaultResponse(message) {
        const responses = [
            "Ik begrijp uw vraag. Laat me u helpen met informatie over het admin panel.",
            "Dat is een interessante vraag! Ik kan u helpen met dashboard inzichten, chat analyse, of offerte beheer.",
            "Ik heb uw vraag ontvangen. Probeer een specifiekere vraag te stellen over dashboard, chats, offertes, of instellingen.",
            "Bedankt voor uw vraag! Ik ben gespecialiseerd in admin dashboard ondersteuning. Wat wilt u weten?"
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    saveChatHistory() {
        try {
            localStorage.setItem('admin_ai_chat_history', JSON.stringify(this.aiChatbot.messages));
        } catch (e) {
            console.log('Could not save AI chat history:', e);
        }
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('admin_ai_chat_history');
            if (saved) {
                this.aiChatbot.messages = JSON.parse(saved);
                // Reload messages if any exist
                if (this.aiChatbot.messages.length > 1) { // More than just the welcome message
                    const messagesContainer = document.getElementById('ai-chatbot-messages');
                    messagesContainer.innerHTML = '';
                    this.aiChatbot.messages.forEach(msg => {
                        this.addMessage(msg.text, msg.sender);
                    });
                }
            }
        } catch (e) {
            console.log('Could not load AI chat history:', e);
        }
    }
}

// Chatbot Configuration Manager
class ChatbotConfigManager {
    constructor() {
        this.config = {
            aiProvider: 'openai',
            apiKey: '',
            apiEndpoint: 'https://api.openai.com/v1/chat/completions',
            modelName: 'gpt-4',
            temperature: 0.7,
            maxTokens: 1000
        };
        this.knowledgeBase = [];
        this.trainingData = [];
        this.responseTemplates = [];
        this.init();
    }

    init() {
        this.loadConfig();
        this.bindEvents();
        this.loadKnowledgeBase();
        this.loadTrainingData();
        this.loadResponseTemplates();
        this.updatePerformanceStats();
    }

    bindEvents() {
        // API Configuration
        document.getElementById('save-api-config')?.addEventListener('click', () => this.saveApiConfig());
        document.getElementById('toggle-api-key')?.addEventListener('click', () => this.toggleApiKeyVisibility());
        document.getElementById('temperature')?.addEventListener('input', (e) => {
            document.getElementById('temperature-value').textContent = e.target.value;
        });

        // Training Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Knowledge Base
        document.getElementById('add-knowledge')?.addEventListener('click', () => this.showAddKnowledgeModal());
        document.getElementById('add-image-knowledge')?.addEventListener('click', () => this.showAddImageModal());
        document.getElementById('add-web-content')?.addEventListener('click', () => this.showAddWebContentModal());
        document.getElementById('import-knowledge')?.addEventListener('click', () => this.importKnowledge());
        
        // Knowledge filters
        document.getElementById('knowledge-type-filter')?.addEventListener('change', (e) => this.filterKnowledgeByType(e.target.value));
        document.getElementById('knowledge-category-filter')?.addEventListener('change', (e) => this.filterKnowledgeByCategory(e.target.value));

        // Training Data
        document.getElementById('add-training-example')?.addEventListener('click', () => this.showAddTrainingModal());
        document.getElementById('train-model')?.addEventListener('click', () => this.trainModel());

        // Chat Test
        document.getElementById('send-test-message')?.addEventListener('click', () => this.sendTestMessage());
        document.getElementById('test-message-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendTestMessage();
        });

        // Test Chatbot
        document.getElementById('test-chatbot')?.addEventListener('click', () => this.testChatbot());
        document.getElementById('export-knowledge')?.addEventListener('click', () => this.exportKnowledge());
    }

    loadConfig() {
        const saved = localStorage.getItem('chatbot_config');
        if (saved) {
            this.config = { ...this.config, ...JSON.parse(saved) };
            this.updateConfigUI();
        }
    }

    saveConfig() {
        localStorage.setItem('chatbot_config', JSON.stringify(this.config));
        this.showNotification('Configuratie opgeslagen!', 'success');
    }

    updateConfigUI() {
        document.getElementById('ai-provider').value = this.config.aiProvider;
        document.getElementById('api-key').value = this.config.apiKey;
        document.getElementById('api-endpoint').value = this.config.apiEndpoint;
        document.getElementById('model-name').value = this.config.modelName;
        document.getElementById('temperature').value = this.config.temperature;
        document.getElementById('temperature-value').textContent = this.config.temperature;
        document.getElementById('max-tokens').value = this.config.maxTokens;
    }

    saveApiConfig() {
        this.config.aiProvider = document.getElementById('ai-provider').value;
        this.config.apiKey = document.getElementById('api-key').value;
        this.config.apiEndpoint = document.getElementById('api-endpoint').value;
        this.config.modelName = document.getElementById('model-name').value;
        this.config.temperature = parseFloat(document.getElementById('temperature').value);
        this.config.maxTokens = parseInt(document.getElementById('max-tokens').value);
        
        this.saveConfig();
    }

    toggleApiKeyVisibility() {
        const input = document.getElementById('api-key');
        const toggle = document.getElementById('toggle-api-key');
        const icon = toggle.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    loadKnowledgeBase() {
        const saved = localStorage.getItem('chatbot_knowledge');
        if (saved) {
            this.knowledgeBase = JSON.parse(saved);
        } else {
            // Default knowledge base
            this.knowledgeBase = [
                {
                    id: 1,
                    title: 'Openingstijden',
                    content: 'Wij zijn open van maandag tot vrijdag van 8:00 tot 17:00 uur. Op zaterdag van 9:00 tot 15:00 uur. Zondag gesloten.',
                    category: 'algemeen',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'Offerte aanvragen',
                    content: 'Voor een offerte kunt u contact opnemen via telefoon, email of het contactformulier op onze website. We reageren binnen 24 uur.',
                    category: 'offertes',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    title: 'Producten',
                    content: 'Wij leveren ramen, deuren, kozijnen en isolatieglas. Alle producten zijn van hoge kwaliteit en energiezuinig.',
                    category: 'producten',
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveKnowledgeBase();
        }
        this.renderKnowledgeBase();
    }

    saveKnowledgeBase() {
        localStorage.setItem('chatbot_knowledge', JSON.stringify(this.knowledgeBase));
    }

    renderKnowledgeBase() {
        const container = document.getElementById('knowledge-list');
        if (!container) return;

        const typeFilter = document.getElementById('knowledge-type-filter')?.value || 'all';
        const categoryFilter = document.getElementById('knowledge-category-filter')?.value || 'all';

        const filteredItems = this.knowledgeBase.filter(item => {
            const typeMatch = typeFilter === 'all' || item.type === typeFilter;
            const categoryMatch = categoryFilter === 'all' || item.category === categoryFilter;
            return typeMatch && categoryMatch;
        });

        container.innerHTML = filteredItems.map(item => {
            const typeClass = item.type || 'text';
            const typeBadge = this.getTypeBadge(item.type || 'text');
            
            let contentHtml = '';
            if (item.type === 'image' && item.imageUrl) {
                contentHtml = `<img src="${item.imageUrl}" alt="${item.title}" class="knowledge-image">`;
            } else if (item.type === 'web' && item.webContent) {
                contentHtml = `<div class="knowledge-web-preview">${item.webContent.substring(0, 200)}...</div>`;
            } else {
                contentHtml = `<div class="knowledge-text">${item.content}</div>`;
            }

            return `
                <div class="knowledge-item ${typeClass}-item">
                    <div class="knowledge-content">
                        <div class="knowledge-title">
                            ${typeBadge}
                            ${item.title}
                        </div>
                        ${contentHtml}
                        <div class="knowledge-meta">
                            <span class="category">${item.category}</span>
                            <span class="date">${new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="knowledge-actions-item">
                        <button class="btn-icon" onclick="chatbotConfig.editKnowledge(${item.id})" title="Bewerken">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon danger" onclick="chatbotConfig.deleteKnowledge(${item.id})" title="Verwijderen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getTypeBadge(type) {
        const badges = {
            text: '<span class="knowledge-type-badge text">Tekst</span>',
            image: '<span class="knowledge-type-badge image">Afbeelding</span>',
            web: '<span class="knowledge-type-badge web">Web</span>'
        };
        return badges[type] || badges.text;
    }

    loadTrainingData() {
        const saved = localStorage.getItem('chatbot_training');
        if (saved) {
            this.trainingData = JSON.parse(saved);
        } else {
            // Default training data
            this.trainingData = [
                {
                    id: 1,
                    question: 'Wat zijn jullie openingstijden?',
                    answer: 'Wij zijn open van maandag tot vrijdag van 8:00 tot 17:00 uur. Op zaterdag van 9:00 tot 15:00 uur. Zondag zijn wij gesloten.',
                    category: 'algemeen',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    question: 'Hoe kan ik een offerte aanvragen?',
                    answer: 'U kunt een offerte aanvragen door contact met ons op te nemen via telefoon, email of het contactformulier op onze website. We reageren binnen 24 uur op uw aanvraag.',
                    category: 'offertes',
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveTrainingData();
        }
        this.renderTrainingData();
    }

    saveTrainingData() {
        localStorage.setItem('chatbot_training', JSON.stringify(this.trainingData));
    }

    renderTrainingData() {
        const container = document.getElementById('training-examples');
        if (!container) return;

        container.innerHTML = this.trainingData.map(item => `
            <div class="training-example">
                <div class="training-content">
                    <div class="training-title">V: ${item.question}</div>
                    <div class="training-text">A: ${item.answer}</div>
                    <div class="training-meta">
                        <span class="category">${item.category}</span>
                        <span class="date">${new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="training-actions-item">
                    <button class="btn-icon" onclick="chatbotConfig.editTraining(${item.id})" title="Bewerken">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon danger" onclick="chatbotConfig.deleteTraining(${item.id})" title="Verwijderen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadResponseTemplates() {
        const saved = localStorage.getItem('chatbot_responses');
        if (saved) {
            this.responseTemplates = JSON.parse(saved);
        } else {
            // Default response templates
            this.responseTemplates = [
                {
                    id: 1,
                    trigger: 'begroeting',
                    response: 'Hallo! Welkom bij Yannova Ramen en Deuren. Hoe kan ik u vandaag helpen?',
                    category: 'algemeen'
                },
                {
                    id: 2,
                    trigger: 'afscheid',
                    response: 'Bedankt voor uw vraag! Als u nog meer hulp nodig heeft, aarzel dan niet om te vragen. Tot ziens!',
                    category: 'algemeen'
                }
            ];
            this.saveResponseTemplates();
        }
        this.renderResponseTemplates();
    }

    saveResponseTemplates() {
        localStorage.setItem('chatbot_responses', JSON.stringify(this.responseTemplates));
    }

    renderResponseTemplates() {
        const container = document.getElementById('response-templates');
        if (!container) return;

        container.innerHTML = this.responseTemplates.map(item => `
            <div class="response-template">
                <div class="template-content">
                    <div class="template-trigger">Trigger: ${item.trigger}</div>
                    <div class="template-response">${item.response}</div>
                    <div class="template-meta">
                        <span class="category">${item.category}</span>
                    </div>
                </div>
                <div class="template-actions">
                    <button class="btn-icon" onclick="chatbotConfig.editResponse(${item.id})" title="Bewerken">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon danger" onclick="chatbotConfig.deleteResponse(${item.id})" title="Verwijderen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updatePerformanceStats() {
        // Simulate performance data - in real app, this would come from API
        const stats = {
            totalConversations: Math.floor(Math.random() * 1000) + 500,
            successfulResponses: Math.floor(Math.random() * 800) + 400,
            avgResponseTime: Math.floor(Math.random() * 2000) + 500,
            satisfactionScore: Math.floor(Math.random() * 20) + 80
        };

        document.getElementById('total-conversations').textContent = stats.totalConversations;
        document.getElementById('successful-responses').textContent = stats.successfulResponses;
        document.getElementById('avg-response-time').textContent = `${stats.avgResponseTime}ms`;
        document.getElementById('satisfaction-score').textContent = `${stats.satisfactionScore}%`;
    }

    async sendTestMessage() {
        const input = document.getElementById('test-message-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addTestMessage(message, 'user');
        input.value = '';

        // Simulate AI response
        const response = await this.generateAIResponse(message);
        this.addTestMessage(response, 'bot');
    }

    addTestMessage(text, sender) {
        const container = document.getElementById('chat-test-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `test-message ${sender}`;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }

    async generateAIResponse(message) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simple response generation based on knowledge base
        const lowerMessage = message.toLowerCase();
        
        for (const item of this.knowledgeBase) {
            if (lowerMessage.includes(item.title.toLowerCase()) || 
                lowerMessage.includes(item.category.toLowerCase())) {
                return item.content;
            }
        }
        
        // Default response
        return 'Bedankt voor uw vraag! Ik heb uw bericht ontvangen en zal u zo snel mogelijk helpen.';
    }

    showAddKnowledgeModal() {
        this.showModal('Nieuwe Tekst Kennis Toevoegen', `
            <div class="setting-item">
                <label for="knowledge-title">Titel</label>
                <input type="text" id="knowledge-title" placeholder="Bijv. Openingstijden">
            </div>
            <div class="setting-item">
                <label for="knowledge-content">Inhoud</label>
                <textarea id="knowledge-content" rows="4" placeholder="Vul de kennis in..."></textarea>
            </div>
            <div class="setting-item">
                <label for="knowledge-category">Categorie</label>
                <select id="knowledge-category">
                    <option value="algemeen">Algemeen</option>
                    <option value="producten">Producten</option>
                    <option value="offertes">Offertes</option>
                    <option value="contact">Contact</option>
                </select>
            </div>
        `, () => this.addKnowledge());
    }

    showAddImageModal() {
        this.showModal('Afbeelding Toevoegen', `
            <div class="setting-item">
                <label for="image-title">Titel</label>
                <input type="text" id="image-title" placeholder="Bijv. Product foto">
            </div>
            <div class="setting-item">
                <label for="image-description">Beschrijving</label>
                <textarea id="image-description" rows="3" placeholder="Beschrijf wat er op de foto te zien is..."></textarea>
            </div>
            <div class="setting-item">
                <label for="image-file">Afbeelding Uploaden</label>
                <input type="file" id="image-file" accept="image/*" onchange="chatbotConfig.handleImageUpload(event)">
                <div id="image-preview" style="margin-top: 10px;"></div>
            </div>
            <div class="setting-item">
                <label for="image-category">Categorie</label>
                <select id="image-category">
                    <option value="producten">Producten</option>
                    <option value="algemeen">Algemeen</option>
                    <option value="offertes">Offertes</option>
                    <option value="contact">Contact</option>
                </select>
            </div>
        `, () => this.addImageKnowledge());
    }

    showAddWebContentModal() {
        this.showModal('Web Content Toevoegen', `
            <div class="setting-item">
                <label for="web-title">Titel</label>
                <input type="text" id="web-title" placeholder="Bijv. Website informatie">
            </div>
            <div class="setting-item">
                <label for="web-url">URL</label>
                <input type="url" id="web-url" placeholder="https://example.com">
            </div>
            <div class="setting-item">
                <label for="web-content">Content (optioneel - wordt automatisch opgehaald)</label>
                <textarea id="web-content" rows="4" placeholder="Of voer handmatig content in..."></textarea>
            </div>
            <div class="setting-item">
                <label for="web-category">Categorie</label>
                <select id="web-category">
                    <option value="algemeen">Algemeen</option>
                    <option value="producten">Producten</option>
                    <option value="offertes">Offertes</option>
                    <option value="contact">Contact</option>
                </select>
            </div>
            <div class="setting-item">
                <button type="button" class="btn btn-secondary" onclick="chatbotConfig.fetchWebContent()">
                    <i class="fas fa-download"></i> Haal Content Op
                </button>
            </div>
        `, () => this.addWebContent());
    }

    addKnowledge() {
        const title = document.getElementById('knowledge-title').value;
        const content = document.getElementById('knowledge-content').value;
        const category = document.getElementById('knowledge-category').value;
        
        if (!title || !content) {
            this.showNotification('Vul alle velden in!', 'error');
            return;
        }
        
        const newItem = {
            id: Date.now(),
            title,
            content,
            category,
            type: 'text',
            createdAt: new Date().toISOString()
        };
        
        this.knowledgeBase.push(newItem);
        this.saveKnowledgeBase();
        this.renderKnowledgeBase();
        this.hideModal();
        this.showNotification('Tekst kennis toegevoegd!', 'success');
    }

    addImageKnowledge() {
        const title = document.getElementById('image-title').value;
        const description = document.getElementById('image-description').value;
        const category = document.getElementById('image-category').value;
        const imageFile = document.getElementById('image-file').files[0];
        
        if (!title || !imageFile) {
            this.showNotification('Vul titel in en selecteer een afbeelding!', 'error');
            return;
        }
        
        // Convert image to base64 for storage
        const reader = new FileReader();
        reader.onload = (e) => {
            const newItem = {
                id: Date.now(),
                title,
                content: description || 'Afbeelding zonder beschrijving',
                imageUrl: e.target.result,
                category,
                type: 'image',
                createdAt: new Date().toISOString()
            };
            
            this.knowledgeBase.push(newItem);
            this.saveKnowledgeBase();
            this.renderKnowledgeBase();
            this.hideModal();
            this.showNotification('Afbeelding toegevoegd!', 'success');
        };
        reader.readAsDataURL(imageFile);
    }

    addWebContent() {
        const title = document.getElementById('web-title').value;
        const url = document.getElementById('web-url').value;
        const content = document.getElementById('web-content').value;
        const category = document.getElementById('web-category').value;
        
        if (!title || !url) {
            this.showNotification('Vul titel en URL in!', 'error');
            return;
        }
        
        const newItem = {
            id: Date.now(),
            title,
            content: content || 'Web content wordt geladen...',
            webContent: content || 'Web content wordt geladen...',
            webUrl: url,
            category,
            type: 'web',
            createdAt: new Date().toISOString()
        };
        
        this.knowledgeBase.push(newItem);
        this.saveKnowledgeBase();
        this.renderKnowledgeBase();
        this.hideModal();
        this.showNotification('Web content toegevoegd!', 'success');
        
        // If no content provided, try to fetch it
        if (!content) {
            this.fetchWebContentForItem(newItem.id, url);
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('image-preview');
                preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 150px; border-radius: 8px; border: 1px solid #e5e7eb;">`;
            };
            reader.readAsDataURL(file);
        }
    }

    async fetchWebContent() {
        const url = document.getElementById('web-url').value;
        if (!url) {
            this.showNotification('Voer eerst een URL in!', 'error');
            return;
        }
        
        try {
            this.showNotification('Content ophalen...', 'info');
            
            // Simulate web scraping (in real app, this would be a backend call)
            const response = await fetch(`/api/scrape-content?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('web-content').value = data.content;
                this.showNotification('Content opgehaald!', 'success');
            } else {
                throw new Error('Failed to fetch content');
            }
        } catch (error) {
            console.error('Error fetching web content:', error);
            this.showNotification('Kon content niet ophalen. Voer handmatig in.', 'error');
        }
    }

    async fetchWebContentForItem(itemId, url) {
        try {
            // Simulate web scraping
            const response = await fetch(`/api/scrape-content?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            
            if (data.success) {
                const item = this.knowledgeBase.find(i => i.id === itemId);
                if (item) {
                    item.content = data.content;
                    item.webContent = data.content;
                    this.saveKnowledgeBase();
                    this.renderKnowledgeBase();
                }
            }
        } catch (error) {
            console.error('Error fetching web content for item:', error);
        }
    }

    filterKnowledgeByType(type) {
        this.renderKnowledgeBase();
    }

    filterKnowledgeByCategory(category) {
        this.renderKnowledgeBase();
    }

    showModal(title, content, onSave) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="chatbotConfig.hideModal()">Annuleren</button>
                    <button class="btn btn-primary" onclick="chatbotConfig.saveModal()">Opslaan</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = { onSave };
        
        modal.querySelector('.modal-close').addEventListener('click', () => this.hideModal());
    }

    saveModal() {
        if (this.currentModal && this.currentModal.onSave) {
            this.currentModal.onSave();
        }
    }

    hideModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
        this.currentModal = null;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            z-index: 1001;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Placeholder methods for future implementation
    editKnowledge(id) { console.log('Edit knowledge:', id); }
    deleteKnowledge(id) { 
        this.knowledgeBase = this.knowledgeBase.filter(item => item.id !== id);
        this.saveKnowledgeBase();
        this.renderKnowledgeBase();
        this.showNotification('Kennis verwijderd!', 'success');
    }
    editTraining(id) { console.log('Edit training:', id); }
    deleteTraining(id) { 
        this.trainingData = this.trainingData.filter(item => item.id !== id);
        this.saveTrainingData();
        this.renderTrainingData();
        this.showNotification('Training voorbeeld verwijderd!', 'success');
    }
    editResponse(id) { console.log('Edit response:', id); }
    deleteResponse(id) { 
        this.responseTemplates = this.responseTemplates.filter(item => item.id !== id);
        this.saveResponseTemplates();
        this.renderResponseTemplates();
        this.showNotification('Response template verwijderd!', 'success');
    }
    importKnowledge() { console.log('Import knowledge'); }
    trainModel() { 
        this.showNotification('Model training gestart!', 'info');
        // Simulate training
        setTimeout(() => {
            this.showNotification('Model training voltooid!', 'success');
        }, 3000);
    }
    testChatbot() { console.log('Test chatbot'); }
    exportKnowledge() { 
        const data = {
            knowledge: this.knowledgeBase,
            training: this.trainingData,
            responses: this.responseTemplates
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chatbot-knowledge.json';
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('Kennis geëxporteerd!', 'success');
    }
}

// Initialize AI Assistant after dashboard is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new AdminDashboard();

    // Initialize AI Assistant after a short delay to ensure DOM is ready
    setTimeout(() => {
        window.adminAIAssistant = new AdminAIAssistant(dashboard);
        window.chatbotConfig = new ChatbotConfigManager();
    }, 100);
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboard;
}
