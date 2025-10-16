#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class GeminiCodingCLI {
    constructor() {
        this.currentProject = process.cwd();
        this.history = [];
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async generateCode(type, description) {
        console.log(`🤖 Generating ${type} code: ${description}`);
        
        // Mock implementation for demonstration
        const mockCode = this.generateMockCode(type, description);
        
        console.log('\n📝 Generated Code:');
        console.log('='.repeat(50));
        console.log(mockCode);
        console.log('='.repeat(50));
        
        // Add to history
        this.history.push({
            type: 'generate',
            command: `${type}: ${description}`,
            result: mockCode,
            timestamp: new Date()
        });
        
        return mockCode;
    }

    generateMockCode(type, description) {
        const templates = {
            'component': `// React Component: ${description}
import React, { useState, useEffect } from 'react';
import './${type.toLowerCase()}.css';

const ${this.toPascalCase(description)} = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    
    return (
        <header className="${type.toLowerCase()}-container">
            <div className="${type.toLowerCase()}-wrapper">
                <div className="logo">
                    <h1>Yannova</h1>
                </div>
                <nav className={\`nav \${isOpen ? 'nav-open' : ''}\`}>
                    <ul className="nav-list">
                        <li><a href="/">Home</a></li>
                        <li><a href="/services">Services</a></li>
                        <li><a href="/portfolio">Portfolio</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </nav>
                <button 
                    className="menu-toggle"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </header>
    );
};

export default ${this.toPascalCase(description)};`,

            'api': `// API Endpoint: ${description}
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// ${description}
router.post('/${this.toKebabCase(description)}', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().isLength({ min: 2 })
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { email, password, name } = req.body;
        
        // Business logic here
        const result = await process${this.toPascalCase(description)}({
            email,
            password,
            name
        });

        res.json({
            success: true,
            data: result,
            message: '${description} completed successfully'
        });

    } catch (error) {
        console.error('Error in ${description}:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;`,

            'function': `// Function: ${description}
/**
 * ${description}
 * @param {Object} params - Function parameters
 * @param {string} params.input - Input string
 * @param {Object} params.options - Configuration options
 * @returns {Promise<Object>} Result object
 */
async function ${this.toCamelCase(description)}(params = {}) {
    const { input, options = {} } = params;
    
    // Input validation
    if (!input || typeof input !== 'string') {
        throw new Error('Invalid input: expected non-empty string');
    }
    
    try {
        // Main logic
        const result = {
            processed: input.trim().toLowerCase(),
            timestamp: new Date().toISOString(),
            options: options
        };
        
        // Additional processing based on options
        if (options.uppercase) {
            result.processed = result.processed.toUpperCase();
        }
        
        if (options.reverse) {
            result.processed = result.processed.split('').reverse().join('');
        }
        
        return {
            success: true,
            data: result,
            message: 'Function executed successfully'
        };
        
    } catch (error) {
        console.error('Error in ${this.toCamelCase(description)}:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = ${this.toCamelCase(description)};`
        };

        return templates[type] || `// ${type}: ${description}
// Generated code would go here
console.log('${description}');`;
    }

    toPascalCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
            index === 0 ? word.toUpperCase() : word.toLowerCase()
        ).replace(/\s+/g, '');
    }

    toCamelCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
            index === 0 ? word.toLowerCase() : word.toUpperCase()
        ).replace(/\s+/g, '');
    }

    toKebabCase(str) {
        return str.toLowerCase().replace(/\s+/g, '-');
    }

    async analyzeCode(filePath) {
        try {
            const fullPath = path.resolve(this.currentProject, filePath);
            if (!fs.existsSync(fullPath)) {
                console.log(`❌ File not found: ${fullPath}`);
                return;
            }

            const content = fs.readFileSync(fullPath, 'utf8');
            console.log(`🔍 Analyzing: ${fullPath}`);

            // Mock analysis
            const analysis = this.generateMockAnalysis(content, filePath);
            
            console.log('\n📊 Analysis Results:');
            console.log('='.repeat(50));
            console.log(analysis);
            console.log('='.repeat(50));
            
            // Add to history
            this.history.push({
                type: 'analyze',
                command: filePath,
                result: analysis,
                timestamp: new Date()
            });
            
        } catch (error) {
            console.error('❌ Error analyzing code:', error.message);
        }
    }

    generateMockAnalysis(content, filePath) {
        const lines = content.split('\n');
        const totalLines = lines.length;
        const functions = content.match(/function\s+\w+/g) || [];
        const classes = content.match(/class\s+\w+/g) || [];
        const imports = content.match(/import\s+.*from/g) || [];
        const comments = content.match(/\/\/.*|\/\*[\s\S]*?\*\//g) || [];
        
        return `Code Analysis Report for ${path.basename(filePath)}
==============================================

📊 Basic Metrics:
- Total lines: ${totalLines}
- Functions: ${functions.length}
- Classes: ${classes.length}
- Imports: ${imports.length}
- Comments: ${comments.length}

🔍 Code Quality:
- Readability: ${totalLines < 100 ? 'Good' : 'Could be improved'}
- Documentation: ${comments.length > totalLines * 0.1 ? 'Well documented' : 'Needs more comments'}
- Structure: ${classes.length > 0 ? 'Object-oriented' : 'Functional'}

⚠️  Potential Issues:
${this.findPotentialIssues(content)}

✅ Recommendations:
1. Add error handling for async operations
2. Consider adding TypeScript for better type safety
3. Add unit tests for better coverage
4. Use consistent naming conventions
5. Add JSDoc comments for functions

🎯 Performance Tips:
- Consider code splitting for large files
- Optimize imports to reduce bundle size
- Use memoization for expensive calculations
- Implement proper caching strategies`;
    }

    findPotentialIssues(content) {
        const issues = [];
        
        if (content.includes('console.log')) {
            issues.push('- Remove console.log statements in production');
        }
        
        if (content.includes('var ')) {
            issues.push('- Replace var with let/const for better scoping');
        }
        
        if (content.includes('==') && !content.includes('===')) {
            issues.push('- Use strict equality (===) instead of loose equality (==)');
        }
        
        if (content.includes('eval(')) {
            issues.push('- Avoid using eval() for security reasons');
        }
        
        if (content.includes('document.write')) {
            issues.push('- Avoid document.write() for better performance');
        }
        
        return issues.length > 0 ? issues.join('\n') : '- No major issues detected';
    }

    listFiles() {
        try {
            const files = fs.readdirSync(this.currentProject);
            console.log(`\n📁 Files in ${this.currentProject}:`);
            console.log('-'.repeat(50));
            files.forEach(file => {
                const filePath = path.join(this.currentProject, file);
                const stats = fs.statSync(filePath);
                const type = stats.isDirectory() ? '📁' : '📄';
                const size = stats.isFile() ? `(${stats.size} bytes)` : '';
                console.log(`${type} ${file} ${size}`);
            });
        } catch (error) {
            console.error('❌ Error listing files:', error.message);
        }
    }

    readFile(filePath) {
        try {
            const fullPath = path.resolve(this.currentProject, filePath);
            if (!fs.existsSync(fullPath)) {
                console.log(`❌ File not found: ${fullPath}`);
                return;
            }

            const content = fs.readFileSync(fullPath, 'utf8');
            console.log(`\n📖 Content of ${fullPath}:`);
            console.log('='.repeat(50));
            console.log(content);
            console.log('='.repeat(50));
        } catch (error) {
            console.error('❌ Error reading file:', error.message);
        }
    }

    searchCode(query) {
        console.log(`🔍 Searching for: "${query}"`);
        
        const searchInDirectory = (dir, pattern) => {
            const results = [];
            const files = fs.readdirSync(dir);
            
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                    results.push(...searchInDirectory(filePath, pattern));
                } else if (stats.isFile() && (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.css'))) {
                    try {
                        const content = fs.readFileSync(filePath, 'utf8');
                        const regex = new RegExp(pattern, 'gi');
                        const matches = content.match(regex);
                        
                        if (matches) {
                            results.push({
                                file: filePath,
                                matches: matches.length,
                                lines: content.split('\n').filter(line => regex.test(line))
                            });
                        }
                    } catch (err) {
                        // Skip files that can't be read
                    }
                }
            }
            
            return results;
        };

        try {
            const results = searchInDirectory(this.currentProject, query);
            
            if (results.length === 0) {
                console.log('❌ No matches found');
            } else {
                console.log(`\n🎯 Found ${results.length} file(s) with matches:`);
                results.forEach(result => {
                    console.log(`\n📄 ${result.file} (${result.matches} matches)`);
                    result.lines.forEach((line, index) => {
                        console.log(`   ${index + 1}: ${line.trim()}`);
                    });
                });
            }
        } catch (error) {
            console.error('❌ Error searching:', error.message);
        }
    }

    showHelp() {
        console.log(`
🚀 Gemini Coding CLI - Help
============================

Available Commands:
  help()                           - Show this help message
  generateCode(type, desc)         - Generate code (component, function, api, etc.)
  analyzeCode(filePath)            - Analyze code file
  listFiles()                      - List files in current directory
  readFile(filePath)               - Read file content
  searchCode(query)                - Search for code patterns
  history()                        - Show command history
  clear()                          - Clear screen
  exit()                           - Exit CLI

Examples:
  generateCode('component', 'Header navigation with responsive menu')
  generateCode('api', 'user authentication endpoint')
  generateCode('function', 'data validation helper')
  analyzeCode('./api/server.js')
  readFile('./index.html')
  searchCode('function.*async')
        `);
    }

    showHistory() {
        if (this.history.length === 0) {
            console.log('📝 No commands in history');
            return;
        }

        console.log('\n📝 Command History:');
        console.log('='.repeat(50));
        this.history.forEach((item, index) => {
            console.log(`${index + 1}. [${item.type}] ${item.command}`);
            console.log(`   Time: ${item.timestamp.toLocaleString()}`);
            console.log('');
        });
    }

    clear() {
        console.clear();
    }

    async start() {
        console.log(`
🚀 Gemini Coding CLI Started!
=============================
Project: ${this.currentProject}
Type 'help()' for available commands or 'exit()' to quit.

✅ CLI is ready! Try: generateCode('component', 'Header navigation')
        `);

        const processCommand = async (input) => {
            const trimmed = input.trim();
            if (!trimmed) return;

            try {
                // Handle special commands
                if (trimmed === 'exit()' || trimmed === 'exit') {
                    console.log('👋 Goodbye!');
                    this.rl.close();
                    process.exit(0);
                }

                if (trimmed === 'clear()' || trimmed === 'clear') {
                    this.clear();
                    return;
                }

                if (trimmed === 'history()' || trimmed === 'history') {
                    this.showHistory();
                    return;
                }

                // Evaluate the command
                const result = eval(trimmed);
                if (result instanceof Promise) {
                    await result;
                }
            } catch (error) {
                console.error('❌ Error:', error.message);
            }
        };

        this.rl.on('line', processCommand);
    }
}

// Create and start the CLI
const cli = new GeminiCodingCLI();

// Make CLI available globally
global.cli = cli;
global.generateCode = cli.generateCode.bind(cli);
global.analyzeCode = cli.analyzeCode.bind(cli);
global.listFiles = cli.listFiles.bind(cli);
global.readFile = cli.readFile.bind(cli);
global.searchCode = cli.searchCode.bind(cli);
global.help = cli.showHelp.bind(cli);
global.history = cli.showHistory.bind(cli);
global.clear = cli.clear.bind(cli);
global.exit = () => process.exit(0);

// Start the CLI
cli.start();
