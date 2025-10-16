-- Supabase Database Schema voor Yannova Ramen en Deuren
-- Dit bestand bevat alle database tabellen en configuraties

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id VARCHAR(255) REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'user', -- 'user' or 'bot'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time_ms INTEGER,
    sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table for storing daily statistics
CREATE TABLE IF NOT EXISTS daily_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    total_chats INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    avg_response_time DECIMAL(5,2) DEFAULT 0,
    satisfaction_rate DECIMAL(5,2) DEFAULT 0,
    popular_questions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Website visitors tracking
CREATE TABLE IF NOT EXISTS website_visitors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    page_views INTEGER DEFAULT 1,
    visit_duration INTEGER DEFAULT 0, -- in seconds
    first_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_bot BOOLEAN DEFAULT false
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    service_type VARCHAR(100), -- 'ramen', 'deuren', 'offerte', etc.
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'contacted', 'quoted', 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quote requests
CREATE TABLE IF NOT EXISTS quote_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    contact_id UUID REFERENCES contact_submissions(id) ON DELETE CASCADE,
    project_type VARCHAR(100) NOT NULL, -- 'ramen', 'deuren', 'combinatie'
    measurements JSONB, -- Store measurements as JSON
    materials JSONB, -- Store material preferences
    budget_range VARCHAR(50),
    timeline VARCHAR(100),
    special_requirements TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'quoted', 'accepted', 'declined'
    quote_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_analytics_updated_at BEFORE UPDATE ON daily_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON quote_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Policies for admin access (service role can access everything)
CREATE POLICY "Service role can access all data" ON chat_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all data" ON chat_messages FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all data" ON admin_users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all data" ON daily_analytics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all data" ON website_visitors FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all data" ON contact_submissions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all data" ON quote_requests FOR ALL USING (auth.role() = 'service_role');

-- Policies for anonymous users (can insert chat data)
CREATE POLICY "Anonymous users can create chat sessions" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anonymous users can create chat messages" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anonymous users can create contact submissions" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anonymous users can create quote requests" ON quote_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anonymous users can create visitor data" ON website_visitors FOR INSERT WITH CHECK (true);

-- Insert default admin user (password: yannova2023)
INSERT INTO admin_users (username, email, password_hash, role) 
VALUES (
    'admin', 
    'admin@yannova.nl', 
    '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ',
    'Administrator'
) ON CONFLICT (username) DO NOTHING;

-- Create a function to get chat analytics
CREATE OR REPLACE FUNCTION get_chat_analytics(start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days', end_date DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_chats', COUNT(*),
        'total_sessions', COUNT(DISTINCT session_id),
        'avg_response_time', AVG(response_time_ms),
        'satisfaction_rate', AVG(sentiment_score),
        'popular_questions', (
            SELECT json_object_agg(keyword, count)
            FROM (
                SELECT 
                    CASE 
                        WHEN LOWER(message) LIKE '%offerte%' THEN 'offerte'
                        WHEN LOWER(message) LIKE '%openingstijden%' THEN 'openingstijden'
                        WHEN LOWER(message) LIKE '%ramen%' THEN 'ramen'
                        WHEN LOWER(message) LIKE '%deuren%' THEN 'deuren'
                        WHEN LOWER(message) LIKE '%prijzen%' THEN 'prijzen'
                        WHEN LOWER(message) LIKE '%contact%' THEN 'contact'
                        WHEN LOWER(message) LIKE '%garantie%' THEN 'garantie'
                        WHEN LOWER(message) LIKE '%installatie%' THEN 'installatie'
                        ELSE 'other'
                    END as keyword,
                    COUNT(*) as count
                FROM chat_messages 
                WHERE timestamp BETWEEN start_date AND end_date + INTERVAL '1 day'
                GROUP BY keyword
                ORDER BY count DESC
                LIMIT 10
            ) subq
        )
    ) INTO result
    FROM chat_messages 
    WHERE timestamp BETWEEN start_date AND end_date + INTERVAL '1 day';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_chat_analytics(DATE, DATE) TO anon, authenticated, service_role;
