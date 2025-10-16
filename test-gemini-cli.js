#!/usr/bin/env node

// Test script for Gemini Coding CLI
const { spawn } = require('child_process');

console.log('🚀 Testing Gemini Coding CLI...\n');

// Start the CLI process
const cli = spawn('node', ['gemini-cli.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: '/Users/innovars_lab/Yannovabouw'
});

// Test commands
const testCommands = [
    'help()',
    'listFiles()',
    'generateCode("component", "Header navigation with responsive menu")',
    'searchCode("function")',
    'exit()'
];

let commandIndex = 0;

cli.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    
    // Send next command after a delay
    if (output.includes('CLI is ready') && commandIndex === 0) {
        setTimeout(() => {
            cli.stdin.write(testCommands[commandIndex] + '\n');
            commandIndex++;
        }, 1000);
    } else if (output.includes('Generated Code:') && commandIndex < testCommands.length - 1) {
        setTimeout(() => {
            cli.stdin.write(testCommands[commandIndex] + '\n');
            commandIndex++;
        }, 2000);
    }
});

cli.stderr.on('data', (data) => {
    console.error('Error:', data.toString());
});

cli.on('close', (code) => {
    console.log(`\n✅ CLI test completed with exit code: ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
    cli.kill();
    process.exit(0);
});
