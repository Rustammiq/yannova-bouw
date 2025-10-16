// Enhanced Admin Dashboard JavaScript met WebSocket ondersteuning
class AdminDashboardEnhanced {
    constructor() {
        this.charts = {};
        this.chatData = [];
        this.currentSection = 'overview';
        this.apiBaseUrl = window.location.origin + '/api';
        this.refreshInterval = null;
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.notifications = [];
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.bindEvents();
        this.loadDashboardData();
        this.initializeCharts();
        this.loadChatHistory();
        this.startRealTimeUpdates();
        this.initWebSocket();
        this.requestNotificationPermission();
    }

    initWebSocket() {
        try {
            this.socket = io();
            
            this.socket.on('connect', () => {
                console.log('Admin WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateConnectionStatus('connected');
                
                // Authenticate admin
                const token = sessionStorage.getItem('admin_token');
                if (token) {
                    this.socket.emit('admin-auth', token);
                }
            });

            this.socket.on('admin-authenticated', (data) => {
                console.log('Admin authenticated via WebSocket');
                this.joinAdminRoom();
            });

            this.socket.on('disconnect', () => {
                console.log('Admin WebSocket disconnected');
                this.isConnected = false;
                this.updateConnectionStatus('disconnected');
                this.attemptReconnect();
            });

            this.socket.on('connect_error', (error) => {
                console.error('Admin WebSocket connection error:', error);
                this.isConnected = false;
                this.updateConnectionStatus('error');
            });

            // Listen for real-time updates
            this.socket.on('new-chat-message', (data) => {
                this.handleNewChatMessage(data);
            });

            this.socket.on('dashboard-stats', (data) => {
                this.updateStatsFromWebSocket(data);
            });

            this.socket.on('quote-update', (data) => {
                this.handleQuoteUpdate(data);
            });

        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            this.updateConnectionStatus('error');
        }
    }

    joinAdminRoom() {
        this.socket.emit('join-admin-room');
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
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

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
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

        // Real-time controls
        document.getElementById('enable-realtime').addEventListener('change', (e) => {
            this.toggleRealTimeUpdates(e.target.checked);
        });

        // Notification controls
        document.getElementById('enable-notifications').addEventListener('change', (e) => {
            this.toggleNotifications(e.target.checked);
        });

        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.refreshData();
        }, 30000);
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

        // Update page title
        const titles = {
            overview: 'Dashboard Overzicht',
            chat: 'Chat Geschiedenis',
            analytics: 'Analytics',
            settings: 'Instellingen',
            quotes: 'Offerte Beheer'
        };

        const subtitles = {
            overview: 'Welkom terug, hier is uw overzicht',
            chat: 'Bekijk alle chat gesprekken',
            analytics: 'Gedetailleerde website analytics',
            settings: 'Configureer uw instellingen',
            quotes: 'Beheer offerte aanvragen'
        };

        document.getElementById('page-title').textContent = titles[section];
        document.getElementById('page-subtitle').textContent = subtitles[section];

        this.currentSection = section;

        // Load section-specific data
        if (section === 'chat') {
            this.loadChatHistory();
        } else if (section === 'analytics') {
            this.loadAnalyticsData();
        } else if (section === 'quotes') {
            this.loadQuotes();
        }
    }

    loadDashboardData() {
        this.updateStats();
        this.loadPopularQuestions();
        this.loadRecentActivity();
    }

    updateStats() {
        // Request real-time stats from WebSocket
        if (this.socket && this.isConnected) {
            this.socket.emit('request-dashboard-update');
        } else {
            // Fallback to simulated data
            this.updateStatsSimulated();
        }
    }

    updateStatsFromWebSocket(stats) {
        // Update stat cards with real data
        document.querySelectorAll('.stat-card h3').forEach((stat, index) => {
            const values = Object.values(stats);
            if (values[index] !== undefined) {
                stat.textContent = values[index];
            }
        });
    }

    updateStatsSimulated() {
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
            { text: 'Wat zijn jullie openingstijden?', count: 23, trend: 'up' },
            { text: 'Kunnen jullie een offerte maken?', count: 18, trend: 'up' },
            { text: 'Wat kost isolatieglas?', count: 15, trend: 'down' },
            { text: 'Hoe lang duurt een installatie?', count: 12, trend: 'stable' },
            { text: 'Welke garantie bieden jullie?', count: 9, trend: 'up' },
            { text: 'Werken jullie ook in het weekend?', count: 7, trend: 'stable' },
            { text: 'Wat is de levertijd van ramen?', count: 6, trend: 'down' },
            { text: 'Kunnen jullie ook repareren?', count: 5, trend: 'up' }
        ];

        const questionsList = document.querySelector('.questions-list');
        questionsList.innerHTML = '';

        questions.forEach(q => {
            const item = document.createElement('div');
            item.className = 'question-item';
            item.innerHTML = `
                <span class="question-text">${q.text}</span>
                <div class="question-stats">
                    <span class="question-count">${q.count}x</span>
                    <span class="question-trend trend-${q.trend}">
                        <i class="fas fa-arrow-${q.trend === 'up' ? 'up' : q.trend === 'down' ? 'down' : 'right'}"></i>
                    </span>
                </div>
            `;
            questionsList.appendChild(item);
        });
    }

    loadRecentActivity() {
        const activities = [
            { type: 'chat', message: 'Nieuwe chat gestart door Jan de Vries', time: '2 minuten geleden', icon: 'fa-comments' },
            { type: 'quote', message: 'Offerte aanvraag van Maria Jansen', time: '5 minuten geleden', icon: 'fa-file-invoice' },
            { type: 'contact', message: 'Contactformulier ingevuld door Piet Bakker', time: '8 minuten geleden', icon: 'fa-envelope' },
            { type: 'chat', message: 'Chat afgesloten door Lisa van der Berg', time: '12 minuten geleden', icon: 'fa-comments' }
        ];

        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            activityList.innerHTML = '';

            activities.forEach(activity => {
                const item = document.createElement('div');
                item.className = 'activity-item';
                item.innerHTML = `
                    <div class="activity-icon">
                        <i class="fas ${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-message">${activity.message}</div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                `;
                activityList.appendChild(item);
            });
        }
    }

    handleNewChatMessage(data) {
        // Add to recent activity
        this.addActivityItem('chat', `Nieuwe chat: ${data.message.substring(0, 50)}...`, 'Zojuist');
        
        // Show notification
        this.showNotification('Nieuwe chat bericht', 'info');
        
        // Update chat count
        this.updateChatCount();
        
        // Refresh chat history if on chat section
        if (this.currentSection === 'chat') {
            this.loadChatHistory();
        }
    }

    handleQuoteUpdate(data) {
        // Add to recent activity
        this.addActivityItem('quote', `Offerte update: ${data.action}`, 'Zojuist');
        
        // Show notification
        this.showNotification('Offerte bijgewerkt', 'success');
        
        // Refresh quotes if on quotes section
        if (this.currentSection === 'quotes') {
            this.loadQuotes();
        }
    }

    addActivityItem(type, message, time) {
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            const item = document.createElement('div');
            item.className = 'activity-item new-activity';
            item.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-${type === 'chat' ? 'comments' : type === 'quote' ? 'file-invoice' : 'envelope'}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-message">${message}</div>
                    <div class="activity-time">${time}</div>
                </div>
            `;
            activityList.insertBefore(item, activityList.firstChild);
            
            // Remove old activities if too many
            const activities = activityList.querySelectorAll('.activity-item');
            if (activities.length > 10) {
                activities[activities.length - 1].remove();
            }
            
            // Remove new-activity class after animation
            setTimeout(() => {
                item.classList.remove('new-activity');
            }, 1000);
        }
    }

    updateChatCount() {
        const chatCountElement = document.querySelector('.stat-card:nth-child(2) h3');
        if (chatCountElement) {
            const currentCount = parseInt(chatCountElement.textContent);
            chatCountElement.textContent = currentCount + 1;
        }
    }

    initializeCharts() {
        this.initChatChart();
        this.initPerformanceChart();
        this.initEngagementChart();
        this.initTrafficChart();
        this.initSentimentChart();
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
                    tension: 0.4,
                    pointBackgroundColor: '#d4a574',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#d4a574',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f0f0f0'
                        },
                        ticks: {
                            color: '#666'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#666'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
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
                    backgroundColor: ['#27ae60', '#f39c12', '#e74c3c'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#666',
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                cutout: '60%'
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
                    backgroundColor: 'rgba(212, 165, 116, 0.8)',
                    borderColor: '#d4a574',
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f0f0f0'
                        },
                        ticks: {
                            color: '#666'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#666'
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
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#666',
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                }
            }
        });
    }

    initSentimentChart() {
        const ctx = document.getElementById('sentimentChart');
        if (!ctx) return;
        
        this.charts.sentiment = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Positief', 'Neutraal', 'Negatief'],
                datasets: [{
                    label: 'Sentiment',
                    data: [65, 25, 10],
                    backgroundColor: ['#27ae60', '#f39c12', '#e74c3c'],
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
                        max: 100
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
                sentiment: 'positive',
                status: 'active'
            },
            {
                id: 2,
                user: 'Maria Jansen',
                time: '13:45',
                date: '2023-12-15',
                preview: 'Wat zijn jullie openingstijden?',
                messages: 3,
                sentiment: 'neutral',
                status: 'completed'
            },
            {
                id: 3,
                user: 'Piet Bakker',
                time: '11:20',
                date: '2023-12-15',
                preview: 'Kunnen jullie een offerte maken voor schuifdeuren?',
                messages: 7,
                sentiment: 'positive',
                status: 'active'
            },
            {
                id: 4,
                user: 'Lisa van der Berg',
                time: '09:15',
                date: '2023-12-14',
                preview: 'Hoe lang duurt een installatie van isolatieglas?',
                messages: 4,
                sentiment: 'neutral',
                status: 'completed'
            },
            {
                id: 5,
                user: 'Tom Mulder',
                time: '16:30',
                date: '2023-12-14',
                preview: 'Ik heb een probleem met mijn garagedeur...',
                messages: 6,
                sentiment: 'negative',
                status: 'pending'
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
            item.className = `chat-item ${chat.status}`;
            item.innerHTML = `
                <div class="chat-header">
                    <span class="chat-user">${chat.user}</span>
                    <div class="chat-meta">
                        <span class="chat-time">${chat.date} ${chat.time}</span>
                        <span class="chat-status status-${chat.status}">${this.getStatusText(chat.status)}</span>
                    </div>
                </div>
                <div class="chat-preview">${chat.preview}</div>
                <div class="chat-stats">
                    <span class="message-count">${chat.messages} berichten</span>
                    <span class="sentiment sentiment-${chat.sentiment}">
                        <i class="fas fa-${this.getSentimentIcon(chat.sentiment)}"></i>
                        ${this.getSentimentText(chat.sentiment)}
                    </span>
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.openChatDetail(chat);
            });
            
            chatList.appendChild(item);
        });
    }

    getStatusText(status) {
        const statusTexts = {
            active: 'Actief',
            completed: 'Voltooid',
            pending: 'In behandeling'
        };
        return statusTexts[status] || status;
    }

    getSentimentIcon(sentiment) {
        const icons = {
            positive: 'smile',
            neutral: 'meh',
            negative: 'frown'
        };
        return icons[sentiment] || 'meh';
    }

    getSentimentText(sentiment) {
        const texts = {
            positive: 'Positief',
            neutral: 'Neutraal',
            negative: 'Negatief'
        };
        return texts[sentiment] || 'Neutraal';
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
        // Create modal for chat details
        const modal = document.createElement('div');
        modal.className = 'chat-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chat Details - ${chat.user}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="chat-info">
                        <p><strong>Datum:</strong> ${chat.date} ${chat.time}</p>
                        <p><strong>Status:</strong> ${this.getStatusText(chat.status)}</p>
                        <p><strong>Sentiment:</strong> ${this.getSentimentText(chat.sentiment)}</p>
                        <p><strong>Berichten:</strong> ${chat.messages}</p>
                    </div>
                    <div class="chat-preview-full">
                        <strong>Preview:</strong><br>
                        ${chat.preview}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary">Bekijk Volledig Gesprek</button>
                    <button class="btn btn-secondary modal-close">Sluiten</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
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

    loadQuotes() {
        // Load quotes data
        console.log('Loading quotes...');
    }

    updateChatbotSetting(setting, value) {
        // This would update chatbot settings via API
        console.log(`Updating chatbot setting ${setting} to ${value}`);
        
        // Show success message
        this.showNotification('Instelling opgeslagen', 'success');
    }

    toggleRealTimeUpdates(enabled) {
        if (enabled) {
            this.startRealTimeUpdates();
        } else {
            this.stopRealTimeUpdates();
        }
    }

    toggleNotifications(enabled) {
        if (enabled && 'Notification' in window) {
            Notification.requestPermission();
        }
    }

    refreshData() {
        if (this.currentSection === 'overview') {
            this.updateStats();
            this.loadPopularQuestions();
            this.loadRecentActivity();
        }
    }

    startRealTimeUpdates() {
        // Simulate real-time updates
        this.refreshInterval = setInterval(() => {
            this.updateStats();
        }, 60000); // Update every minute
    }

    stopRealTimeUpdates() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    showNotification(message, type = 'info') {
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
            new Notification('Yannova Admin', {
                body: message,
                icon: '/assets/images/favicon.ico'
            });
        }

        // Show in-app notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            padding: 15px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    logout() {
        // Disconnect WebSocket
        if (this.socket) {
            this.socket.disconnect();
        }

        // Clear session data
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_user');
        sessionStorage.removeItem('login_time');
        
        // Redirect to login
        window.location.href = 'login.html';
    }
}

// Initialize enhanced dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboardEnhanced = new AdminDashboardEnhanced();
});

// Add CSS for notifications and modals
const enhancedStyles = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .connection-status {
        position: fixed;
        top: 20px;
        left: 20px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        z-index: 10001;
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

    .chat-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }

    .modal-content {
        background: white;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }

    .modal-header {
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
    }

    .modal-body {
        padding: 20px;
    }

    .modal-footer {
        padding: 20px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }

    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }

    .btn-primary {
        background: #d4a574;
        color: white;
    }

    .btn-secondary {
        background: #6c757d;
        color: white;
    }

    .activity-item.new-activity {
        animation: highlight 1s ease;
    }

    @keyframes highlight {
        0% { background: rgba(212, 165, 116, 0.3); }
        100% { background: transparent; }
    }

    .chat-item.active {
        border-left: 4px solid #27ae60;
    }

    .chat-item.pending {
        border-left: 4px solid #f39c12;
    }

    .chat-item.completed {
        border-left: 4px solid #6c757d;
    }

    .status-active {
        color: #27ae60;
        font-weight: bold;
    }

    .status-pending {
        color: #f39c12;
        font-weight: bold;
    }

    .status-completed {
        color: #6c757d;
        font-weight: bold;
    }

    .sentiment-positive {
        color: #27ae60;
    }

    .sentiment-neutral {
        color: #f39c12;
    }

    .sentiment-negative {
        color: #e74c3c;
    }

    .trend-up {
        color: #27ae60;
    }

    .trend-down {
        color: #e74c3c;
    }

    .trend-stable {
        color: #6c757d;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = enhancedStyles;
document.head.appendChild(styleSheet);

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboardEnhanced;
}
