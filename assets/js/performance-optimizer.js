/**
 * Performance Optimizer for Yannova Website
 * Advanced performance monitoring and optimization
 */

class PerformanceOptimizer {
    constructor() {
        this.metrics = {};
        this.observers = [];
        this.init();
    }

    init() {
        this.setupPerformanceMonitoring();
        this.setupResourceOptimization();
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupCriticalResourceHints();
        this.setupServiceWorkerOptimization();
    }

    /**
     * Performance Monitoring
     */
    setupPerformanceMonitoring() {
        // Core Web Vitals monitoring
        this.measureCoreWebVitals();
        
        // Resource timing
        this.measureResourceTiming();
        
        // User timing
        this.measureUserTiming();
        
        // Memory usage
        this.monitorMemoryUsage();
    }

    measureCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
                this.reportMetric('LCP', lastEntry.startTime);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                    this.reportMetric('FID', this.metrics.fid);
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.metrics.cls = clsValue;
                this.reportMetric('CLS', clsValue);
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });

            this.observers.push(lcpObserver, fidObserver, clsObserver);
        }
    }

    measureResourceTiming() {
        if ('PerformanceObserver' in window) {
            const resourceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.analyzeResourceTiming(entry);
                });
            });
            resourceObserver.observe({ entryTypes: ['resource'] });
            this.observers.push(resourceObserver);
        }
    }

    analyzeResourceTiming(entry) {
        const resourceType = this.getResourceType(entry.name);
        const loadTime = entry.responseEnd - entry.startTime;
        
        // Log slow resources
        if (loadTime > 1000) {
            console.warn(`Slow resource detected: ${entry.name} (${loadTime}ms)`);
        }
        
        // Track resource performance
        if (!this.metrics.resources) {
            this.metrics.resources = {};
        }
        
        if (!this.metrics.resources[resourceType]) {
            this.metrics.resources[resourceType] = [];
        }
        
        this.metrics.resources[resourceType].push({
            name: entry.name,
            loadTime: loadTime,
            size: entry.transferSize || 0
        });
    }

    getResourceType(url) {
        if (url.includes('.css')) return 'css';
        if (url.includes('.js')) return 'javascript';
        if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
        if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
        return 'other';
    }

    measureUserTiming() {
        // Mark important milestones
        performance.mark('page-start');
        
        window.addEventListener('load', () => {
            performance.mark('page-loaded');
            performance.measure('page-load-time', 'page-start', 'page-loaded');
            
            const loadTime = performance.getEntriesByName('page-load-time')[0].duration;
            this.reportMetric('Page Load Time', loadTime);
        });
    }

    monitorMemoryUsage() {
        if ('memory' in performance) {
            const checkMemory = () => {
                const memory = performance.memory;
                this.metrics.memory = {
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit
                };
                
                // Alert if memory usage is high
                const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
                if (usagePercent > 80) {
                    console.warn(`High memory usage: ${usagePercent.toFixed(2)}%`);
                }
            };
            
            checkMemory();
            setInterval(checkMemory, 30000); // Check every 30 seconds
        }
    }

    reportMetric(name, value) {
        console.log(`Performance Metric - ${name}: ${value.toFixed(2)}ms`);
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance_metric', {
                metric_name: name,
                metric_value: Math.round(value)
            });
        }
    }

    /**
     * Resource Optimization
     */
    setupResourceOptimization() {
        this.preloadCriticalResources();
        this.optimizeImages();
        this.setupResourceHints();
    }

    preloadCriticalResources() {
        const criticalResources = [
            { href: 'assets/css/modern-ui-enhancements.css', as: 'style' },
            { href: 'assets/css/bundle.css', as: 'style' },
            { href: 'assets/js/modern-ui-interactions.js', as: 'script' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.as === 'style') {
                link.onload = () => link.rel = 'stylesheet';
            }
            document.head.appendChild(link);
        });
    }

    setupResourceHints() {
        // DNS prefetch for external resources
        const externalDomains = [
            'https://fonts.googleapis.com',
            'https://cdnjs.cloudflare.com'
        ];

        externalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });

        // Preconnect to critical external resources
        const criticalDomains = [
            'https://fonts.gstatic.com'
        ];

        criticalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    /**
     * Advanced Lazy Loading
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.setupImageLazyLoading();
            this.setupVideoLazyLoading();
            this.setupComponentLazyLoading();
        }
    }

    setupImageLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }

    loadImage(img) {
        return new Promise((resolve, reject) => {
            img.src = img.dataset.src;
            img.onload = () => {
                img.classList.remove('lazy');
                img.classList.add('loaded');
                resolve(img);
            };
            img.onerror = reject;
        });
    }

    setupVideoLazyLoading() {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    video.load();
                    videoObserver.unobserve(video);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.1
        });

        const lazyVideos = document.querySelectorAll('video[data-src]');
        lazyVideos.forEach(video => {
            videoObserver.observe(video);
        });
    }

    setupComponentLazyLoading() {
        const componentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const component = entry.target;
                    this.loadComponent(component);
                    componentObserver.unobserve(component);
                }
            });
        }, {
            rootMargin: '200px 0px',
            threshold: 0.1
        });

        const lazyComponents = document.querySelectorAll('[data-lazy-component]');
        lazyComponents.forEach(component => {
            componentObserver.observe(component);
        });
    }

    loadComponent(component) {
        const componentType = component.dataset.lazyComponent;
        
        switch (componentType) {
            case 'chatbot':
                this.loadChatbot();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'maps':
                this.loadMaps();
                break;
            default:
                console.warn(`Unknown lazy component: ${componentType}`);
        }
    }

    loadChatbot() {
        if (!document.querySelector('#chatbot-container')) {
            const script = document.createElement('script');
            script.src = 'assets/js/chatbot-enhanced.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }

    loadAnalytics() {
        if (typeof gtag === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
            script.async = true;
            document.head.appendChild(script);
        }
    }

    loadMaps() {
        // Load Google Maps API when needed
        if (typeof google === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }
    }

    /**
     * Image Optimization
     */
    setupImageOptimization() {
        this.optimizeImageFormats();
        this.setupResponsiveImages();
        this.compressImages();
    }

    optimizeImageFormats() {
        // Check for WebP support
        const webpSupported = this.checkWebPSupport();
        
        if (webpSupported) {
            this.convertImagesToWebP();
        }
    }

    checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    convertImagesToWebP() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            const originalSrc = img.dataset.src;
            if (originalSrc && !originalSrc.includes('.webp')) {
                img.dataset.src = originalSrc.replace(/\.(jpg|jpeg|png)$/, '.webp');
            }
        });
    }

    setupResponsiveImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            const srcset = img.dataset.srcset;
            if (srcset) {
                img.srcset = srcset;
                img.sizes = img.dataset.sizes || '100vw';
            }
        });
    }

    compressImages() {
        // Implement client-side image compression if needed
        const fileInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.compressImageFile(e.target.files[0]);
            });
        });
    }

    compressImageFile(file) {
        if (!file) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            const maxWidth = 1200;
            const maxHeight = 800;
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                // Use compressed blob
                console.log(`Image compressed from ${file.size} to ${blob.size} bytes`);
            }, 'image/jpeg', 0.8);
        };
        
        img.src = URL.createObjectURL(file);
    }

    /**
     * Critical Resource Hints
     */
    setupCriticalResourceHints() {
        // Add critical resource hints for better performance
        this.addCriticalResourceHints();
        this.optimizeFontLoading();
    }

    addCriticalResourceHints() {
        const criticalResources = [
            { href: 'assets/css/critical.css', as: 'style' },
            { href: 'assets/js/critical.min.js', as: 'script' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    optimizeFontLoading() {
        // Preload critical fonts
        const criticalFonts = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        ];

        criticalFonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = font;
            link.as = 'style';
            link.onload = () => link.rel = 'stylesheet';
            document.head.appendChild(link);
        });
    }

    /**
     * Service Worker Optimization
     */
    setupServiceWorkerOptimization() {
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
            this.setupOfflineFallbacks();
        }
    }

    registerServiceWorker() {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                    this.setupServiceWorkerUpdates(registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }

    setupServiceWorkerUpdates(registration) {
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available, notify user
                    this.notifyUpdateAvailable();
                }
            });
        });
    }

    notifyUpdateAvailable() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <span>Nieuwe versie beschikbaar!</span>
                <button onclick="window.location.reload()">Vernieuwen</button>
            </div>
        `;
        document.body.appendChild(notification);
    }

    setupOfflineFallbacks() {
        // Implement offline fallbacks for critical resources
        const offlineFallbacks = {
            '/': '/offline.html',
            '/admin/': '/offline.html'
        };

        // This would be handled in the service worker
        console.log('Offline fallbacks configured:', offlineFallbacks);
    }

    /**
     * Performance Budget Monitoring
     */
    checkPerformanceBudget() {
        const budget = {
            lcp: 2500, // 2.5s
            fid: 100,  // 100ms
            cls: 0.1,  // 0.1
            loadTime: 3000 // 3s
        };

        const violations = [];
        
        if (this.metrics.lcp > budget.lcp) {
            violations.push(`LCP: ${this.metrics.lcp}ms > ${budget.lcp}ms`);
        }
        
        if (this.metrics.fid > budget.fid) {
            violations.push(`FID: ${this.metrics.fid}ms > ${budget.fid}ms`);
        }
        
        if (this.metrics.cls > budget.cls) {
            violations.push(`CLS: ${this.metrics.cls} > ${budget.cls}`);
        }

        if (violations.length > 0) {
            console.warn('Performance budget exceeded:', violations);
            this.reportPerformanceIssues(violations);
        }
    }

    reportPerformanceIssues(violations) {
        // Send performance issues to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance_budget_exceeded', {
                violations: violations.join(', ')
            });
        }
    }

    /**
     * Cleanup
     */
    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }

    /**
     * Get performance report
     */
    getPerformanceReport() {
        return {
            metrics: this.metrics,
            recommendations: this.getPerformanceRecommendations()
        };
    }

    getPerformanceRecommendations() {
        const recommendations = [];
        
        if (this.metrics.lcp > 2500) {
            recommendations.push('Optimize Largest Contentful Paint - consider image optimization and critical CSS');
        }
        
        if (this.metrics.fid > 100) {
            recommendations.push('Reduce First Input Delay - minimize JavaScript execution time');
        }
        
        if (this.metrics.cls > 0.1) {
            recommendations.push('Improve Cumulative Layout Shift - ensure images have dimensions');
        }

        return recommendations;
    }
}

// Initialize performance optimizer
const performanceOptimizer = new PerformanceOptimizer();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}