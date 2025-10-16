#!/usr/bin/env node

/**
 * Build Script for Yannova Website
 * Bundles and optimizes CSS and JavaScript files
 */

const fs = require('fs');
const path = require('path');

class BuildScript {
    constructor() {
        this.cssFiles = [
            'assets/css/main.css',
            'assets/css/quote-generator.css',
            'assets/css/layout-switcher.css',
            'assets/css/gemini-image-generator.css',
            'assets/css/ui-enhancements.css',
            'assets/css/seo-enhancements.css',
            'assets/css/ai-dashboard.css' // Added for AI Dashboard
        ];
        
        // Critical JavaScript (load first)
        this.criticalJS = [
            'assets/js/performance-optimizer.js',
            'assets/js/error-handler.js'
        ];
        
        // Main JavaScript bundle
        this.jsFiles = [
            'assets/js/main.js',
            'assets/js/ui-interactions.js',
            'assets/js/layout-switcher.js',
            'assets/js/performance-monitor.js',
            'performance-optimizer.js',
            'seo-optimizer.js'
        ];
        
        // Feature JavaScript bundle
        this.featureJS = [
            'assets/js/quote-generator.js',
            'assets/js/quote-processor.js',
            'assets/js/enhanced-form-validator.js'
        ];
        
        // Analytics JavaScript bundle
        this.analyticsJS = [
            'assets/js/analytics.js',
            'assets/js/seo.js',
            'assets/js/seo-enhanced.js',
            'assets/js/chatbot-enhanced.js'
        ];
        
        // AI Tools JavaScript bundle
        this.aiToolsJS = [
            'assets/js/admin-ai-dashboard.js',
            'assets/js/gemini-ai-tools.js'
        ];
        
        this.adminFiles = [
            'admin/secure-login.js',
            'admin/dashboard.js',
            'admin/quotes-management.js'
        ];
        
        this.outputDir = 'dist';
        this.assetsDir = path.join(this.outputDir, 'assets');
    }

    async build() {
        console.log('🚀 Starting build process...');
        
        try {
            // Create output directories
            this.createDirectories();
            
            // Bundle CSS
            await this.bundleCSS();
            
            // Bundle JavaScript
            await this.bundleCriticalJS();
            await this.bundleMainJS();
            await this.bundleFeatureJS();
            await this.bundleAnalyticsJS();
            await this.bundleAIToolsJS();
            
            // Copy other assets
            this.copyAssets();
            
            // Copy HTML files
            this.copyHTML();
            
            // Generate service worker
            this.generateServiceWorker();
            
            console.log('✅ Build completed successfully!');
            console.log(`📁 Output directory: ${this.outputDir}`);
            
        } catch (error) {
            console.error('❌ Build failed:', error.message);
            process.exit(1);
        }
    }

    createDirectories() {
        const dirs = [
            this.outputDir,
            this.assetsDir,
            path.join(this.assetsDir, 'css'),
            path.join(this.assetsDir, 'js'),
            path.join(this.assetsDir, 'images'),
            path.join(this.outputDir, 'admin')
        ];

        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`📁 Created directory: ${dir}`);
            }
        });
    }

    async bundleCSS() {
        console.log('📦 Bundling CSS...');
        
        let bundleCSS = '';
        
        // Add critical CSS first
        const criticalCSS = fs.readFileSync('assets/css/critical.css', 'utf8');
        bundleCSS += `/* Critical CSS */\n${criticalCSS}\n\n`;
        
        // Add other CSS files
        for (const file of this.cssFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                bundleCSS += `/* ${file} */\n${content}\n\n`;
            }
        }
        
        // Minify CSS (basic minification)
        const minifiedCSS = this.minifyCSS(bundleCSS);
        
        // Write bundle
        fs.writeFileSync(path.join(this.assetsDir, 'css', 'bundle.css'), bundleCSS);
        fs.writeFileSync(path.join(this.assetsDir, 'css', 'bundle.min.css'), minifiedCSS);
        
        console.log(`✅ CSS bundled: ${bundleCSS.length} characters`);
        console.log(`✅ CSS minified: ${minifiedCSS.length} characters`);
    }

    async bundleCriticalJS() {
        console.log('📦 Bundling Critical JavaScript...');
        
        let bundleJS = '';
        
        for (const file of this.criticalJS) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                bundleJS += `/* ${file} */\n${content}\n\n`;
            }
        }
        
        const minifiedJS = this.minifyJS(bundleJS);
        
        fs.writeFileSync(path.join(this.assetsDir, 'js', 'critical.js'), bundleJS);
        fs.writeFileSync(path.join(this.assetsDir, 'js', 'critical.min.js'), minifiedJS);
        
        console.log(`✅ Critical JS bundled: ${bundleJS.length} characters`);
    }

    async bundleMainJS() {
        console.log('📦 Bundling Main JavaScript...');
        
        let bundleJS = '';
        
        for (const file of this.jsFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                bundleJS += `/* ${file} */\n${content}\n\n`;
            }
        }
        
        const minifiedJS = this.minifyJS(bundleJS);
        
        fs.writeFileSync(path.join(this.assetsDir, 'js', 'main.js'), bundleJS);
        fs.writeFileSync(path.join(this.assetsDir, 'js', 'main.min.js'), minifiedJS);
        
        console.log(`✅ Main JS bundled: ${bundleJS.length} characters`);
    }

    async bundleFeatureJS() {
        console.log('📦 Bundling Feature JavaScript...');
        
        let bundleJS = '';
        
        for (const file of this.featureJS) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                bundleJS += `/* ${file} */\n${content}\n\n`;
            }
        }
        
        const minifiedJS = this.minifyJS(bundleJS);
        
        fs.writeFileSync(path.join(this.assetsDir, 'js', 'features.js'), bundleJS);
        fs.writeFileSync(path.join(this.assetsDir, 'js', 'features.min.js'), minifiedJS);
        
        console.log(`✅ Feature JS bundled: ${bundleJS.length} characters`);
    }

    async bundleAnalyticsJS() {
        console.log('📦 Bundling Analytics JavaScript...');
        
        let bundleJS = '';
        
        for (const file of this.analyticsJS) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                bundleJS += `/* ${file} */\n${content}\n\n`;
            }
        }
        
        const minifiedJS = this.minifyJS(bundleJS);
        
        fs.writeFileSync(path.join(this.assetsDir, 'js', 'analytics.js'), bundleJS);
        fs.writeFileSync(path.join(this.assetsDir, 'js', 'analytics.min.js'), minifiedJS);
        
        console.log(`✅ Analytics JS bundled: ${bundleJS.length} characters`);
    }

    minifyCSS(css) {
        return css
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
            .replace(/{\s+/g, '{') // Remove space after opening brace
            .replace(/;\s+/g, ';') // Remove space after semicolon
            .replace(/,\s+/g, ',') // Remove space after comma
            .replace(/:\s+/g, ':') // Remove space after colon
            .trim();
    }

    async bundleAIToolsJS() {
        console.log('🤖 Bundling AI Tools JavaScript...');
        
        let bundledJS = '';
        
        for (const file of this.aiToolsJS) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                bundledJS += `\n/* ${file} */\n${content}\n`;
            }
        }
        
        const minifiedJS = this.minifyJS(bundledJS);
        fs.writeFileSync(path.join(this.assetsDir, 'js', 'ai-tools-bundle.js'), minifiedJS);
        console.log('✅ AI Tools JavaScript bundled');
    }

    minifyJS(js) {
        return js
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
            .replace(/\/\/.*$/gm, '') // Remove line comments
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
            .replace(/{\s+/g, '{') // Remove space after opening brace
            .replace(/;\s+/g, ';') // Remove space after semicolon
            .replace(/,\s+/g, ',') // Remove space after comma
            .replace(/:\s+/g, ':') // Remove space after colon
            .trim();
    }

    copyAssets() {
        console.log('📁 Copying assets...');
        
        // Copy images
        const imagesDir = 'assets/images';
        if (fs.existsSync(imagesDir)) {
            this.copyDirectory(imagesDir, path.join(this.assetsDir, 'images'));
        }
        
        // Copy fonts
        const fontsDir = 'assets/fonts';
        if (fs.existsSync(fontsDir)) {
            this.copyDirectory(fontsDir, path.join(this.assetsDir, 'fonts'));
        }
        
        // Copy admin files
        this.copyDirectory('admin', path.join(this.outputDir, 'admin'));
        
        // Copy API files
        this.copyDirectory('api', path.join(this.outputDir, 'api'));
        
        console.log('✅ Assets copied');
    }

    copyHTML() {
        console.log('📄 Copying HTML files...');
        
        const htmlFiles = [
            'index.html',
            'offline.html',
            'manifest.json',
            'robots.txt',
            'sitemap.xml'
        ];
        
        htmlFiles.forEach(file => {
            if (fs.existsSync(file)) {
                fs.copyFileSync(file, path.join(this.outputDir, file));
                console.log(`✅ Copied: ${file}`);
            }
        });
    }

    generateServiceWorker() {
        console.log('🔧 Generating service worker...');
        
        const swContent = `// Service Worker for Yannova Website
const CACHE_NAME = 'yannova-v2.0.0';
const urlsToCache = [
    '/',
    '/assets/css/bundle.min.css',
    '/assets/js/critical.min.js',
    '/assets/js/main.min.js',
    '/assets/js/features.min.js',
    '/assets/js/analytics.min.js',
    '/assets/images/hero-bg.jpg',
    '/assets/images/about-team.jpg',
    '/offline.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});`;

        fs.writeFileSync(path.join(this.outputDir, 'sw.js'), swContent);
        console.log('✅ Service worker generated');
    }

    copyDirectory(src, dest) {
        if (!fs.existsSync(src)) return;
        
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const items = fs.readdirSync(src);
        items.forEach(item => {
            const srcPath = path.join(src, item);
            const destPath = path.join(dest, item);
            
            if (fs.statSync(srcPath).isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }
}

// Run build if called directly
if (require.main === module) {
    const builder = new BuildScript();
    builder.build();
}

module.exports = BuildScript;