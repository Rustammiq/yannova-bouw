/**
 * Advanced SEO Optimizer voor Yannova Website
 * Optimaliseert zoekmachine zichtbaarheid en gebruikerservaring
 */

class SEOOptimizer {
    constructor() {
        this.init();
        this.setupStructuredData();
        this.optimizeMetaTags();
        this.setupSitemap();
        this.optimizeImages();
        this.setupAnalytics();
    }

    init() {
        console.log('🔍 SEO Optimizer gestart');
        this.generateBreadcrumbs();
        this.optimizeHeadings();
        this.setupInternalLinking();
        this.optimizeContent();
    }

    /**
     * Structured Data (JSON-LD) setup
     */
    setupStructuredData() {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Yannova Ramen en Deuren",
            "description": "Professionele ramen en deuren installatie, renovatie en nieuwbouw projecten in Nederland",
            "url": "https://yannova.nl",
            "telephone": "+31-123-456-789",
            "email": "info@yannova.nl",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Hoofdstraat 123",
                "addressLocality": "Amsterdam",
                "postalCode": "1000 AB",
                "addressCountry": "NL"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": "52.3676",
                "longitude": "4.9041"
            },
            "openingHours": "Mo-Fr 08:00-17:00",
            "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": {
                    "@type": "GeoCoordinates",
                    "latitude": "52.3676",
                    "longitude": "4.9041"
                },
                "geoRadius": "50000"
            },
            "services": [
                {
                    "@type": "Service",
                    "name": "Ramen Installatie",
                    "description": "Professionele ramen installatie en vervanging"
                },
                {
                    "@type": "Service", 
                    "name": "Deuren Installatie",
                    "description": "Moderne deuren installatie en renovatie"
                },
                {
                    "@type": "Service",
                    "name": "Renovatie Projecten",
                    "description": "Complete gebouw renovatie en modernisering"
                }
            ],
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "127"
            },
            "sameAs": [
                "https://www.facebook.com/yannova",
                "https://www.linkedin.com/company/yannova",
                "https://www.instagram.com/yannova"
            ]
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }

    /**
     * Meta tags optimalisatie
     */
    optimizeMetaTags() {
        // Viewport meta tag
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0';
            document.head.appendChild(viewport);
        }

        // Theme color
        if (!document.querySelector('meta[name="theme-color"]')) {
            const themeColor = document.createElement('meta');
            themeColor.name = 'theme-color';
            themeColor.content = '#007bff';
            document.head.appendChild(themeColor);
        }

        // Description
        const description = document.querySelector('meta[name="description"]');
        if (description) {
            description.content = "Yannova Ramen en Deuren - Professionele installatie van ramen, deuren en renovatie projecten. Vrijblijvende offerte aanvragen. Kwaliteit en service gegarandeerd.";
        }

        // Keywords
        if (!document.querySelector('meta[name="keywords"]')) {
            const keywords = document.createElement('meta');
            keywords.name = 'keywords';
            keywords.content = 'ramen, deuren, installatie, renovatie, nieuwbouw, glas, aluminium, hout, kunststof, offerte, Amsterdam, Nederland';
            document.head.appendChild(keywords);
        }

        // Open Graph tags
        this.setupOpenGraph();
    }

    /**
     * Open Graph tags setup
     */
    setupOpenGraph() {
        const ogTags = [
            { property: 'og:title', content: 'Yannova Ramen en Deuren - Professionele Installatie' },
            { property: 'og:description', content: 'Professionele ramen en deuren installatie, renovatie en nieuwbouw projecten. Vrijblijvende offerte aanvragen.' },
            { property: 'og:type', content: 'website' },
            { property: 'og:url', content: window.location.href },
            { property: 'og:image', content: '/assets/images/og-image.jpg' },
            { property: 'og:site_name', content: 'Yannova Ramen en Deuren' },
            { property: 'og:locale', content: 'nl_NL' }
        ];

        ogTags.forEach(tag => {
            if (!document.querySelector(`meta[property="${tag.property}"]`)) {
                const meta = document.createElement('meta');
                meta.setAttribute('property', tag.property);
                meta.content = tag.content;
                document.head.appendChild(meta);
            }
        });

        // Twitter Card tags
        const twitterTags = [
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: 'Yannova Ramen en Deuren - Professionele Installatie' },
            { name: 'twitter:description', content: 'Professionele ramen en deuren installatie, renovatie en nieuwbouw projecten.' },
            { name: 'twitter:image', content: '/assets/images/twitter-card.jpg' }
        ];

        twitterTags.forEach(tag => {
            if (!document.querySelector(`meta[name="${tag.name}"]`)) {
                const meta = document.createElement('meta');
                meta.name = tag.name;
                meta.content = tag.content;
                document.head.appendChild(meta);
            }
        });
    }

    /**
     * Breadcrumbs generatie
     */
    generateBreadcrumbs() {
        const breadcrumbs = this.getBreadcrumbs();
        if (breadcrumbs.length > 1) {
            const breadcrumbContainer = document.createElement('nav');
            breadcrumbContainer.setAttribute('aria-label', 'Breadcrumb');
            breadcrumbContainer.className = 'breadcrumbs';
            
            const breadcrumbList = document.createElement('ol');
            breadcrumbList.className = 'breadcrumb-list';
            
            breadcrumbs.forEach((crumb, index) => {
                const listItem = document.createElement('li');
                listItem.className = 'breadcrumb-item';
                
                if (index === breadcrumbs.length - 1) {
                    listItem.className += ' active';
                    listItem.textContent = crumb.name;
                } else {
                    const link = document.createElement('a');
                    link.href = crumb.url;
                    link.textContent = crumb.name;
                    listItem.appendChild(link);
                }
                
                breadcrumbList.appendChild(listItem);
            });
            
            breadcrumbContainer.appendChild(breadcrumbList);
            
            // Insert after header
            const header = document.querySelector('header');
            if (header) {
                header.insertAdjacentElement('afterend', breadcrumbContainer);
            }
        }
    }

    /**
     * Get breadcrumbs based on current page
     */
    getBreadcrumbs() {
        const path = window.location.pathname;
        const breadcrumbs = [
            { name: 'Home', url: '/' }
        ];

        if (path.includes('/admin')) {
            breadcrumbs.push({ name: 'Admin Dashboard', url: '/admin/dashboard.html' });
        } else if (path.includes('/diensten')) {
            breadcrumbs.push({ name: 'Diensten', url: '/diensten' });
        } else if (path.includes('/projecten')) {
            breadcrumbs.push({ name: 'Projecten', url: '/projecten' });
        } else if (path.includes('/over')) {
            breadcrumbs.push({ name: 'Over Ons', url: '/over' });
        } else if (path.includes('/contact')) {
            breadcrumbs.push({ name: 'Contact', url: '/contact' });
        }

        return breadcrumbs;
    }

    /**
     * Headings optimalisatie
     */
    optimizeHeadings() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        // Ensure proper heading hierarchy
        let currentLevel = 0;
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            
            if (level > currentLevel + 1) {
                console.warn(`Heading hierarchy issue: ${heading.tagName} after h${currentLevel}`);
            }
            
            currentLevel = level;
        });

        // Add IDs to headings for anchor links
        headings.forEach(heading => {
            if (!heading.id) {
                const id = heading.textContent
                    .toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .replace(/\s+/g, '-')
                    .trim();
                heading.id = id;
            }
        });
    }

    /**
     * Internal linking optimalisatie
     */
    setupInternalLinking() {
        // Add internal links to relevant content
        const contentKeywords = {
            'ramen': '/diensten#ramen',
            'deuren': '/diensten#deuren',
            'renovatie': '/diensten#renovatie',
            'nieuwbouw': '/diensten#nieuwbouw',
            'offerte': '/contact',
            'contact': '/contact',
            'projecten': '/projecten'
        };

        // Find and link keywords in content
        Object.keys(contentKeywords).forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let node;
            while (node = walker.nextNode()) {
                if (node.parentElement.tagName !== 'A' && node.parentElement.tagName !== 'SCRIPT') {
                    const text = node.textContent;
                    if (regex.test(text)) {
                        const link = document.createElement('a');
                        link.href = contentKeywords[keyword];
                        link.textContent = keyword;
                        link.className = 'internal-link';
                        
                        const newText = text.replace(regex, link.outerHTML);
                        node.parentElement.innerHTML = newText;
                    }
                }
            }
        });
    }

    /**
     * Content optimalisatie
     */
    optimizeContent() {
        // Add alt text to images without it
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach(img => {
            const altText = this.generateAltText(img);
            img.alt = altText;
        });

        // Add title attributes to links
        const links = document.querySelectorAll('a:not([title])');
        links.forEach(link => {
            if (link.textContent.trim()) {
                link.title = link.textContent.trim();
            }
        });
    }

    /**
     * Generate alt text for images
     */
    generateAltText(img) {
        const src = img.src || img.dataset.src || '';
        const filename = src.split('/').pop().split('.')[0];
        
        // Common patterns
        if (src.includes('hero')) return 'Yannova Ramen en Deuren - Professionele installatie diensten';
        if (src.includes('about')) return 'Yannova team - Ervaren professionals in ramen en deuren';
        if (src.includes('project')) return 'Yannova project - Kwaliteitsvolle ramen en deuren installatie';
        if (src.includes('logo')) return 'Yannova Ramen en Deuren logo';
        
        return `Yannova ${filename.replace(/-/g, ' ')} - Ramen en deuren specialist`;
    }

    /**
     * Image optimalisatie
     */
    optimizeImages() {
        // Add loading="lazy" to images below the fold
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach((img, index) => {
            if (index > 2) { // Skip first few images (above fold)
                img.loading = 'lazy';
            }
        });

        // Add proper image dimensions
        images.forEach(img => {
            if (!img.width || !img.height) {
                img.addEventListener('load', () => {
                    img.width = img.naturalWidth;
                    img.height = img.naturalHeight;
                });
            }
        });
    }

    /**
     * Sitemap setup
     */
    setupSitemap() {
        // Add sitemap link to robots.txt
        const robotsLink = document.createElement('link');
        robotsLink.rel = 'sitemap';
        robotsLink.type = 'application/xml';
        robotsLink.href = '/sitemap.xml';
        document.head.appendChild(robotsLink);
    }

    /**
     * Analytics setup
     */
    setupAnalytics() {
        // Google Analytics 4
        if (typeof gtag === 'undefined') {
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
        }

        // Track page views
        this.trackPageView();
    }

    /**
     * Track page view
     */
    trackPageView() {
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
    }
}

// Initialize SEO Optimizer
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SEOOptimizer();
    });
} else {
    new SEOOptimizer();
}
