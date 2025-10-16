// Backend API endpoints voor chatbot en admin functionaliteit
// Dit bestand bevat de server-side logica (Node.js/Express voorbeeld)

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const helmet = require('helmet');
const { createClient } = require('@supabase/supabase-js');
const http = require('http');
const socketIo = require('socket.io');
const cheerio = require('cheerio');
const axios = require('axios');
const security = require('./security-middleware');
const geminiApi = require('./gemini-api');
const aiToolsApi = require('./ai-tools-api');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? ['https://yannova.nl'] : "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// WebSocket connection management
const connectedAdmins = new Map();
const activeChatSessions = new Map();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
// Apply security headers
app.use(security.getSecurityHeaders());

// Apply rate limiting
app.use('/api/admin', security.getAdminRateLimit());
app.use('/api', security.getGeneralRateLimit());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? ['https://yannova.nl'] : true,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the parent directory (where index.html is located)
app.use(express.static(path.join(__dirname, '..')));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

// Rate limiting middleware is now handled by security-middleware.js

// Serve the main HTML file at the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Gemini API routes
app.use('/api/gemini', geminiApi);
app.use('/api/ai-tools', aiToolsApi);

// WebSocket connection handling
io.on('connection', (socket) => {

// Chatbot API endpoints
app.post('/api/chatbot', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        // Generate session ID if not provided
        const currentSessionId = sessionId || generateSessionId();
        
        // Create or update chat session in Supabase
        const { data: sessionData, error: sessionError } = await supabase
            .from('chat_sessions')
            .upsert({
                session_id: currentSessionId,
                user_agent: req.headers['user-agent'],
                ip_address: req.ip,
                is_active: true
            }, {
                onConflict: 'session_id'
            })
            .select()
            .single();

        if (sessionError) {
            console.error('Session error:', sessionError);
        }

        // Process chat message
        const startTime = Date.now();
        const response = await processChatMessage(message);
        const responseTime = Date.now() - startTime;

        // Calculate sentiment score (simple implementation)
        const sentimentScore = calculateSentiment(response);

        // Store chat message in Supabase
        const { data: messageData, error: messageError } = await supabase
            .from('chat_messages')
            .insert({
                session_id: currentSessionId,
                message: message,
                response: response,
                message_type: 'user',
                response_time_ms: responseTime,
                sentiment_score: sentimentScore
            })
            .select()
            .single();

        if (messageError) {
            console.error('Message error:', messageError);
        }

        // Store bot response
        await supabase
            .from('chat_messages')
            .insert({
                session_id: currentSessionId,
                message: '',
                response: response,
                message_type: 'bot',
                response_time_ms: 0,
                sentiment_score: sentimentScore
            });

        // Send real-time notification to connected admins
        io.to('admin-room').emit('new-chat-message', {
            sessionId: currentSessionId,
            message: message,
            response: response,
            timestamp: new Date().toISOString(),
            sentimentScore: sentimentScore
        });

        res.json({
            success: true,
            response: response,
            sessionId: currentSessionId,
            chatId: messageData?.id
        });
    } catch (error) {
        console.error('Chatbot API error:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden'
        });
    }
});

// Web content scraping endpoint
app.get('/api/scrape-content', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL parameter is required'
            });
        }

        // Validate URL
        try {
            new URL(url);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid URL format'
            });
        }

        // Fetch the webpage
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Parse HTML with cheerio
        const $ = cheerio.load(response.data);
        
        // Remove script and style elements
        $('script, style, nav, header, footer, aside').remove();
        
        // Extract main content
        let content = '';
        
        // Try to find main content areas
        const mainSelectors = [
            'main',
            'article',
            '.content',
            '.main-content',
            '.post-content',
            '.entry-content',
            '#content',
            '.container'
        ];
        
        let mainElement = null;
        for (const selector of mainSelectors) {
            mainElement = $(selector).first();
            if (mainElement.length > 0) {
                break;
            }
        }
        
        if (mainElement && mainElement.length > 0) {
            content = mainElement.text();
        } else {
            // Fallback to body content
            content = $('body').text();
        }
        
        // Clean up the content
        content = content
            .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
            .replace(/\n\s*\n/g, '\n') // Remove empty lines
            .trim();
        
        // Limit content length
        if (content.length > 5000) {
            content = content.substring(0, 5000) + '...';
        }
        
        res.json({
            success: true,
            content: content,
            title: $('title').text().trim(),
            url: url
        });
        
    } catch (error) {
        console.error('Web scraping error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to scrape content from URL'
        });
    }
});

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
    const sessionId = req.ip || 'default';
    const token = security.generateCSRFToken(sessionId);
    
    res.json({
        success: true,
        token: token
    });
});

// Admin authentication
app.post('/api/admin/login', 
    security.validateInput({
        username: { required: true, type: 'text', minLength: 3, maxLength: 50 },
        password: { required: true, type: 'text', minLength: 6, maxLength: 100 }
    }),
    async (req, res) => {
    try {
        const { username, password } = req.body;
        const clientIP = req.ip || req.connection.remoteAddress;

        // Check if IP is blocked
        if (security.isIPBlocked(clientIP)) {
            security.logSecurityEvent('BLOCKED_IP_ATTEMPT', { ip: clientIP, username });
            return res.status(429).json({
                success: false,
                message: 'IP adres is geblokkeerd vanwege te veel mislukte pogingen'
            });
        }
        
        // Authenticate with Supabase
        const { data: user, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .eq('is_active', true)
            .single();

        const isValidPassword = user ? await bcrypt.compare(password, user.password_hash) : false;

        if (error || !user || !isValidPassword) {
            // Record failed attempt
            security.recordFailedAttempt(clientIP);
            security.logSecurityEvent('FAILED_LOGIN', { ip: clientIP, username });
            
            return res.status(401).json({
                success: false,
                message: 'Ongeldige gebruikersnaam of wachtwoord'
            });
        }

        // Clear failed attempts for successful login
        security.clearFailedAttempts(clientIP);
        
        // Update last login
        await supabase
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);

        // Generate JWT token using security middleware
        const token = security.generateJWT({
            username: user.username, 
            role: user.role,
            userId: user.id,
            loginTime: new Date().toISOString()
        });
        
        // Log successful login
        security.logSecurityEvent('SUCCESSFUL_LOGIN', { ip: clientIP, username, role: user.role });
        
        res.json({
            success: true,
            token: token,
            user: {
                username: user.username,
                role: user.role,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden'
        });
    }
});

// Admin chat history
app.get('/api/admin/chat-history', security.authenticateAdmin(), async (req, res) => {
    try {
        const { date, limit = 50, offset = 0 } = req.query;
        
        let query = supabase
            .from('chat_messages')
            .select(`
                id,
                session_id,
                message,
                response,
                timestamp,
                response_time_ms,
                sentiment_score,
                chat_sessions!inner(user_agent, ip_address)
            `)
            .order('timestamp', { ascending: false })
            .range(offset, parseInt(limit, 10) - 1);

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            
            query = query
                .gte('timestamp', startDate.toISOString())
                .lt('timestamp', endDate.toISOString());
        }

        const { data: chats, error, count } = await query;

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            chats: chats || [],
            total: count || 0,
            hasMore: offset + limit < (count || 0)
        });
    } catch (error) {
        console.error('Chat history error:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden'
        });
    }
});

// Admin analytics
app.get('/api/admin/analytics', security.authenticateAdmin(), async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        // Use Supabase function for analytics
        const { data: analytics, error } = await supabase
            .rpc('get_chat_analytics', {
                start_date: start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: end_date || new Date().toISOString().split('T')[0]
            });

        if (error) {
            throw error;
        }

        // Get additional stats
        const { count: totalSessions } = await supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true });

        const { count: totalVisitors } = await supabase
            .from('website_visitors')
            .select('*', { count: 'exact', head: true });

        res.json({
            success: true,
            analytics: {
                ...analytics,
                totalSessions: totalSessions || 0,
                totalVisitors: totalVisitors || 0
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden'
        });
    }
});

// Admin dashboard stats
app.get('/api/admin/dashboard-stats', security.authenticateAdmin(), async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's stats
        const { count: todayChats } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .gte('timestamp', today);

        const { count: totalSessions } = await supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true });

        const { count: activeUsers } = await supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        // Get average response time
        const { data: avgResponse } = await supabase
            .from('chat_messages')
            .select('response_time_ms')
            .gte('timestamp', today)
            .not('response_time_ms', 'is', null);

        const avgResponseTime = avgResponse?.length > 0 
            ? avgResponse.reduce((sum, msg) => sum + msg.response_time_ms, 0) / avgResponse.length / 1000
            : 0;

        res.json({
            success: true,
            stats: {
                totalChatSessions: totalSessions || 0,
                avgResponseTime: Math.round(avgResponseTime * 10) / 10,
                satisfactionRate: 87, // This could be calculated from sentiment scores
                pageViews: 2847, // This could be tracked separately
                totalChatsToday: todayChats || 0,
                totalActiveUsers: activeUsers || 0
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden'
        });
    }
});

// Export chat data
app.get('/api/admin/export-chats', security.authenticateAdmin(), async (req, res) => {
    try {
        const { format = 'csv', date } = req.query;
        
        let query = supabase
            .from('chat_messages')
            .select(`
                id,
                session_id,
                message,
                response,
                timestamp,
                response_time_ms,
                sentiment_score,
                chat_sessions!inner(user_agent, ip_address)
            `)
            .order('timestamp', { ascending: false });

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            
            query = query
                .gte('timestamp', startDate.toISOString())
                .lt('timestamp', endDate.toISOString());
        }

        const { data: chats, error } = await query;

        if (error) {
            throw error;
        }

        if (format === 'csv') {
            const csv = convertToCSV(chats || []);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=chat-history-${new Date().toISOString().split('T')[0]}.csv`);
            res.send(csv);
        } else {
            res.json({
                success: true,
                data: chats || []
            });
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden'
        });
    }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message, serviceType } = req.body;
        
        const { data, error } = await supabase
            .from('contact_submissions')
            .insert({
                name,
                email,
                phone,
                subject,
                message,
                service_type: serviceType
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            message: 'Uw bericht is succesvol verzonden!',
            submissionId: data.id
        });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden bij het verzenden van uw bericht'
        });
    }
});

// Quote request submission
app.post('/api/quote-request', async (req, res) => {
    try {
        const { contactId, projectType, measurements, materials, budgetRange, timeline, specialRequirements } = req.body;
        
        const { data, error } = await supabase
            .from('quote_requests')
            .insert({
                contact_id: contactId,
                project_type: projectType,
                measurements,
                materials,
                budget_range: budgetRange,
                timeline,
                special_requirements: specialRequirements
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            message: 'Uw offerte aanvraag is succesvol verzonden!',
            quoteId: data.id
        });
    } catch (error) {
        console.error('Quote request error:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden bij het verzenden van uw offerte aanvraag'
        });
    }
});

// Real-time chat updates (WebSocket alternative using polling)
app.get('/api/chat/updates/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { lastMessageId } = req.query;
        
        let query = supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('timestamp', { ascending: true });

        if (lastMessageId) {
            query = query.gt('id', lastMessageId);
        }

        const { data: messages, error } = await query;

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            messages: messages || [],
            hasNewMessages: (messages || []).length > 0
        });
    } catch (error) {
        console.error('Chat updates error:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden'
        });
    }
});

// Helper functions
async function processChatMessage(message) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = {
        'offerte': 'Voor een offerte kunt u ons bellen op +32 (0)477 28 10 28 of een bericht sturen via ons contactformulier. We maken graag een vrijblijvende offerte voor u op maat.',
        'openingstijden': 'Onze openingstijden zijn: Maandag t/m Vrijdag van 8:00 tot 18:00 en Zaterdag van 9:00 tot 16:00. Zondag zijn wij gesloten.',
        'ramen': 'Wij leveren hoogwaardige ramen in verschillende stijlen en materialen. Van klassiek tot modern, met energiezuinig isolatieglas voor optimaal comfort en energiebesparing.',
        'deuren': 'Onze deuren zijn volledig op maat gemaakt. We leveren zowel binnendeuren als veilige buitendeuren in verschillende stijlen en materialen.',
        'prijzen': 'Prijzen zijn afhankelijk van maat, materiaal en specificaties. Voor een exacte prijsopgave maken we graag een vrijblijvende offerte op maat voor u.',
        'contact': 'U kunt ons bereiken via telefoon +32 (0)477 28 10 28, email info@yannova.nl of bezoek ons op Industrieweg 123 in Amsterdam.',
        'garantie': 'Op al onze ramen en deuren geven wij uitgebreide garantie. De exacte garantievoorwaarden verschillen per product en leverancier.',
        'installatie': 'Wij verzorgen de volledige installatie van uw ramen en deuren. Onze ervaren monteurs zorgen voor een professionele en nette installatie.',
        'default': 'Bedankt voor uw vraag! Voor specifieke informatie kunt u ons bellen op +32 (0)477 28 10 28 of een bericht sturen via ons contactformulier. Onze specialisten helpen u graag verder.'
    };

    const lowerMessage = message.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }
    
    return responses.default;
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function calculateSentiment(text) {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['goed', 'mooi', 'perfect', 'geweldig', 'top', 'uitstekend', 'tevreden'];
    const negativeWords = ['slecht', 'probleem', 'fout', 'niet goed', 'teleurgesteld', 'ontevreden'];
    
    const lowerText = text.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
        if (lowerText.includes(word)) score += 0.1;
    });
    
    negativeWords.forEach(word => {
        if (lowerText.includes(word)) score -= 0.1;
    });
    
    return Math.max(-1, Math.min(1, score));
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = ['id', 'session_id', 'message', 'response', 'timestamp', 'response_time_ms', 'sentiment_score', 'user_agent', 'ip_address'];
    const csvContent = [
        headers.join(','),
        ...data.map(row => [
            row.id,
            row.session_id,
            `"${(row.message || '').replace(/"/g, '""')}"`,
            `"${(row.response || '').replace(/"/g, '""')}"`,
            row.timestamp,
            row.response_time_ms || '',
            row.sentiment_score || '',
            `"${(row.chat_sessions?.user_agent || '').replace(/"/g, '""')}"`,
            row.chat_sessions?.ip_address || ''
        ].join(','))
    ].join('\n');
    return csvContent;
}

// Quote API endpoints - Supabase Integration
app.post('/api/quotes', async (req, res) => {
    try {
        const quoteData = req.body;
        
        // Validate required fields
        if (!quoteData.klantNaam || !quoteData.email || !quoteData.projectType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Generate quote ID
        const quoteId = await generateQuoteId();
        
        // Calculate estimated value
        const estimatedValue = await calculateQuoteValue(
            quoteData.projectType,
            JSON.stringify(quoteData.ramen || []),
            JSON.stringify(quoteData.deuren || [])
        );
        
        // Create new quote in Supabase
        const { data: quote, error } = await supabase
            .from('quotes')
            .insert({
                quote_id: quoteId,
                klant_naam: quoteData.klantNaam,
                email: quoteData.email,
                telefoon: quoteData.telefoon,
                project_type: quoteData.projectType,
                ramen: JSON.stringify(quoteData.ramen || []),
                deuren: JSON.stringify(quoteData.deuren || []),
                extra_diensten: JSON.stringify(quoteData.extraDiensten || []),
                voorkeuren: JSON.stringify(quoteData.voorkeuren || {}),
                opmerkingen: quoteData.opmerkingen,
                status: 'pending',
                estimated_value: estimatedValue,
                valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                ip_address: req.ip,
                user_agent: req.headers['user-agent']
            })
            .select()
            .single();
        
        if (error) {
            console.error('Error creating quote:', error);
            return res.status(500).json({ error: 'Failed to create quote' });
        }
        
        // Log quote creation in history
        await supabase
            .from('quote_history')
            .insert({
                quote_id: quote.id,
                action: 'created',
                new_values: JSON.stringify(quote),
                notes: 'Quote created via website form'
            });
        
        res.status(201).json({
            ...quote,
            id: quote.quote_id, // Return human-readable ID
            klantNaam: quote.klant_naam,
            projectType: quote.project_type,
            estimatedValue: quote.estimated_value
        });
        
    } catch (error) {
        console.error('Error creating quote:', error);
        res.status(500).json({ error: 'Failed to create quote' });
    }
});

app.get('/api/quotes', async (req, res) => {
    try {
        const { status, limit = 50, offset = 0, search } = req.query;
        
        let query = supabase
            .from('quotes')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }
        
        if (search) {
            query = query.or(`klant_naam.ilike.%${search}%,email.ilike.%${search}%`);
        }
        
        // Pagination
        query = query.range(offset, offset + parseInt(limit) - 1);
        
        const { data: quotes, error, count } = await query;
        
        if (error) {
            console.error('Error fetching quotes:', error);
            return res.status(500).json({ error: 'Failed to fetch quotes' });
        }
        
        // Transform data for frontend
        const transformedQuotes = quotes.map(quote => ({
            id: quote.quote_id,
            klantNaam: quote.klant_naam,
            email: quote.email,
            telefoon: quote.telefoon,
            projectType: quote.project_type,
            ramen: JSON.parse(quote.ramen || '[]'),
            deuren: JSON.parse(quote.deuren || '[]'),
            extraDiensten: JSON.parse(quote.extra_diensten || '[]'),
            voorkeuren: JSON.parse(quote.voorkeuren || '{}'),
            opmerkingen: quote.opmerkingen,
            status: quote.status,
            estimatedValue: quote.estimated_value,
            finalPrice: quote.final_price,
            timestamp: quote.created_at,
            validUntil: quote.valid_until,
            adminNotes: quote.admin_notes,
            contactAttempts: quote.contact_attempts,
            lastContactAttempt: quote.last_contact_attempt
        }));
        
        res.json({
            quotes: transformedQuotes,
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ error: 'Failed to fetch quotes' });
    }
});

app.get('/api/quotes/:id', async (req, res) => {
    try {
        const quoteId = req.params.id;
        
        const { data: quote, error } = await supabase
            .from('quotes')
            .select('*')
            .eq('quote_id', quoteId)
            .single();
        
        if (error || !quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }
        
        // Transform data for frontend
        const transformedQuote = {
            id: quote.quote_id,
            klantNaam: quote.klant_naam,
            email: quote.email,
            telefoon: quote.telefoon,
            projectType: quote.project_type,
            ramen: JSON.parse(quote.ramen || '[]'),
            deuren: JSON.parse(quote.deuren || '[]'),
            extraDiensten: JSON.parse(quote.extra_diensten || '[]'),
            voorkeuren: JSON.parse(quote.voorkeuren || '{}'),
            opmerkingen: quote.opmerkingen,
            status: quote.status,
            estimatedValue: quote.estimated_value,
            finalPrice: quote.final_price,
            timestamp: quote.created_at,
            validUntil: quote.valid_until,
            adminNotes: quote.admin_notes,
            contactAttempts: quote.contact_attempts,
            lastContactAttempt: quote.last_contact_attempt
        };
        
        res.json(transformedQuote);
        
    } catch (error) {
        console.error('Error fetching quote:', error);
        res.status(500).json({ error: 'Failed to fetch quote' });
    }
});

app.put('/api/quotes/:id', async (req, res) => {
    try {
        const quoteId = req.params.id;
        const updates = req.body;
        
        // Get current quote for history
        const { data: currentQuote, error: fetchError } = await supabase
            .from('quotes')
            .select('*')
            .eq('quote_id', quoteId)
            .single();
        
        if (fetchError || !currentQuote) {
            return res.status(404).json({ error: 'Quote not found' });
        }
        
        // Prepare update data
        const updateData = {
            updated_at: new Date().toISOString()
        };
        
        if (updates.status) updateData.status = updates.status;
        if (updates.adminNotes) updateData.admin_notes = updates.adminNotes;
        if (updates.finalPrice) updateData.final_price = updates.finalPrice;
        if (updates.assignedTo) updateData.assigned_to = updates.assignedTo;
        
        // Update quote
        const { data: updatedQuote, error } = await supabase
            .from('quotes')
            .update(updateData)
            .eq('quote_id', quoteId)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating quote:', error);
            return res.status(500).json({ error: 'Failed to update quote' });
        }
        
        // Log changes in history
        await supabase
            .from('quote_history')
            .insert({
                quote_id: updatedQuote.id,
                action: 'updated',
                old_values: JSON.stringify(currentQuote),
                new_values: JSON.stringify(updatedQuote),
                notes: updates.notes || 'Quote updated via admin dashboard'
            });
        
        res.json({
            id: updatedQuote.quote_id,
            klantNaam: updatedQuote.klant_naam,
            email: updatedQuote.email,
            status: updatedQuote.status,
            adminNotes: updatedQuote.admin_notes,
            finalPrice: updatedQuote.final_price
        });
        
    } catch (error) {
        console.error('Error updating quote:', error);
        res.status(500).json({ error: 'Failed to update quote' });
    }
});

app.delete('/api/quotes/:id', async (req, res) => {
    try {
        const quoteId = req.params.id;
        
        const { error } = await supabase
            .from('quotes')
            .delete()
            .eq('quote_id', quoteId);
        
        if (error) {
            console.error('Error deleting quote:', error);
            return res.status(500).json({ error: 'Failed to delete quote' });
        }
        
        res.json({ message: 'Quote deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting quote:', error);
        res.status(500).json({ error: 'Failed to delete quote' });
    }
});

app.get('/api/quotes/export/csv', async (req, res) => {
    try {
        const { status, start_date, end_date } = req.query;
        
        let query = supabase
            .from('quotes')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }
        
        if (start_date && end_date) {
            query = query.gte('created_at', start_date).lte('created_at', end_date);
        }
        
        const { data: quotes, error } = await query;
        
        if (error) {
            console.error('Error exporting quotes:', error);
            return res.status(500).json({ error: 'Failed to export quotes' });
        }
        
        const csvContent = generateQuotesCSV(quotes);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=yannova-quotes-${new Date().toISOString().split('T')[0]}.csv`);
        
        res.send(csvContent);
        
    } catch (error) {
        console.error('Error exporting quotes:', error);
        res.status(500).json({ error: 'Failed to export quotes' });
    }
});

// Quote statistics endpoint
app.get('/api/quotes/stats', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = end_date || new Date().toISOString().split('T')[0];
        
        const { data: stats, error } = await supabase
            .rpc('get_quote_analytics', { 
                start_date: startDate, 
                end_date: endDate 
            });
        
        if (error) {
            console.error('Error fetching quote stats:', error);
            return res.status(500).json({ error: 'Failed to fetch quote statistics' });
        }
        
        res.json(stats);
        
    } catch (error) {
        console.error('Error fetching quote stats:', error);
        res.status(500).json({ error: 'Failed to fetch quote statistics' });
    }
});

// Helper functions for quotes
async function generateQuoteId() {
    const { data, error } = await supabase
        .rpc('generate_quote_id');
    
    if (error) {
        console.error('Error generating quote ID:', error);
        return 'QUO-' + Date.now();
    }
    
    return data;
}

async function calculateQuoteValue(projectType, ramenJson, deurenJson) {
    const { data, error } = await supabase
        .rpc('calculate_quote_value', {
            p_project_type: projectType,
            p_ramen: ramenJson,
            p_deuren: deurenJson
        });
    
    if (error) {
        console.error('Error calculating quote value:', error);
        return 5000; // Default value
    }
    
    return data;
}

function generateQuotesCSV(quotes) {
    const headers = ['ID', 'Klant', 'Email', 'Telefoon', 'Project Type', 'Status', 'Geschatte Waarde', 'Finale Prijs', 'Datum'];
    const rows = quotes.map(quote => [
        quote.quote_id,
        quote.klant_naam,
        quote.email,
        quote.telefoon || '',
        quote.project_type,
        quote.status,
        quote.estimated_value || 0,
        quote.final_price || '',
        new Date(quote.created_at).toLocaleDateString('nl-NL')
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// Password reset endpoints
app.post('/api/admin/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if user exists
        const { data: user, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', email)
            .eq('is_active', true)
            .single();

        if (error || !user) {
            // Don't reveal if email exists for security
            return res.json({
                success: true,
                message: 'Als het emailadres bestaat, is er een reset link verzonden.'
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                type: 'password_reset'
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Store reset token in database
        await supabase
            .from('password_reset_tokens')
            .insert({
                user_id: user.id,
                token: resetToken,
                expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
                used: false
            });

        // In production, send email here
        console.log(`Password reset link for ${email}: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reset-password.html?token=${resetToken}`);

        res.json({
            success: true,
            message: 'Een reset link is verzonden naar uw emailadres.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden'
        });
    }
});

app.post('/api/admin/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.type !== 'password_reset') {
            return res.status(400).json({
                success: false,
                message: 'Ongeldige reset token'
            });
        }

        // Check if token exists and is not used
        const { data: resetToken, error: tokenError } = await supabase
            .from('password_reset_tokens')
            .select('*')
            .eq('token', token)
            .eq('used', false)
            .gte('expires_at', new Date().toISOString())
            .single();

        if (tokenError || !resetToken) {
            return res.status(400).json({
                success: false,
                message: 'Ongeldige of verlopen reset token'
            });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update password
        const { error: updateError } = await supabase
            .from('admin_users')
            .update({ 
                password_hash: hashedPassword,
                updated_at: new Date().toISOString()
            })
            .eq('id', decoded.userId);

        if (updateError) {
            throw updateError;
        }

        // Mark token as used
        await supabase
            .from('password_reset_tokens')
            .update({ used: true })
            .eq('id', resetToken.id);

        res.json({
            success: true,
            message: 'Wachtwoord succesvol bijgewerkt'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Er is een fout opgetreden'
        });
    }
});

// Content management endpoints
app.get('/api/admin/content', security.authenticateAdmin(), async (req, res) => {
    try {
        const { data: content, error } = await supabase
            .from('website_content')
            .select('*')
            .eq('page', 'homepage')
            .single();

        if (error && error.code !== 'PGRST116') { // Not found error
            throw error;
        }

        res.json({
            success: true,
            content: content || getDefaultContent()
        });
    } catch (error) {
        console.error('Get content error:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden'
        });
    }
});

app.post('/api/admin/content', security.authenticateAdmin(), async (req, res) => {
    try {
        const contentData = req.body;
        
        // Upsert content
        const { data: content, error } = await supabase
            .from('website_content')
            .upsert({
                page: 'homepage',
                seo_data: JSON.stringify(contentData.seo),
                homepage_data: JSON.stringify(contentData.homepage),
                media_data: JSON.stringify(contentData.media),
                updated_at: new Date().toISOString(),
                updated_by: req.user.userId
            }, {
                onConflict: 'page'
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Log content update
        await supabase
            .from('content_history')
            .insert({
                page: 'homepage',
                action: 'updated',
                changes: JSON.stringify(contentData),
                updated_by: req.user.userId,
                notes: 'Content updated via admin panel'
            });

        res.json({
            success: true,
            message: 'Content succesvol bijgewerkt'
        });
    } catch (error) {
        console.error('Save content error:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden'
        });
    }
});

// Test Gemini API endpoint
app.get('/api/gemini/test', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Gemini API is active and ready',
            endpoints: {
                generateImage: '/api/gemini/generate-image',
                generateGallery: '/api/gemini/generate-gallery',
                projectTypes: '/api/gemini/project-types',
                buildingTypes: '/api/gemini/building-types',
                timeOptions: '/api/gemini/time-options'
            },
            status: 'operational'
        });
    } catch (error) {
        console.error('Gemini test error:', error);
        res.status(500).json({
            success: false,
            error: 'Gemini API test failed'
        });
    }
});

// Analytics endpoint
app.post('/api/analytics/event', async (req, res) => {
    try {
        const { eventType, eventData } = req.body;
        
        // Log analytics event (in production, save to database)
        console.log('Analytics Event:', {
            eventType,
            eventData,
            timestamp: new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        
        res.json({
            success: true,
            message: 'Event tracked successfully'
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden bij het tracken van het event'
        });
    }
});

// Media upload endpoint
app.post('/api/admin/media/upload', security.authenticateAdmin(), async (req, res) => {
    try {
        // In production, implement actual file upload with multer
        // For now, return success with mock data
        res.json({
            success: true,
            media: {
                id: Date.now(),
                name: 'uploaded-image.jpg',
                url: '/uploads/uploaded-image.jpg',
                type: 'image',
                size: '1.2 MB',
                uploaded: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Media upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden'
        });
    }
});

// Helper function for default content
function getDefaultContent() {
    return {
        seo: {
            pageTitle: 'Yannova Ramen en Deuren | Professionele Ramen en Deuren',
            metaDescription: 'Yannova Ramen en Deuren - Uw specialist in hoogwaardige ramen en deuren. Professionele installatie en advies voor uw woning.',
            metaKeywords: 'ramen, deuren, schuifdeuren, garagedeuren, installatie, renovatie, isolatieglas',
            ogTitle: 'Yannova Ramen en Deuren | Professionele Ramen en Deuren',
            ogDescription: 'Uw specialist in hoogwaardige ramen en deuren. Professionele installatie en advies voor uw woning.',
            ogImage: 'https://yannovabouw.nl/assets/images/about-team.jpg',
            businessName: 'Yannova Ramen en Deuren',
            businessPhone: '+31-123-456-789',
            businessEmail: 'info@yannovabouw.nl',
            businessAddress: 'Hoofdstraat 123, 1000 AB Amsterdam, Nederland'
        },
        homepage: {
            hero: {
                title: 'Ramen en Deuren dromen?',
                subtitle: 'Wij realiseren ze graag.',
                buttonText: 'Vraag een offerte aan',
                backgroundImage: '../assets/images/hero-bg.jpg'
            },
            about: {
                title: 'Over',
                subtitle: 'Uw specialist in ramen en deuren',
                text: 'Een droomhuis realiseren met perfecte ramen en deuren is zoveel fijner met een toegewijde specialist aan uw zijde.\n\nYannova Ramen en Deuren is uw ervaren partner voor hoogwaardige ramen en deuren. Wij realiseren zowel klassieke als moderne oplossingen voor particulieren en professionals en dit voor ieders budget.\n\nVan het eerste advies tot de oplevering: we gaan steeds voor perfectie.',
                image: '../assets/images/about-team.jpg'
            },
            services: {
                title: 'Aanbod',
                subtitle: 'Professionele oplossingen voor uw woning',
                items: [
                    {
                        icon: 'fas fa-window-maximize',
                        title: 'Ramen',
                        description: 'Hoogwaardige ramen in verschillende stijlen en materialen. Van klassiek tot modern, energiezuinig isolatieglas voor optimaal comfort.'
                    },
                    {
                        icon: 'fas fa-door-open',
                        title: 'Deuren',
                        description: 'Stijlvolle binnendeuren en veilige buitendeuren. Volledig op maat gemaakt voor elke woning en stijl.'
                    },
                    {
                        icon: 'fas fa-door-closed',
                        title: 'Schuifdeuren',
                        description: 'Moderne schuifdeuren voor een open en ruimtelijk gevoel. Perfect voor binnen en buitengebruik.'
                    },
                    {
                        icon: 'fas fa-warehouse',
                        title: 'Garagedeuren',
                        description: 'Professionele garagedeuren met hoge isolatiewaarden. Veilig, duurzaam en stijlvol.'
                    }
                ]
            },
            contact: {
                title: 'Contact',
                subtitle: 'Uw bouwplannen bespreken?',
                address: 'Industrieweg 123, 1234 AB Amsterdam',
                phone: '+32 (0)477 28 10 28',
                email: 'info@yannova.nl',
                hours: 'Ma-Vr: 8:00-18:00 | Za: 9:00-16:00'
            }
        },
        media: []
    };
}

// Start server
server.listen(PORT, () => {
    console.log(`Yannova API server running on port ${PORT}`);
    console.log('WebSocket server enabled for real-time updates');
    console.log('Supabase integration enabled for quotes and chat');
    console.log('Password reset and content management endpoints enabled');
});

module.exports = app;
});
