const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

// Chatbot API endpoints
router.post('/', async (req, res) => {
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
            throw new Error('Failed to create chat session');
        }

        // Store user message
        const { error: messageError } = await supabase
            .from('chat_messages')
            .insert({
                session_id: currentSessionId,
                message: message,
                sender: 'user',
                timestamp: new Date().toISOString()
            });

        if (messageError) {
            throw new Error('Failed to store user message');
        }

        // Generate AI response
        const response = await generateAIResponse(message);
        
        // Store AI response
        const { error: responseError } = await supabase
            .from('chat_messages')
            .insert({
                session_id: currentSessionId,
                message: response,
                sender: 'ai',
                timestamp: new Date().toISOString()
            });

        if (responseError) {
            throw new Error('Failed to store AI response');
        }

        res.json({
            success: true,
            response: response,
            sessionId: currentSessionId
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get chat history
router.get('/history/:sessionId', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const { data: messages, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('timestamp', { ascending: true });

        if (error) {
            throw new Error('Failed to fetch chat history');
        }

        res.json({
            success: true,
            messages: messages
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Helper functions
function generateSessionId() {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function generateAIResponse(message) {
    // Simple AI response logic - can be enhanced with actual AI
    const responses = {
        'hallo': 'Hallo! Hoe kan ik je helpen met je ramen en deuren project?',
        'prijs': 'Voor een offerte op maat, vul het offerteformulier in of bel ons direct.',
        'contact': 'Je kunt ons bereiken via +31-123-456-789 of info@yannova.nl',
        'diensten': 'Wij bieden isolatiewerken, renovatiewerken, platedakken, ramen en deuren, en tuinaanleg.'
    };

    const lowerMessage = message.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }

    return 'Bedankt voor je bericht! We nemen zo snel mogelijk contact met je op.';
}

module.exports = router;
