/**
 * Security Middleware for Yannova Admin Panel
 * Implements rate limiting, CSRF protection, input validation, and security headers
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const crypto = require('crypto');

class SecurityMiddleware {
    constructor() {
        this.failedAttempts = new Map();
        this.blockedIPs = new Set();
        this.csrfTokens = new Map();
    }

    /**
     * Rate limiting for admin endpoints
     */
    getAdminRateLimit() {
        return rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5, // 5 attempts per window
            message: {
                success: false,
                message: 'Te veel inlogpogingen. Probeer het over 15 minuten opnieuw.'
            },
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                const ip = req.ip;
                this.recordFailedAttempt(ip);
                res.status(429).json({
                    success: false,
                    message: 'Te veel inlogpogingen. Probeer het over 15 minuten opnieuw.'
                });
            }
        });
    }

    /**
     * Rate limiting for general API endpoints
     */
    getGeneralRateLimit() {
        return rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // 100 requests per window
            message: {
                success: false,
                message: 'Te veel verzoeken. Probeer het later opnieuw.'
            },
            standardHeaders: true,
            legacyHeaders: false
        });
    }

    /**
     * Security headers middleware
     */
    getSecurityHeaders() {
        return helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
                    scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "'unsafe-inline'", "'unsafe-eval'"],
                    scriptSrcAttr: ["'unsafe-hashes'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "https://wwchpqroenvomcvkecuh.supabase.co"],
                    fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"]
                }
            },
            crossOriginEmbedderPolicy: false,
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            }
        });
    }

    /**
     * CSRF protection middleware
     */
    csrfProtection() {
        return (req, res, next) => {
            if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
                return next();
            }

            const token = req.headers['x-csrf-token'] || req.body._csrf;
            const sessionId = req.sessionID || req.ip;

            if (!token || !this.validateCSRFToken(token, sessionId)) {
                return res.status(403).json({
                    success: false,
                    message: 'CSRF token ongeldig'
                });
            }

            next();
        };
    }

    /**
     * Generate CSRF token
     */
    generateCSRFToken(sessionId) {
        const token = crypto.randomBytes(32).toString('hex');
        this.csrfTokens.set(sessionId, {
            token,
            timestamp: Date.now()
        });
        return token;
    }

    /**
     * Validate CSRF token
     */
    validateCSRFToken(token, sessionId) {
        const stored = this.csrfTokens.get(sessionId);
        if (!stored) return false;

        // Token expires after 1 hour
        if (Date.now() - stored.timestamp > 3600000) {
            this.csrfTokens.delete(sessionId);
            return false;
        }

        return stored.token === token;
    }

    /**
     * Input validation middleware
     */
    validateInput(rules) {
        return (req, res, next) => {
            const errors = [];

            for (const [field, rule] of Object.entries(rules)) {
                const value = req.body[field] || req.query[field] || req.params[field];

                if (rule.required && (!value || value.trim() === '')) {
                    errors.push(`${field} is verplicht`);
                    continue;
                }

                if (value) {
                    // Sanitize input
                    const sanitized = this.sanitizeInput(value, rule.type);
                    req.body[field] = sanitized;

                    // Validate based on type
                    if (rule.type === 'email' && !validator.isEmail(sanitized)) {
                        errors.push(`${field} moet een geldig emailadres zijn`);
                    }

                    if (rule.type === 'phone' && !this.isValidPhone(sanitized)) {
                        errors.push(`${field} moet een geldig telefoonnummer zijn`);
                    }

                    if (rule.minLength && sanitized.length < rule.minLength) {
                        errors.push(`${field} moet minimaal ${rule.minLength} tekens bevatten`);
                    }

                    if (rule.maxLength && sanitized.length > rule.maxLength) {
                        errors.push(`${field} mag maximaal ${rule.maxLength} tekens bevatten`);
                    }

                    if (rule.pattern && !rule.pattern.test(sanitized)) {
                        errors.push(`${field} heeft een ongeldig formaat`);
                    }
                }
            }

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validatiefouten',
                    errors
                });
            }

            next();
        };
    }

    /**
     * Sanitize input based on type
     */
    sanitizeInput(value, type) {
        if (typeof value !== 'string') return value;

        switch (type) {
            case 'email':
                return validator.normalizeEmail(value) || value;
            case 'text':
            case 'textarea':
                return validator.escape(value.trim());
            case 'html':
                return validator.stripLow(value);
            case 'phone':
                return value.replace(/[^\d+\-\s()]/g, '');
            default:
                return validator.escape(value.trim());
        }
    }

    /**
     * Validate phone number
     */
    isValidPhone(phone) {
        const phoneRegex = /^(\+31|0)[1-9][0-9]{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    /**
     * Record failed login attempt
     */
    recordFailedAttempt(ip) {
        const attempts = this.failedAttempts.get(ip) || 0;
        this.failedAttempts.set(ip, attempts + 1);

        // Block IP after 10 failed attempts
        if (attempts + 1 >= 10) {
            this.blockedIPs.add(ip);
            console.log(`IP ${ip} blocked due to too many failed attempts`);
        }
    }

    /**
     * Check if IP is blocked
     */
    isIPBlocked(ip) {
        return this.blockedIPs.has(ip);
    }

    /**
     * Clear failed attempts for successful login
     */
    clearFailedAttempts(ip) {
        this.failedAttempts.delete(ip);
        this.blockedIPs.delete(ip);
    }

    /**
     * Admin authentication middleware
     */
    authenticateAdmin() {
        return async (req, res, next) => {
            try {
                const token = req.headers.authorization?.replace('Bearer ', '');
                
                if (!token) {
                    return res.status(401).json({
                        success: false,
                        message: 'Geen authenticatie token'
                    });
                }

                // Verify JWT token
                const decoded = this.verifyJWT(token);
                if (!decoded) {
                    return res.status(401).json({
                        success: false,
                        message: 'Ongeldige token'
                    });
                }

                // Check if user still exists and is active
                const { data: user, error } = await supabase
                    .from('admin_users')
                    .select('id, username, role, is_active')
                    .eq('id', decoded.userId)
                    .eq('is_active', true)
                    .single();

                if (error || !user) {
                    return res.status(401).json({
                        success: false,
                        message: 'Gebruiker niet gevonden of inactief'
                    });
                }

                req.user = user;
                next();

            } catch (error) {
                console.error('Auth error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Authenticatie fout'
                });
            }
        };
    }

    /**
     * Role-based authorization
     */
    requireRole(roles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Niet geauthenticeerd'
                });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Onvoldoende rechten'
                });
            }

            next();
        };
    }

    /**
     * Verify JWT token
     */
    verifyJWT(token) {
        try {
            const jwt = require('jsonwebtoken');
            const secret = process.env.JWT_SECRET || 'your-secret-key';
            return jwt.verify(token, secret);
        } catch (error) {
            return null;
        }
    }

    /**
     * Generate JWT token
     */
    generateJWT(payload) {
        const jwt = require('jsonwebtoken');
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        return jwt.sign(payload, secret, { expiresIn: '8h' });
    }

    /**
     * Log security events
     */
    logSecurityEvent(event, details) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            details,
            ip: details.ip || 'unknown'
        };

        console.log('SECURITY EVENT:', JSON.stringify(logEntry, null, 2));
        
        // In production, send to logging service
        // this.sendToLoggingService(logEntry);
    }

    /**
     * Cleanup expired data
     */
    cleanup() {
        // Clean up expired CSRF tokens
        const now = Date.now();
        for (const [sessionId, data] of this.csrfTokens.entries()) {
            if (now - data.timestamp > 3600000) { // 1 hour
                this.csrfTokens.delete(sessionId);
            }
        }

        // Clean up old failed attempts
        for (const [ip, attempts] of this.failedAttempts.entries()) {
            if (attempts === 0) {
                this.failedAttempts.delete(ip);
            }
        }
    }
}

// Initialize cleanup interval
const security = new SecurityMiddleware();
setInterval(() => security.cleanup(), 300000); // Cleanup every 5 minutes

module.exports = security;
