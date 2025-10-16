#!/usr/bin/env node

/**
 * Performance Optimization Script
 * Removes console statements and optimizes code for production
 */

const fs = require('fs');
const path = require('path');

class PerformanceOptimizer {
    constructor() {
        this.processedFiles = 0;
        this.removedConsoleStatements = 0;
    }

    async optimize() {
        console.log('🚀 Starting performance optimization...');
        
        // Process JavaScript files
        await this.processDirectory('assets/js', '.js');
        
        // Process CSS files
        await this.processDirectory('assets/css', '.css');
        
        console.log(`✅ Optimization complete!`);
        console.log(`📊 Processed ${this.processedFiles} files`);
        console.log(`🗑️  Removed ${this.removedConsoleStatements} console statements`);
    }

    async processDirectory(dir, extension) {
        const fullPath = path.join(__dirname, '..', dir);
        
        if (!fs.existsSync(fullPath)) {
            return;
        }

        const files = fs.readdirSync(fullPath);
        
        for (const file of files) {
            const filePath = path.join(fullPath, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                await this.processDirectory(path.join(dir, file), extension);
            } else if (file.endsWith(extension)) {
                await this.optimizeFile(filePath);
            }
        }
    }

    async optimizeFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // Remove console statements (but keep error handling)
            const consoleRegex = /console\.(log|info|debug|warn)\s*\([^)]*\)\s*;?/g;
            const matches = content.match(consoleRegex);
            
            if (matches) {
                this.removedConsoleStatements += matches.length;
                content = content.replace(consoleRegex, '');
                modified = true;
            }

            // Remove empty lines (max 2 consecutive)
            content = content.replace(/\n{3,}/g, '\n\n');
            
            // Remove trailing whitespace
            content = content.replace(/[ \t]+$/gm, '');

            if (modified) {
                fs.writeFileSync(filePath, content);
                this.processedFiles++;
                console.log(`✨ Optimized: ${path.relative(process.cwd(), filePath)}`);
            }
        } catch (error) {
            console.error(`❌ Error optimizing ${filePath}:`, error.message);
        }
    }
}

// Run optimization
if (require.main === module) {
    const optimizer = new PerformanceOptimizer();
    optimizer.optimize().catch(console.error);
}

module.exports = PerformanceOptimizer;
