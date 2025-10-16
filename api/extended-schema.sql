-- Extended Supabase Schema for Yannova Website
-- This file contains additional tables for password reset and content management

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Website content management table
CREATE TABLE IF NOT EXISTS website_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page TEXT NOT NULL UNIQUE,
    seo_data JSONB,
    homepage_data JSONB,
    media_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES admin_users(id)
);

-- Content history tracking table
CREATE TABLE IF NOT EXISTS content_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page TEXT NOT NULL,
    action TEXT NOT NULL, -- 'created', 'updated', 'deleted'
    changes JSONB,
    old_values JSONB,
    new_values JSONB,
    updated_by UUID REFERENCES admin_users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media library table
CREATE TABLE IF NOT EXISTS media_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    alt_text TEXT,
    description TEXT,
    uploaded_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_used ON password_reset_tokens(used);

CREATE INDEX IF NOT EXISTS idx_website_content_page ON website_content(page);
CREATE INDEX IF NOT EXISTS idx_content_history_page ON content_history(page);
CREATE INDEX IF NOT EXISTS idx_content_history_updated_by ON content_history(updated_by);
CREATE INDEX IF NOT EXISTS idx_content_history_created_at ON content_history(created_at);

CREATE INDEX IF NOT EXISTS idx_media_library_uploaded_by ON media_library(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_library_mime_type ON media_library(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON media_library(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_password_reset_tokens_updated_at 
    BEFORE UPDATE ON password_reset_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_content_updated_at 
    BEFORE UPDATE ON website_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_library_updated_at 
    BEFORE UPDATE ON media_library 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user if not exists
INSERT INTO admin_users (username, email, password_hash, role, is_active)
VALUES (
    'admin',
    'admin@yannova.nl',
    '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', -- password: admin123
    'Administrator',
    true
) ON CONFLICT (username) DO NOTHING;

-- Insert default website content
INSERT INTO website_content (page, seo_data, homepage_data, media_data)
VALUES (
    'homepage',
    '{
        "pageTitle": "Yannova Ramen en Deuren | Professionele Ramen en Deuren",
        "metaDescription": "Yannova Ramen en Deuren - Uw specialist in hoogwaardige ramen en deuren. Professionele installatie en advies voor uw woning.",
        "metaKeywords": "ramen, deuren, schuifdeuren, garagedeuren, installatie, renovatie, isolatieglas",
        "ogTitle": "Yannova Ramen en Deuren | Professionele Ramen en Deuren",
        "ogDescription": "Uw specialist in hoogwaardige ramen en deuren. Professionele installatie en advies voor uw woning.",
        "ogImage": "https://yannovabouw.nl/assets/images/about-team.jpg",
        "businessName": "Yannova Ramen en Deuren",
        "businessPhone": "+31-123-456-789",
        "businessEmail": "info@yannovabouw.nl",
        "businessAddress": "Hoofdstraat 123, 1000 AB Amsterdam, Nederland"
    }',
    '{
        "hero": {
            "title": "Ramen en Deuren dromen?",
            "subtitle": "Wij realiseren ze graag.",
            "buttonText": "Vraag een offerte aan",
            "backgroundImage": "../assets/images/hero-bg.jpg"
        },
        "about": {
            "title": "Over",
            "subtitle": "Uw specialist in ramen en deuren",
            "text": "Een droomhuis realiseren met perfecte ramen en deuren is zoveel fijner met een toegewijde specialist aan uw zijde.\n\nYannova Ramen en Deuren is uw ervaren partner voor hoogwaardige ramen en deuren. Wij realiseren zowel klassieke als moderne oplossingen voor particulieren en professionals en dit voor ieders budget.\n\nVan het eerste advies tot de oplevering: we gaan steeds voor perfectie.",
            "image": "../assets/images/about-team.jpg"
        },
        "services": {
            "title": "Aanbod",
            "subtitle": "Professionele oplossingen voor uw woning",
            "items": [
                {
                    "icon": "fas fa-window-maximize",
                    "title": "Ramen",
                    "description": "Hoogwaardige ramen in verschillende stijlen en materialen. Van klassiek tot modern, energiezuinig isolatieglas voor optimaal comfort."
                },
                {
                    "icon": "fas fa-door-open",
                    "title": "Deuren",
                    "description": "Stijlvolle binnendeuren en veilige buitendeuren. Volledig op maat gemaakt voor elke woning en stijl."
                },
                {
                    "icon": "fas fa-door-closed",
                    "title": "Schuifdeuren",
                    "description": "Moderne schuifdeuren voor een open en ruimtelijk gevoel. Perfect voor binnen en buitengebruik."
                },
                {
                    "icon": "fas fa-warehouse",
                    "title": "Garagedeuren",
                    "description": "Professionele garagedeuren met hoge isolatiewaarden. Veilig, duurzaam en stijlvol."
                }
            ]
        },
        "contact": {
            "title": "Contact",
            "subtitle": "Uw bouwplannen bespreken?",
            "address": "Industrieweg 123, 1234 AB Amsterdam",
            "phone": "+32 (0)477 28 10 28",
            "email": "info@yannova.nl",
            "hours": "Ma-Vr: 8:00-18:00 | Za: 9:00-16:00"
        }
    }',
    '[]'
) ON CONFLICT (page) DO NOTHING;

-- Create RLS (Row Level Security) policies
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

-- Password reset tokens policies (only accessible by service role)
CREATE POLICY "Service role can manage password reset tokens" ON password_reset_tokens
    FOR ALL USING (auth.role() = 'service_role');

-- Website content policies (only accessible by service role)
CREATE POLICY "Service role can manage website content" ON website_content
    FOR ALL USING (auth.role() = 'service_role');

-- Content history policies (only accessible by service role)
CREATE POLICY "Service role can manage content history" ON content_history
    FOR ALL USING (auth.role() = 'service_role');

-- Media library policies (only accessible by service role)
CREATE POLICY "Service role can manage media library" ON media_library
    FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON password_reset_tokens TO service_role;
GRANT ALL ON website_content TO service_role;
GRANT ALL ON content_history TO service_role;
GRANT ALL ON media_library TO service_role;

-- Create function to clean up expired password reset tokens
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW() OR used = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get content by page
CREATE OR REPLACE FUNCTION get_website_content(page_name TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'seo', seo_data,
        'homepage', homepage_data,
        'media', media_data
    ) INTO result
    FROM website_content
    WHERE page = page_name;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Create function to update website content
CREATE OR REPLACE FUNCTION update_website_content(
    page_name TEXT,
    seo_data JSONB,
    homepage_data JSONB,
    media_data JSONB,
    user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO website_content (page, seo_data, homepage_data, media_data, updated_by)
    VALUES (page_name, seo_data, homepage_data, media_data, user_id)
    ON CONFLICT (page) 
    DO UPDATE SET 
        seo_data = EXCLUDED.seo_data,
        homepage_data = EXCLUDED.homepage_data,
        media_data = EXCLUDED.media_data,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW();
    
    -- Log the change
    INSERT INTO content_history (page, action, changes, updated_by, notes)
    VALUES (page_name, 'updated', jsonb_build_object(
        'seo', seo_data,
        'homepage', homepage_data,
        'media', media_data
    ), user_id, 'Content updated via admin panel');
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
