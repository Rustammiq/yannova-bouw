/**
 * Advanced Performance Optimizer voor Yannova Website
 * Optimaliseert laadtijden, caching, en gebruikerservaring
 */

class AdvancedPerformanceOptimizer {
    constructor() {
        this.init();
        this.setupServiceWorker();
        this.optimizeImages();
        this.setupLazyLoading();
        this.optimizeFonts();
        this.setupPreloading();
    }

    init() {
        console.log('🚀 Advanced Performance Optimizer gestart');
        this.setupCriticalCSS();
        this.optimizeJavaScript();
        this.setupResourceHints();
    }

    /**
     * Service Worker voor caching en offline functionaliteit
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker geregistreerd:', registration.scope);
                })
                .catch(error => {
                    console.log('❌ Service Worker registratie mislukt:', error);
                });
        }
    }

    /**
     * Kritieke CSS inline laden
     */
    setupCriticalCSS() {
        const criticalCSS = `
            /* Critical CSS for above-the-fold content */
            body { margin: 0; font-family: 'Inter', sans-serif; }
            .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .navbar { background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); }
            .btn-primary { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 6px; }
        `;
        
        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.insertBefore(style, document.head.firstChild);
    }

    /**
     * JavaScript optimalisatie
     */
    optimizeJavaScript() {
        // Defer non-critical JavaScript
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
                script.defer = true;
            }
        });

        // Optimize event listeners
        this.setupOptimizedEventListeners();
    }

    /**
     * Geoptimaliseerde event listeners
     */
    setupOptimizedEventListeners() {
        // Throttle scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!scrollTimeout) {
                scrollTimeout = setTimeout(() => {
                    this.handleScroll();
                    scrollTimeout = null;
                }, 16); // 60fps
            }
        });

        // Debounce resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    /**
     * Scroll handling
     */
    handleScroll() {
        const scrollY = window.scrollY;
        const navbar = document.querySelector('.navbar');
        
        if (navbar) {
            if (scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }

    /**
     * Resize handling
     */
    handleResize() {
        // Recalculate layouts
        this.optimizeImages();
    }

    /**
     * Geavanceerde image optimalisatie
     */
    optimizeImages() {
        // WebP support detection
        const supportsWebP = this.detectWebPSupport();
        
        // Lazy loading voor alle images
        const images = document.querySelectorAll('img[data-src]');
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadOptimizedImage(img, supportsWebP);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback voor oudere browsers
            images.forEach(img => this.loadOptimizedImage(img, supportsWebP));
        }
    }

    /**
     * WebP support detectie
     */
    detectWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    /**
     * Geoptimaliseerde image loading
     */
    async loadOptimizedImage(img, supportsWebP) {
        const src = img.dataset.src;
        if (!src) return;

        try {
            // WebP conversion
            if (supportsWebP && src.match(/\.(jpg|jpeg|png)$/)) {
                const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
                const webpImg = new Image();
                webpImg.onload = () => {
                    img.src = webpSrc;
                    img.classList.add('loaded');
                };
                webpImg.onerror = () => {
                    img.src = src;
                    img.classList.add('loaded');
                };
                webpImg.src = webpSrc;
            } else {
                img.src = src;
                img.classList.add('loaded');
            }
        } catch (error) {
            console.error('Image loading error:', error);
            img.src = src;
        }
    }

    /**
     * Lazy loading setup
     */
    setupLazyLoading() {
        // Lazy load non-critical CSS
        const nonCriticalCSS = [
            'assets/css/ui-enhancements.css',
            'assets/css/seo-enhancements.css'
        ];

        nonCriticalCSS.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.media = 'print';
            link.onload = () => {
                link.media = 'all';
            };
            document.head.appendChild(link);
        });
    }

    /**
     * Font optimalisatie
     */
    optimizeFonts() {
        // Font display swap
        const fontLinks = document.querySelectorAll('link[href*="font"]');
        fontLinks.forEach(link => {
            if (!link.href.includes('display=swap')) {
                link.href += (link.href.includes('?') ? '&' : '?') + 'display=swap';
            }
        });

        // Preload critical fonts
        const criticalFonts = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        ];

        criticalFonts.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = href;
            link.onload = () => {
                link.rel = 'stylesheet';
            };
            document.head.appendChild(link);
        });
    }

    /**
     * Resource hints setup
     */
    setupPreloading() {
        // Preload critical resources
        const criticalResources = [
            { href: '/assets/images/hero-bg.jpg', as: 'image' },
            { href: '/assets/css/main.css', as: 'style' },
            { href: '/assets/js/main.js', as: 'script' }
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            document.head.appendChild(link);
        });

        // DNS prefetch voor externe resources
        const dnsPrefetchDomains = [
            'https://fonts.googleapis.com',
            'https://cdnjs.cloudflare.com'
        ];

        dnsPrefetchDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
    }

    /**
     * Performance monitoring
     */
    setupPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('🎯 LCP:', lastEntry.startTime);
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    console.log('⚡ FID:', entry.processingStart - entry.startTime);
                });
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        console.log('📐 CLS:', entry.value);
                    }
                });
            }).observe({ entryTypes: ['layout-shift'] });
        }

        // Page load metrics
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('📊 Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart);
            console.log('📊 DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart);
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AdvancedPerformanceOptimizer();
    });
} else {
    new AdvancedPerformanceOptimizer();
}
