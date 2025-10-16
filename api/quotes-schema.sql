-- Extended Supabase Schema voor Yannova Ramen en Deuren
-- Uitbreiding voor geavanceerde offerte generator

-- Quotes table voor de AI offerte generator
CREATE TABLE IF NOT EXISTS quotes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quote_id VARCHAR(50) UNIQUE NOT NULL, -- Human readable ID like QUO-1234567890
    klant_naam VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefoon VARCHAR(50),
    project_type VARCHAR(100) NOT NULL, -- 'nieuwbouw', 'renovatie', 'vervanging', 'uitbreiding'
    
    -- Product details stored as JSON
    ramen JSONB DEFAULT '[]', -- Array of window objects
    deuren JSONB DEFAULT '[]', -- Array of door objects
    extra_diensten JSONB DEFAULT '[]', -- Array of extra services
    
    -- Preferences stored as JSON
    voorkeuren JSONB DEFAULT '{}', -- Material, color, style, budget preferences
    opmerkingen TEXT,
    
    -- Quote status and pricing
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in-progress', 'completed', 'cancelled'
    estimated_value DECIMAL(10,2),
    final_price DECIMAL(10,2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Admin notes
    admin_notes TEXT,
    assigned_to UUID REFERENCES admin_users(id),
    
    -- Contact tracking
    contact_attempts INTEGER DEFAULT 0,
    last_contact_attempt TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    source VARCHAR(50) DEFAULT 'website', -- 'website', 'phone', 'email', 'admin'
    ip_address INET,
    user_agent TEXT
);

-- Quote templates table voor verschillende offerte stijlen
CREATE TABLE IF NOT EXISTS quote_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL, -- Template configuration
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quote history table voor tracking changes
CREATE TABLE IF NOT EXISTS quote_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'status_changed', 'contacted', etc.
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES admin_users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_email ON quotes(email);
CREATE INDEX IF NOT EXISTS idx_quotes_project_type ON quotes(project_type);
CREATE INDEX IF NOT EXISTS idx_quotes_assigned_to ON quotes(assigned_to);
CREATE INDEX IF NOT EXISTS idx_quote_history_quote_id ON quote_history(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_templates_active ON quote_templates(is_active);

-- Apply updated_at triggers
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quote_templates_updated_at BEFORE UPDATE ON quote_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_history ENABLE ROW LEVEL SECURITY;

-- Policies for admin access (service role can access everything)
CREATE POLICY "Service role can access all quotes" ON quotes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all quote templates" ON quote_templates FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all quote history" ON quote_history FOR ALL USING (auth.role() = 'service_role');

-- Policies for anonymous users (can create quotes)
CREATE POLICY "Anonymous users can create quotes" ON quotes FOR INSERT WITH CHECK (true);

-- Insert default quote templates
INSERT INTO quote_templates (name, description, template_data, is_default) VALUES
(
    'modern',
    'Modern template with clean design',
    '{"colors": {"primary": "#d4af37", "secondary": "#1a1a1a"}, "layout": "modern", "features": ["logo", "contact_info", "product_grid"]}',
    true
),
(
    'creative',
    'Creative template with artistic elements',
    '{"colors": {"primary": "#ff6b6b", "secondary": "#4ecdc4"}, "layout": "creative", "features": ["logo", "contact_info", "product_cards", "testimonials"]}',
    false
),
(
    'corporate',
    'Professional corporate template',
    '{"colors": {"primary": "#2c3e50", "secondary": "#34495e"}, "layout": "corporate", "features": ["logo", "contact_info", "product_table", "terms"]}',
    false
),
(
    'minimal',
    'Minimal template with focus on content',
    '{"colors": {"primary": "#95a5a6", "secondary": "#7f8c8d"}, "layout": "minimal", "features": ["logo", "contact_info", "product_list"]}',
    false
) ON CONFLICT DO NOTHING;

-- Create a function to generate quote ID
CREATE OR REPLACE FUNCTION generate_quote_id()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_id VARCHAR(50);
    counter INTEGER;
BEGIN
    -- Get current date in YYMMDD format
    new_id := 'QUO-' || TO_CHAR(NOW(), 'YYMMDD') || '-';
    
    -- Get count of quotes created today
    SELECT COUNT(*) INTO counter 
    FROM quotes 
    WHERE created_at::date = CURRENT_DATE;
    
    -- Add counter with leading zeros
    new_id := new_id || LPAD((counter + 1)::text, 4, '0');
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to calculate quote value
CREATE OR REPLACE FUNCTION calculate_quote_value(
    p_project_type VARCHAR(100),
    p_ramen JSONB DEFAULT '[]',
    p_deuren JSONB DEFAULT '[]'
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    base_value DECIMAL(10,2) := 0;
    raam_value DECIMAL(10,2) := 0;
    deur_value DECIMAL(10,2) := 0;
    raam_item JSONB;
    deur_item JSONB;
BEGIN
    -- Base value by project type
    CASE p_project_type
        WHEN 'nieuwbouw' THEN base_value := 15000;
        WHEN 'renovatie' THEN base_value := 8000;
        WHEN 'vervanging' THEN base_value := 5000;
        WHEN 'uitbreiding' THEN base_value := 10000;
        ELSE base_value := 5000;
    END CASE;
    
    -- Calculate window values
    FOR raam_item IN SELECT * FROM jsonb_array_elements(p_ramen)
    LOOP
        CASE raam_item->>'type'
            WHEN 'dubbelglas' THEN raam_value := raam_value + (800 * (raam_item->>'aantal')::INTEGER);
            WHEN 'drievoudigglas' THEN raam_value := raam_value + (1200 * (raam_item->>'aantal')::INTEGER);
            WHEN 'energiezuinig' THEN raam_value := raam_value + (1000 * (raam_item->>'aantal')::INTEGER);
            ELSE raam_value := raam_value + (500 * (raam_item->>'aantal')::INTEGER);
        END CASE;
    END LOOP;
    
    -- Calculate door values
    FOR deur_item IN SELECT * FROM jsonb_array_elements(p_deuren)
    LOOP
        CASE deur_item->>'type'
            WHEN 'binnendeur' THEN deur_value := deur_value + (300 * (deur_item->>'aantal')::INTEGER);
            WHEN 'buitendeur' THEN deur_value := deur_value + (800 * (deur_item->>'aantal')::INTEGER);
            WHEN 'schuifdeur' THEN deur_value := deur_value + (1200 * (deur_item->>'aantal')::INTEGER);
            WHEN 'garagedeur' THEN deur_value := deur_value + (2000 * (deur_item->>'aantal')::INTEGER);
            ELSE deur_value := deur_value + (400 * (deur_item->>'aantal')::INTEGER);
        END CASE;
    END LOOP;
    
    RETURN base_value + raam_value + deur_value;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get quote statistics
CREATE OR REPLACE FUNCTION get_quote_analytics(start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days', end_date DATE DEFAULT CURRENT_DATE)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_quotes', COUNT(*),
        'pending_quotes', COUNT(*) FILTER (WHERE status = 'pending'),
        'in_progress_quotes', COUNT(*) FILTER (WHERE status = 'in-progress'),
        'completed_quotes', COUNT(*) FILTER (WHERE status = 'completed'),
        'cancelled_quotes', COUNT(*) FILTER (WHERE status = 'cancelled'),
        'average_value', AVG(estimated_value),
        'total_value', SUM(estimated_value),
        'project_types', (
            SELECT json_object_agg(project_type, count)
            FROM (
                SELECT project_type, COUNT(*) as count
                FROM quotes 
                WHERE created_at::date BETWEEN start_date AND end_date
                GROUP BY project_type
                ORDER BY count DESC
            ) subq
        ),
        'monthly_trend', (
            SELECT json_object_agg(date_trunc('month', created_at)::date, count)
            FROM (
                SELECT created_at, COUNT(*) as count
                FROM quotes 
                WHERE created_at::date BETWEEN start_date AND end_date
                GROUP BY date_trunc('month', created_at)
                ORDER BY date_trunc('month', created_at)
            ) subq
        )
    ) INTO result
    FROM quotes 
    WHERE created_at::date BETWEEN start_date AND end_date;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_quote_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION calculate_quote_value(VARCHAR(100), JSONB, JSONB) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_quote_analytics(DATE, DATE) TO anon, authenticated, service_role;
