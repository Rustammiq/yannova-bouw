/**
 * Performance Optimizer voor Yannova Website
 * Optimaliseert laadtijd en gebruikerservaring
 */

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Preload critical resources
        this.preloadCriticalResources();

        // Optimize images
        this.optimizeImages();

        // Defer non-critical CSS
        this.deferNonCriticalCSS();

        // Optimize fonts
        this.optimizeFonts();

        // Monitor performance
        this.monitorPerformance();
    }

    preloadCriticalResources() {
        // Preload critical images
        const criticalImages = [
            'assets/images/hero-bg.jpg',
            'assets/images/about-team.jpg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    optimizeImages() {
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Add WebP support - Disabled to prevent 404 errors
        // this.addWebPSupport();
    }

    addWebPSupport() {
        const supportsWebP = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        };

        if (supportsWebP()) {
            document.querySelectorAll('img[src$=".jpg"], img[src$=".jpeg"], img[src$=".png"]').forEach(img => {
                const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/, '.webp');
                const webpImg = new Image();
                webpImg.onload = () => {
                    img.src = webpSrc;
                };
                webpImg.src = webpSrc;
            });
        }
    }

    deferNonCriticalCSS() {
        // Load non-critical CSS after page load
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

    optimizeFonts() {
        // Add font-display: swap to Font Awesome
        const fontAwesomeLink = document.querySelector('link[href*="font-awesome"]');
        if (fontAwesomeLink) {
            fontAwesomeLink.href = fontAwesomeLink.href + '&display=swap';
        }
    }

    monitorPerformance() {
        // Monitor Core Web Vitals
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];

            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {

                });
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {

                    }
                });
            }).observe({ entryTypes: ['layout-shift'] });
        }

        // Monitor resource loading
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];


        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PerformanceOptimizer();
    });
} else {
    new PerformanceOptimizer();
}