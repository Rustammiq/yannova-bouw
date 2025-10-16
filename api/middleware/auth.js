const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            error: 'Access token required' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verify user exists in Supabase
        const { data: user, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', decoded.userId)
            .single();

        if (error || !user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid token' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            error: 'Invalid token' 
        });
    }
};

module.exports = { authenticateToken };
