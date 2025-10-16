// Supabase Client voor Yannova Ramen en Deuren
class SupabaseClient {
    constructor() {
        this.supabaseUrl = this.getConfig('SUPABASE_URL') || 'https://wwchpqroenvomcvkecuh.supabase.co';
        this.apiBaseUrl = window.location.origin + (window.location.port ? ':' + window.location.port : '') + '/api';
        this.supabaseKey = this.getConfig('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Y2hwcXJvZW52b21jdmtlY3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjY0MDMsImV4cCI6MjA3MDAwMjQwM30.ofoj3UHlOLZa0Q5n2O4db3L1690WqWe_XnwRCFz66iE';
        this.supabase = null;
        this.init();
    }

    // Helper method to get configuration from environment or meta tags
    getConfig(key) {
        // Try to get from window.env if available (set by server)
        if (window.env && window.env[key]) {
            return window.env[key];
        }

        // Try to get from meta tags
        const metaTag = document.querySelector(`meta[name="${key.toLowerCase()}"]`);
        if (metaTag) {
            return metaTag.getAttribute('content');
        }

        return null;
    }

    async init() {
        try {
            // Load Supabase client dynamically
            const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');

            this.supabase = createClient(this.supabaseUrl, this.supabaseKey);


        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
        }
    }

    // Chatbot methods
    async saveChatMessage(sessionId, message, response, messageType = 'user') {
        if (!this.supabase) return null;

        try {
            const { data, error } = await this.supabase
                .from('chat_messages')
                .insert([
                    {
                        session_id: sessionId,
                        message: message,
                        response: response,
                        message_type: messageType,
                        timestamp: new Date().toISOString()
                    }
                ])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error saving chat message:', error);
            return null;
        }
    }

    async getChatHistory(sessionId, limit = 50) {
        if (!this.supabase) return [];

        try {
            const { data, error } = await this.supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('timestamp', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching chat history:', error);
            return [];
        }
    }

    async getChatUpdates(sessionId, lastMessageId) {
        if (!this.supabase) return { hasNewMessages: false, messages: [] };

        try {
            let query = this.supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('timestamp', { ascending: false });

            if (lastMessageId) {
                query = query.gt('id', lastMessageId);
            }

            const { data, error } = await query;

            if (error) throw error;

            return {
                hasNewMessages: data && data.length > 0,
                messages: data || []
            };
        } catch (error) {
            console.error('Error fetching chat updates:', error);
            return { hasNewMessages: false, messages: [] };
        }
    }

    // Quote methods
    async saveQuote(quoteData) {
        if (!this.supabase) return null;

        try {
            const { data, error } = await this.supabase
                .from('quotes')
                .insert([
                    {
                        contact_info: quoteData.contact,
                        project_info: quoteData.project,
                        preferences: quoteData.preferences,
                        measurements: quoteData.measurements,
                        timeline: quoteData.timeline,
                        status: 'pending',
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error saving quote:', error);
            return null;
        }
    }

    async getQuotes(status = null, limit = 50) {
        if (!this.supabase) return [];

        try {
            let query = this.supabase
                .from('quotes')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching quotes:', error);
            return [];
        }
    }

    async updateQuoteStatus(quoteId, status) {
        if (!this.supabase) return null;

        try {
            const { data, error } = await this.supabase
                .from('quotes')
                .update({
                    status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', quoteId)
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error updating quote status:', error);
            return null;
        }
    }

    // Analytics methods
    async saveAnalyticsEvent(eventData) {
        if (!this.supabase) return null;

        try {
            const { data, error } = await this.supabase
                .from('analytics_events')
                .insert([
                    {
                        event_type: eventData.type,
                        event_data: eventData.data,
                        session_id: eventData.sessionId,
                        url: eventData.url,
                        user_agent: eventData.userAgent,
                        timestamp: eventData.timestamp
                    }
                ])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error saving analytics event:', error);
            return null;
        }
    }

    async getAnalyticsData(startDate, endDate, eventType = null) {
        if (!this.supabase) return [];

        try {
            let query = this.supabase
                .from('analytics_events')
                .select('*')
                .gte('timestamp', startDate)
                .lte('timestamp', endDate)
                .order('timestamp', { ascending: false });

            if (eventType) {
                query = query.eq('event_type', eventType);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching analytics data:', error);
            return [];
        }
    }

    // Admin authentication
    async authenticateAdmin(username, password) {
        if (!this.supabase) return null;

        try {
            const { data, error } = await this.supabase
                .from('admin_users')
                .select('*')
                .eq('username', username)
                .eq('active', true)
                .single();

            if (error) throw error;

            // In a real application, you would hash the password
            // For demo purposes, we'll do a simple comparison
            if (data && data.password === password) {
                return {
                    id: data.id,
                    username: data.username,
                    role: data.role,
                    permissions: data.permissions
                };
            }

            return null;
        } catch (error) {
            console.error('Error authenticating admin:', error);
            return null;
        }
    }

    // Real-time subscriptions
    subscribeToChatUpdates(sessionId, callback) {
        if (!this.supabase) return null;

        return this.supabase
            .channel(`chat-${sessionId}`)
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `session_id=eq.${sessionId}`
                },
                callback
            )
            .subscribe();
    }

    subscribeToQuoteUpdates(callback) {
        if (!this.supabase) return null;

        return this.supabase
            .channel('quotes')
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'quotes'
                },
                callback
            )
            .subscribe();
    }

    // Utility methods
    async testConnection() {
        if (!this.supabase) return false;

        try {
            const { data, error } = await this.supabase
                .from('chat_messages')
                .select('count')
                .limit(1);

            return !error;
        } catch (error) {
            console.error('Supabase connection test failed:', error);
            return false;
        }
    }

    // Configuration methods
    setCredentials(url, key) {
        this.supabaseUrl = url;
        this.supabaseKey = key;
    }

    getCredentials() {
        return {
            url: this.supabaseUrl,
            key: this.supabaseKey
        };
    }
}

// Initialize Supabase client when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.supabaseClient = new SupabaseClient();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseClient;
}