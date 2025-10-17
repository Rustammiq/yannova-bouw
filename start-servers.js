#!/usr/bin/env node

/**
 * Start Both Servers Script
 * Alternative to concurrently for starting both website and API servers
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Yannova Servers...\n');

// Start website server
console.log('📱 Starting Website Server (port 3002)...');
const websiteServer = spawn('python3', ['-m', 'http.server', '3002'], {
    stdio: 'pipe',
    cwd: process.cwd()
});

websiteServer.stdout.on('data', (data) => {
    console.log(`[Website] ${data.toString().trim()}`);
});

websiteServer.stderr.on('data', (data) => {
    console.log(`[Website Error] ${data.toString().trim()}`);
});

// Start API server
console.log('🔌 Starting API Server (port 3003)...');
const apiServer = spawn('node', ['api-server.js'], {
    stdio: 'pipe',
    cwd: process.cwd()
});

apiServer.stdout.on('data', (data) => {
    console.log(`[API] ${data.toString().trim()}`);
});

apiServer.stderr.on('data', (data) => {
    console.log(`[API Error] ${data.toString().trim()}`);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    websiteServer.kill();
    apiServer.kill();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down servers...');
    websiteServer.kill();
    apiServer.kill();
    process.exit(0);
});

// Check if servers started successfully
setTimeout(() => {
    console.log('\n✅ Servers started successfully!');
    console.log('🌐 Website: http://localhost:3002');
    console.log('🔌 API: http://localhost:3003');
    console.log('\nPress Ctrl+C to stop both servers\n');
}, 2000);
