/**
 * Simple API Server for Yannova Website
 * Handles analytics and basic API endpoints
 */

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const PORT = 3003;

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
};

// Handle CORS preflight requests
function handleCORS(res) {
    res.writeHead(200, corsHeaders);
    res.end();
}

// Analytics endpoint
function handleAnalytics(req, res) {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            console.log('Analytics Event:', data);
            
            res.writeHead(200, corsHeaders);
            res.end(JSON.stringify({ success: true, message: 'Event logged' }));
        } catch (error) {
            res.writeHead(400, corsHeaders);
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
    });
}

// Health check endpoint
function handleHealth(req, res) {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'Yannova API Server'
    }));
}

// Main server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        return handleCORS(res);
    }

    // Route handling
    switch (pathname) {
        case '/api/analytics/event':
            if (method === 'POST') {
                handleAnalytics(req, res);
            } else {
                res.writeHead(405, corsHeaders);
                res.end(JSON.stringify({ error: 'Method not allowed' }));
            }
            break;
            
        case '/api/health':
            handleHealth(req, res);
            break;
            
        default:
            res.writeHead(404, corsHeaders);
            res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Yannova API Server running on port ${PORT}`);
    console.log(`📊 Analytics endpoint: http://localhost:${PORT}/api/analytics/event`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Shutting down API server...');
    server.close(() => {
        console.log('✅ API server stopped');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 Shutting down API server...');
    server.close(() => {
        console.log('✅ API server stopped');
        process.exit(0);
    });
});
