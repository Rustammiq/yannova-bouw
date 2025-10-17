#!/usr/bin/env node

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBUMZAs138YUIeN3xUpWvoJ-VAta_NNfz4');

class GeminiCodingCLI {
    constructor() {
        this.currentProject = process.cwd();
        this.history = [];
        this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async generateCode(type, description) {
        console.log(`🤖 Generating ${type} code: ${description}`);
        
        const prompt = `Generate a professional ${type} for: ${description}
        
Requirements:
- Use modern JavaScript/HTML/CSS
- Include proper error handling
- Add comments for clarity
- Make it production-ready
- Follow best practices

Please provide clean, well-structured code with explanations.`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const code = response.text();
            
            console.log('\n📝 Generated Code:');
            console.log('='.repeat(50));
            console.log(code);
            console.log('='.repeat(50));
            
            // Add to history
            this.history.push({
                type: 'generate',
                command: `${type}: ${description}`,
                result: code,
                timestamp: new Date()
            });
            
            return code;
        } catch (error) {
            console.error('❌ Error generating code:', error.message);
            return null;
        }
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

            const prompt = `Analyze this code and provide:
1. Code quality assessment
2. Potential issues or bugs
3. Performance improvements
4. Security considerations
5. Best practices recommendations

Code to analyze:
\`\`\`javascript
${content}
\`\`\`

Please provide a detailed analysis.`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const analysis = response.text();
            
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

    async optimizeCode(filePath) {
        try {
            const fullPath = path.resolve(this.currentProject, filePath);
            if (!fs.existsSync(fullPath)) {
                console.log(`❌ File not found: ${fullPath}`);
                return;
            }

            const content = fs.readFileSync(fullPath, 'utf8');
            console.log(`⚡ Optimizing: ${fullPath}`);

            const prompt = `Optimize this code for better performance, readability, and maintainability:

\`\`\`javascript
${content}
\`\`\`

Please provide:
1. Optimized version of the code
2. Explanation of optimizations made
3. Performance improvements
4. Best practices applied`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const optimized = response.text();
            
            console.log('\n⚡ Optimized Code:');
            console.log('='.repeat(50));
            console.log(optimized);
            console.log('='.repeat(50));
            
        } catch (error) {
            console.error('❌ Error optimizing code:', error.message);
        }
    }

    async generateTests(filePath) {
        try {
            const fullPath = path.resolve(this.currentProject, filePath);
            if (!fs.existsSync(fullPath)) {
                console.log(`❌ File not found: ${fullPath}`);
                return;
            }

            const content = fs.readFileSync(fullPath, 'utf8');
            console.log(`🧪 Generating tests for: ${fullPath}`);

            const prompt = `Generate comprehensive unit tests for this code using Jest:

\`\`\`javascript
${content}
\`\`\`

Please provide:
1. Complete test suite with multiple test cases
2. Edge cases and error scenarios
3. Mocking where appropriate
4. Clear test descriptions
5. Good test coverage`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const tests = response.text();
            
            console.log('\n🧪 Generated Tests:');
            console.log('='.repeat(50));
            console.log(tests);
            console.log('='.repeat(50));
            
        } catch (error) {
            console.error('❌ Error generating tests:', error.message);
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
  optimizeCode(filePath)           - Optimize existing code
  generateTests(filePath)          - Generate unit tests
  listFiles()                      - List files in current directory
  readFile(filePath)               - Read file content
  searchCode(query)                - Search for code patterns
  history()                        - Show command history
  clear()                          - Clear screen
  exit()                           - Exit CLI

Examples:
  generateCode('component', 'Header navigation with responsive menu')
  generateCode('api', 'user authentication endpoint')
  analyzeCode('./api/server.js')
  optimizeCode('./assets/js/main.js')
  generateTests('./api/gemini-api.js')
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
global.optimizeCode = cli.optimizeCode.bind(cli);
global.generateTests = cli.generateTests.bind(cli);
global.listFiles = cli.listFiles.bind(cli);
global.readFile = cli.readFile.bind(cli);
global.searchCode = cli.searchCode.bind(cli);
global.help = cli.showHelp.bind(cli);
global.history = cli.showHistory.bind(cli);
global.clear = cli.clear.bind(cli);
global.exit = () => process.exit(0);

// Start the CLI
cli.start();
