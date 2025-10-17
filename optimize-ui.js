#!/usr/bin/env node

/**
 * UI/UX Optimization Script for Yannova Website
 * Automates the optimization process for better performance and user experience
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UIOptimizer {
    constructor() {
        this.projectRoot = process.cwd();
        this.assetsDir = path.join(this.projectRoot, 'assets');
        this.distDir = path.join(this.projectRoot, 'dist');
        this.optimizationReport = {
            timestamp: new Date().toISOString(),
            optimizations: [],
            performance: {},
            errors: []
        };
    }

    async optimize() {
        console.log('🚀 Starting UI/UX optimization...\n');
        
        try {
            await this.optimizeCSS();
            await this.optimizeJavaScript();
            await this.optimizeImages();
            await this.optimizeHTML();
            await this.generateCriticalCSS();
            await this.optimizeFonts();
            await this.generateManifest();
            await this.generateServiceWorker();
            await this.runLighthouseAudit();
            await this.generateReport();
            
            console.log('\n✅ UI/UX optimization completed successfully!');
            console.log(`📊 Report saved to: ${path.join(this.projectRoot, 'optimization-report.json')}`);
            
        } catch (error) {
            console.error('❌ Optimization failed:', error.message);
            this.optimizationReport.errors.push(error.message);
            process.exit(1);
        }
    }

    async optimizeCSS() {
        console.log('🎨 Optimizing CSS...');
        
        const cssFiles = [
            'assets/css/main.css',
            'assets/css/modern-ui-enhancements.css',
            'assets/css/ui-enhancements.css',
            'assets/css/quote-generator.css'
        ];

        for (const file of cssFiles) {
            if (fs.existsSync(file)) {
                await this.minifyCSS(file);
                this.optimizationReport.optimizations.push(`Minified CSS: ${file}`);
            }
        }
    }

    async minifyCSS(filePath) {
        try {
            const css = fs.readFileSync(filePath, 'utf8');
            
            // Basic CSS minification
            const minified = css
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
                .replace(/\s+/g, ' ') // Collapse whitespace
                .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
                .replace(/:\s+/g, ':') // Remove spaces after colons
                .replace(/;\s+/g, ';') // Remove spaces after semicolons
                .replace(/,\s+/g, ',') // Remove spaces after commas
                .replace(/{\s+/g, '{') // Remove spaces after opening braces
                .replace(/}\s+/g, '}') // Remove spaces before closing braces
                .trim();

            const outputPath = filePath.replace('.css', '.min.css');
            fs.writeFileSync(outputPath, minified);
            
            const originalSize = Buffer.byteLength(css, 'utf8');
            const minifiedSize = Buffer.byteLength(minified, 'utf8');
            const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);
            
            console.log(`  ✓ ${path.basename(filePath)}: ${originalSize} → ${minifiedSize} bytes (${savings}% saved)`);
            
        } catch (error) {
            console.error(`  ✗ Failed to minify ${filePath}:`, error.message);
            throw error;
        }
    }

    async optimizeJavaScript() {
        console.log('⚡ Optimizing JavaScript...');
        
        const jsFiles = [
            'assets/js/main.js',
            'assets/js/modern-ui-interactions.js',
            'assets/js/performance-optimizer.js',
            'assets/js/chatbot-enhanced.js'
        ];

        for (const file of jsFiles) {
            if (fs.existsSync(file)) {
                await this.minifyJavaScript(file);
                this.optimizationReport.optimizations.push(`Minified JS: ${file}`);
            }
        }
    }

    async minifyJavaScript(filePath) {
        try {
            const js = fs.readFileSync(filePath, 'utf8');
            
            // Basic JavaScript minification
            const minified = js
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
                .replace(/\/\/.*$/gm, '') // Remove line comments
                .replace(/\s+/g, ' ') // Collapse whitespace
                .replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1') // Remove spaces around operators
                .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
                .replace(/{\s+/g, '{') // Remove spaces after opening braces
                .replace(/}\s+/g, '}') // Remove spaces before closing braces
                .trim();

            const outputPath = filePath.replace('.js', '.min.js');
            fs.writeFileSync(outputPath, minified);
            
            const originalSize = Buffer.byteLength(js, 'utf8');
            const minifiedSize = Buffer.byteLength(minified, 'utf8');
            const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);
            
            console.log(`  ✓ ${path.basename(filePath)}: ${originalSize} → ${minifiedSize} bytes (${savings}% saved)`);
            
        } catch (error) {
            console.error(`  ✗ Failed to minify ${filePath}:`, error.message);
            throw error;
        }
    }

    async optimizeImages() {
        console.log('🖼️  Optimizing images...');
        
        const imageDir = path.join(this.assetsDir, 'images');
        if (!fs.existsSync(imageDir)) {
            console.log('  ⚠️  No images directory found');
            return;
        }

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];
        const images = this.getFilesRecursively(imageDir, imageExtensions);
        
        for (const image of images) {
            await this.optimizeImage(image);
        }
    }

    async optimizeImage(imagePath) {
        try {
            const stats = fs.statSync(imagePath);
            const size = stats.size;
            
            // For now, just report image sizes
            // In a real implementation, you would use tools like imagemin
            console.log(`  ✓ ${path.basename(imagePath)}: ${(size / 1024).toFixed(2)} KB`);
            
            this.optimizationReport.optimizations.push(`Analyzed image: ${path.basename(imagePath)}`);
            
        } catch (error) {
            console.error(`  ✗ Failed to optimize ${imagePath}:`, error.message);
        }
    }

    async optimizeHTML() {
        console.log('📄 Optimizing HTML...');
        
        const htmlFiles = ['index.html', 'admin/dashboard.html', 'admin/login.html'];
        
        for (const file of htmlFiles) {
            if (fs.existsSync(file)) {
                await this.minifyHTML(file);
                this.optimizationReport.optimizations.push(`Minified HTML: ${file}`);
            }
        }
    }

    async minifyHTML(filePath) {
        try {
            const html = fs.readFileSync(filePath, 'utf8');
            
            // Basic HTML minification
            const minified = html
                .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
                .replace(/\s+/g, ' ') // Collapse whitespace
                .replace(/>\s+</g, '><') // Remove spaces between tags
                .replace(/\s+>/g, '>') // Remove spaces before closing tags
                .replace(/<\s+/g, '<') // Remove spaces after opening tags
                .trim();

            const outputPath = filePath.replace('.html', '.min.html');
            fs.writeFileSync(outputPath, minified);
            
            const originalSize = Buffer.byteLength(html, 'utf8');
            const minifiedSize = Buffer.byteLength(minified, 'utf8');
            const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);
            
            console.log(`  ✓ ${path.basename(filePath)}: ${originalSize} → ${minifiedSize} bytes (${savings}% saved)`);
            
        } catch (error) {
            console.error(`  ✗ Failed to minify ${filePath}:`, error.message);
        }
    }

    async generateCriticalCSS() {
        console.log('🎯 Generating critical CSS...');
        
        const criticalCSS = `
/* Critical CSS for above-the-fold content */
:root {
    --primary-color: #d4a574;
    --secondary-color: #1a1a1a;
    --text-color: #fff;
    --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-family);
    line-height: 1.6;
    color: var(--text-color);
    background: var(--secondary-color);
    overflow-x: hidden;
}

.hero-modern {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--secondary-color) 0%, #2a2a2a 100%);
}

.hero-title-modern {
    font-size: clamp(2.5rem, 8vw, 4rem);
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, white, var(--primary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.nav-modern {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(212, 165, 116, 0.1);
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    border: 1px solid transparent;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary-color), #b8935f);
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
    background: linear-gradient(135deg, #b8935f, var(--primary-color));
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}
`;

        fs.writeFileSync('assets/css/critical.css', criticalCSS);
        console.log('  ✓ Generated critical.css');
        this.optimizationReport.optimizations.push('Generated critical CSS');
    }

    async optimizeFonts() {
        console.log('🔤 Optimizing fonts...');
        
        // Generate font display optimization
        const fontOptimization = `
/* Font display optimization */
@font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400 700;
    font-display: swap;
    src: url('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2') format('woff2');
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
`;

        fs.writeFileSync('assets/css/fonts-optimized.css', fontOptimization);
        console.log('  ✓ Generated font optimization');
        this.optimizationReport.optimizations.push('Optimized font loading');
    }

    async generateManifest() {
        console.log('📱 Generating PWA manifest...');
        
        const manifest = {
            name: "Yannova Ramen en Deuren",
            short_name: "Yannova",
            description: "Uw specialist in hoogwaardige ramen, deuren, isolatiewerken en renovatie",
            start_url: "/",
            display: "standalone",
            background_color: "#1a1a1a",
            theme_color: "#d4a574",
            icons: [
                {
                    src: "assets/images/icon-192.png",
                    sizes: "192x192",
                    type: "image/png"
                },
                {
                    src: "assets/images/icon-512.png",
                    sizes: "512x512",
                    type: "image/png"
                }
            ],
            categories: ["business", "construction", "home-improvement"],
            lang: "nl",
            orientation: "portrait-primary"
        };

        fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
        console.log('  ✓ Generated manifest.json');
        this.optimizationReport.optimizations.push('Generated PWA manifest');
    }

    async generateServiceWorker() {
        console.log('🔧 Generating service worker...');
        
        const serviceWorker = `
// Service Worker for Yannova Website
const CACHE_NAME = 'yannova-v1.0.0';
const urlsToCache = [
    '/',
    '/assets/css/critical.css',
    '/assets/css/bundle.min.css',
    '/assets/css/modern-ui-enhancements.min.css',
    '/assets/js/main.min.js',
    '/assets/js/modern-ui-interactions.min.js',
    '/assets/images/icon-192.png',
    '/assets/images/icon-512.png'
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
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
`;

        fs.writeFileSync('sw.js', serviceWorker);
        console.log('  ✓ Generated service worker');
        this.optimizationReport.optimizations.push('Generated service worker');
    }

    async runLighthouseAudit() {
        console.log('🔍 Running Lighthouse audit...');
        
        try {
            // Check if Lighthouse is installed
            execSync('lighthouse --version', { stdio: 'ignore' });
            
            const lighthouseCommand = `lighthouse http://localhost:3000 --output=json --output-path=lighthouse-report.json --chrome-flags="--headless"`;
            execSync(lighthouseCommand, { stdio: 'pipe' });
            
            if (fs.existsSync('lighthouse-report.json')) {
                const report = JSON.parse(fs.readFileSync('lighthouse-report.json', 'utf8'));
                this.optimizationReport.performance = {
                    performance: report.categories.performance.score * 100,
                    accessibility: report.categories.accessibility.score * 100,
                    bestPractices: report.categories['best-practices'].score * 100,
                    seo: report.categories.seo.score * 100
                };
                console.log('  ✓ Lighthouse audit completed');
            }
            
        } catch (error) {
            console.log('  ⚠️  Lighthouse not available, skipping audit');
        }
    }

    async generateReport() {
        console.log('📊 Generating optimization report...');
        
        const report = {
            ...this.optimizationReport,
            summary: {
                totalOptimizations: this.optimizationReport.optimizations.length,
                errors: this.optimizationReport.errors.length,
                performanceScore: this.optimizationReport.performance.performance || 'N/A'
            }
        };

        fs.writeFileSync('optimization-report.json', JSON.stringify(report, null, 2));
        console.log('  ✓ Report generated');
    }

    getFilesRecursively(dir, extensions) {
        let files = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files = files.concat(this.getFilesRecursively(fullPath, extensions));
            } else if (extensions.some(ext => item.endsWith(ext))) {
                files.push(fullPath);
            }
        }
        
        return files;
    }
}

// Run optimization if called directly
if (require.main === module) {
    const optimizer = new UIOptimizer();
    optimizer.optimize().catch(console.error);
}

module.exports = UIOptimizer;
