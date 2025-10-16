// SEO en Meta Tags Management
class SEOManager {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  init() {
    this.setMetaTags();
    this.setStructuredData();
    this.initGoogleAnalytics();
    this.trackPerformance();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    const pages = {
      '/': 'home',
      '/pages/over/': 'over',
      '/pages/diensten/': 'diensten',
      '/pages/projecten/': 'projecten',
      '/pages/contact/': 'contact'
    };
    return pages[path] || 'home';
  }

  setMetaTags() {
    const pageData = this.getPageData();

    // Title
    document.title = pageData.title;

    // Meta description
    this.setMetaTag('description', pageData.description);

    // Keywords
    this.setMetaTag('keywords', pageData.keywords);

    // Open Graph tags
    this.setMetaTag('og:title', pageData.title, 'property');
    this.setMetaTag('og:description', pageData.description, 'property');
    this.setMetaTag('og:image', pageData.image, 'property');
    this.setMetaTag('og:url', window.location.href, 'property');
    this.setMetaTag('og:type', 'website', 'property');

    // Twitter Card tags
    this.setMetaTag('twitter:card', 'summary_large_image', 'name');
    this.setMetaTag('twitter:title', pageData.title, 'name');
    this.setMetaTag('twitter:description', pageData.description, 'name');
    this.setMetaTag('twitter:image', pageData.image, 'name');

    // Canonical URL
    this.setCanonicalURL();
  }

  getPageData() {
    const baseData = {
      siteName: 'Yannova Ramen en Deuren',
      baseUrl: 'https://yannova.nl',
      defaultImage: '/assets/images/hero-bg.jpg'
    };

    const pageConfigs = {
      home: {
        title: 'Yannova Ramen en Deuren | Professionele Ramen en Deuren',
        description: 'Yannova Ramen en Deuren - Uw specialist in hoogwaardige ramen en deuren. Professionele installatie en advies voor uw woning.',
        keywords: 'ramen, deuren, schuifdeuren, garagedeuren, installatie, renovatie, isolatieglas, Amsterdam'
      },
      over: {
        title: 'Over Yannova | Ramen en Deuren Specialist',
        description: 'Leer meer over Yannova Ramen en Deuren. Ons team van vakmensen zorgt voor perfecte installatie en langdurige prestaties.',
        keywords: 'over yannova, team, ervaring, vakmensen, kwaliteit, garantie'
      },
      diensten: {
        title: 'Onze Diensten | Ramen en Deuren',
        description: 'Ontdek onze professionele diensten voor ramen en deuren. Van advies tot installatie en onderhoud.',
        keywords: 'diensten, ramen, deuren, installatie, onderhoud, advies'
      },
      projecten: {
        title: 'Onze Projecten | Ramen en Deuren Realisaties',
        description: 'Bekijk onze projecten en realisaties. Van moderne appartementen tot historische villa\'s.',
        keywords: 'projecten, realisaties, portfolio, renovatie, nieuwbouw'
      },
      contact: {
        title: 'Contact | Yannova Ramen en Deuren',
        description: 'Neem contact op met Yannova Ramen en Deuren. Vraag een offerte aan of plan een afspraak.',
        keywords: 'contact, offerte, afspraak, telefoon, email, adres'
      }
    };

    const config = pageConfigs[this.currentPage] || pageConfigs.home;
    return {
      ...config,
      ...baseData,
      image: `${baseData.baseUrl}${baseData.defaultImage}`
    };
  }

  setMetaTag(name, content, attribute = 'name') {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  setCanonicalURL() {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }

  setStructuredData() {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': 'Yannova Ramen en Deuren',
      'description': 'Specialist in hoogwaardige ramen en deuren',
      'url': 'https://yannova.nl',
      'telephone': '+32 (0)477 28 10 28',
      'email': 'info@yannova.nl',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Industrieweg 123',
        'addressLocality': 'Amsterdam',
        'postalCode': '1234 AB',
        'addressCountry': 'NL'
      },
      'openingHours': [
        'Mo-Fr 08:00-18:00',
        'Sa 09:00-16:00'
      ],
      'serviceArea': {
        '@type': 'GeoCircle',
        'geoMidpoint': {
          '@type': 'GeoCoordinates',
          'latitude': '52.3676',
          'longitude': '4.9041'
        },
        'geoRadius': '50000'
      },
      'services': [
        'Ramen installatie',
        'Deuren installatie',
        'Schuifdeuren',
        'Garagedeuren',
        'Renovatie',
        'Onderhoud'
      ],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.8',
        'reviewCount': '127'
      }
    };

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }

  initGoogleAnalytics() {
    // Google Analytics 4
    const GA_TRACKING_ID = 'G-XXXXXXXXXX'; // Vervang met echte tracking ID

    // Load GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);

    // Initialize GA
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID);

    // Track page view
    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href
    });
  }

  trackPerformance() {
    // Performance monitoring
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          const loadTime = perfData.loadEventEnd - perfData.loadEventStart;

          // Track page load time
          if (typeof gtag !== 'undefined') {
            gtag('event', 'timing_complete', {
              name: 'load',
              value: Math.round(loadTime)
            });
          }
        }, 0);
      });
    }
  }

  // Method to update meta tags dynamically
  updateMetaTags(newData) {
    Object.keys(newData).forEach(key => {
      this.setMetaTag(key, newData[key]);
    });
  }

  // Method to track custom events
  trackEvent(eventName, parameters = {}) {
    // Validate event name
    if (!eventName || eventName === 'undefined') {

      return;
    }

    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, parameters);
    }
  }
}

// Initialize SEO Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.seoManager = new SEOManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SEOManager;
}
