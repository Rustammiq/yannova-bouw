/**
 * Enhanced SEO Manager voor Yannova Website
 *
 * Features:
 * - Dynamic meta tags
 * - Rich snippets (Schema.org)
 * - Open Graph optimization
 * - Twitter Cards
 * - Local SEO
 * - Performance tracking
 * - Social sharing optimization
 */

class EnhancedSEOManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.baseUrl = 'https://yannovabouw.ai';
        this.siteName = 'Yannova Ramen en Deuren';
        this.defaultImage = '/assets/images/about-team.jpg';
        this.init();
    }

    init() {
        this.setMetaTags();
        this.setStructuredData();
        this.setOpenGraphTags();
        this.setTwitterCards();
        this.initLocalSEO();
        this.initPerformanceTracking();
        this.initSocialSharing();
        this.initBreadcrumbs();
        this.initFAQSchema();
        this.initReviewSchema();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const pages = {
            '/': 'home',
            '/pages/over/': 'over',
            '/pages/diensten/': 'diensten',
            '/pages/projecten/': 'projecten',
            '/pages/contact/': 'contact',
            '/pages/projecten/gemini-generator.html': 'ai-generator'
        };
        return pages[path] || 'home';
    }

    setMetaTags() {
        const pageData = this.getPageData();

        // Basic meta tags
        document.title = pageData.title;
        this.setMetaTag('description', pageData.description);
        this.setMetaTag('keywords', pageData.keywords);
        this.setMetaTag('robots', 'index, follow');
        this.setMetaTag('author', 'Yannova Ramen en Deuren');
        this.setMetaTag('viewport', 'width=device-width, initial-scale=1.0');

        // Language and region
        this.setMetaTag('language', 'nl');
        this.setMetaTag('geo.region', 'NL-NH');
        this.setMetaTag('geo.placename', 'Amsterdam');
        this.setMetaTag('geo.position', '52.3676;4.9041');
        this.setMetaTag('ICBM', '52.3676, 4.9041');

        // Canonical URL
        this.setCanonicalURL();

        // Alternate languages (if needed)
        this.setAlternateLanguages();
    }

    setOpenGraphTags() {
        const pageData = this.getPageData();

        // Open Graph tags
        this.setMetaTag('og:title', pageData.title, 'property');
        this.setMetaTag('og:description', pageData.description, 'property');
        this.setMetaTag('og:image', pageData.image, 'property');
        this.setMetaTag('og:url', window.location.href, 'property');
        this.setMetaTag('og:type', pageData.ogType || 'website', 'property');
        this.setMetaTag('og:site_name', this.siteName, 'property');
        this.setMetaTag('og:locale', 'nl_NL', 'property');

        // Additional Open Graph tags
        this.setMetaTag('og:image:width', '1200', 'property');
        this.setMetaTag('og:image:height', '630', 'property');
        this.setMetaTag('og:image:alt', pageData.imageAlt || pageData.description, 'property');

        // Business specific Open Graph
        this.setMetaTag('og:business:contact_data:street_address', 'Industrieweg 123', 'property');
        this.setMetaTag('og:business:contact_data:locality', 'Amsterdam', 'property');
        this.setMetaTag('og:business:contact_data:postal_code', '1234 AB', 'property');
        this.setMetaTag('og:business:contact_data:country_name', 'Netherlands', 'property');
    }

    setTwitterCards() {
        const pageData = this.getPageData();

        // Twitter Card tags
        this.setMetaTag('twitter:card', 'summary_large_image', 'name');
        this.setMetaTag('twitter:site', '@yannovabouw', 'name');
        this.setMetaTag('twitter:creator', '@yannovabouw', 'name');
        this.setMetaTag('twitter:title', pageData.title, 'name');
        this.setMetaTag('twitter:description', pageData.description, 'name');
        this.setMetaTag('twitter:image', pageData.image, 'name');
        this.setMetaTag('twitter:image:alt', pageData.imageAlt || pageData.description, 'name');
    }

    setStructuredData() {
        const structuredData = this.getStructuredData();

        // Remove existing structured data
        const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
        existingScripts.forEach(script => script.remove());

        // Add new structured data
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }

    getStructuredData() {
        const baseData = {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": this.siteName,
            "description": "Uw specialist in isolatiewerken, renovatiewerken, platedakken, ramen en deuren, en tuinaanleg in Amsterdam en omgeving",
            "url": this.baseUrl,
            "logo": `${this.baseUrl}/assets/images/logo.png`,
            "image": `${this.baseUrl}${this.defaultImage}`,
            "telephone": "+32 (0)477 28 10 28",
            "email": "info@yannovabouw.ai",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Industrieweg 123",
                "addressLocality": "Amsterdam",
                "postalCode": "1234 AB",
                "addressCountry": "NL"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 52.3676,
                "longitude": 4.9041
            },
            "openingHours": [
                "Mo-Fr 08:00-18:00",
                "Sa 09:00-16:00"
            ],
            "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": {
                    "@type": "GeoCoordinates",
                    "latitude": 52.3676,
                    "longitude": 4.9041
                },
                "geoRadius": "50000"
            },
            "services": [
                "Isolatiewerken",
                "Renovatiewerken",
                "Platedakken",
                "Ramen en Deuren",
                "Tuinaanleg",
                "Energiebesparing",
                "Duurzame oplossingen"
            ],
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "127",
                "bestRating": "5",
                "worstRating": "1"
            },
            "sameAs": [
                "https://www.facebook.com/yannovabouw",
                "https://www.linkedin.com/company/yannovabouw",
                "https://www.instagram.com/yannovabouw"
            ]
        };

        // Add page-specific structured data
        const pageSpecificData = this.getPageSpecificStructuredData();
        return { ...baseData, ...pageSpecificData };
    }

    getPageSpecificStructuredData() {
        const pageData = this.getPageData();

        switch (this.currentPage) {
            case 'diensten':
                return {
                    "@type": "Service",
                    "serviceType": "Bouw en Renovatie",
                    "provider": {
                        "@type": "LocalBusiness",
                        "name": this.siteName
                    },
                    "areaServed": {
                        "@type": "City",
                        "name": "Amsterdam"
            },
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                        "name": "Yannova Diensten",
                "itemListElement": [
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                                    "name": "Isolatiewerken"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Renovatiewerken"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Platedakken"
                        }
                    },
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                                    "name": "Ramen en Deuren"
                        }
                    },
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                                    "name": "Tuinaanleg"
                        }
                    }
                ]
            }
        };

            case 'projecten':
                return {
                    "@type": "ItemList",
                    "name": "Yannova Projecten",
                    "description": "Onze realisaties en projecten",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                            "item": {
                                "@type": "CreativeWork",
                                "name": "Modern Appartement Renovatie",
                                "description": "Volledige renovatie van ramen en deuren"
                            }
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                            "item": {
                                "@type": "CreativeWork",
                                "name": "Villa Renovatie",
                                "description": "Luxe oplossingen voor historische villa"
                            }
                        },
                        {
                            "@type": "ListItem",
                            "position": 3,
                            "item": {
                                "@type": "CreativeWork",
                                "name": "Energiezuinige Woning",
                                "description": "Isolatieglas en duurzame deuren"
                            }
                        }
                    ]
                };

            case 'contact':
                return {
                    "@type": "ContactPage",
                    "mainEntity": {
                        "@type": "LocalBusiness",
                        "name": this.siteName
                    }
                };

            default:
                return {};
        }
    }

    initLocalSEO() {
        // Add local business information
        this.addLocalBusinessInfo();

        // Add service area information
        this.addServiceAreaInfo();

        // Add business hours
        this.addBusinessHours();
    }

    addLocalBusinessInfo() {
        const businessInfo = document.createElement('div');
        businessInfo.className = 'business-info rich-snippet';
        businessInfo.innerHTML = `
            <div itemscope itemtype="https://schema.org/LocalBusiness">
                <h3 itemprop="name">${this.siteName}</h3>
                <div itemprop="description">Uw specialist in isolatiewerken, renovatiewerken, platedakken, ramen en deuren, en tuinaanleg</div>
                <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
                    <span itemprop="streetAddress">Industrieweg 123</span><br>
                    <span itemprop="postalCode">1234 AB</span> <span itemprop="addressLocality">Amsterdam</span><br>
                    <span itemprop="addressCountry">NL</span>
                </div>
                <div itemprop="telephone">+32 (0)477 28 10 28</div>
                <div itemprop="email">info@yannovabouw.ai</div>
                <div itemprop="url">${this.baseUrl}</div>
            </div>
        `;

        // Add to contact section if it exists
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            contactSection.appendChild(businessInfo);
        }
    }

    addServiceAreaInfo() {
        const serviceArea = document.createElement('div');
        serviceArea.className = 'service-area rich-snippet';
        serviceArea.innerHTML = `
            <div itemscope itemtype="https://schema.org/GeoCircle">
                <meta itemprop="geoMidpoint" itemscope itemtype="https://schema.org/GeoCoordinates">
                <meta itemprop="latitude" content="52.3676">
                <meta itemprop="longitude" content="4.9041">
                <meta itemprop="geoRadius" content="50000">
                <span class="sr-only">Service gebied: 50km rondom Amsterdam</span>
            </div>
        `;

        document.body.appendChild(serviceArea);
    }

    addBusinessHours() {
        const businessHours = document.createElement('div');
        businessHours.className = 'business-hours rich-snippet';
        businessHours.innerHTML = `
            <div itemscope itemtype="https://schema.org/OpeningHoursSpecification">
                <h4>Openingstijden</h4>
                <ul>
                    <li itemprop="dayOfWeek" content="Monday">Maandag: <time itemprop="opens" content="08:00">8:00</time> - <time itemprop="closes" content="18:00">18:00</time></li>
                    <li itemprop="dayOfWeek" content="Tuesday">Dinsdag: <time itemprop="opens" content="08:00">8:00</time> - <time itemprop="closes" content="18:00">18:00</time></li>
                    <li itemprop="dayOfWeek" content="Wednesday">Woensdag: <time itemprop="opens" content="08:00">8:00</time> - <time itemprop="closes" content="18:00">18:00</time></li>
                    <li itemprop="dayOfWeek" content="Thursday">Donderdag: <time itemprop="opens" content="08:00">8:00</time> - <time itemprop="closes" content="18:00">18:00</time></li>
                    <li itemprop="dayOfWeek" content="Friday">Vrijdag: <time itemprop="opens" content="08:00">8:00</time> - <time itemprop="closes" content="18:00">18:00</time></li>
                    <li itemprop="dayOfWeek" content="Saturday">Zaterdag: <time itemprop="opens" content="09:00">9:00</time> - <time itemprop="closes" content="16:00">16:00</time></li>
                </ul>
            </div>
        `;

        // Add to contact section if it exists
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            contactSection.appendChild(businessHours);
        }
    }

    initPerformanceTracking() {
        // Track Core Web Vitals
        if ('web-vital' in window) {
            // Track LCP, FID, CLS
            this.trackWebVitals();
        }

        // Track page load time
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                    this.trackEvent('page_load_time', {
                        load_time: Math.round(loadTime),
                        page: this.currentPage
                    });
                }
                }, 0);
            });
    }

    trackWebVitals() {
        // This would integrate with your analytics

    }

    initSocialSharing() {
        // Add social sharing buttons
        this.addSocialSharingButtons();

        // Track social sharing events
        this.trackSocialSharing();
    }

    addSocialSharingButtons() {
        const shareButtons = document.createElement('div');
        shareButtons.className = 'social-share-buttons';
        shareButtons.innerHTML = `
            <h4>Deel deze pagina:</h4>
            <a href="#" class="share-facebook" data-platform="facebook" aria-label="Deel op Facebook">
                <i class="fab fa-facebook-f"></i> Facebook
            </a>
            <a href="#" class="share-twitter" data-platform="twitter" aria-label="Deel op Twitter">
                <i class="fab fa-twitter"></i> Twitter
            </a>
            <a href="#" class="share-linkedin" data-platform="linkedin" aria-label="Deel op LinkedIn">
                <i class="fab fa-linkedin-in"></i> LinkedIn
            </a>
            <a href="#" class="share-whatsapp" data-platform="whatsapp" aria-label="Deel op WhatsApp">
                <i class="fab fa-whatsapp"></i> WhatsApp
            </a>
        `;

        // Add to main content
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.appendChild(shareButtons);
        }
    }

    trackSocialSharing() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.social-share-buttons a')) {
                const platform = e.target.closest('a').dataset.platform;
                this.trackEvent('social_share', {
                    platform: platform,
                    page: this.currentPage
                });
            }
        });
    }

    initBreadcrumbs() {
        const breadcrumbs = this.generateBreadcrumbs();
        if (breadcrumbs) {
            const breadcrumbElement = document.createElement('nav');
            breadcrumbElement.className = 'breadcrumb';
            breadcrumbElement.setAttribute('aria-label', 'Breadcrumb');
            breadcrumbElement.innerHTML = breadcrumbs;

            // Add to main content
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.insertBefore(breadcrumbElement, mainContent.firstChild);
            }
        }
    }

    generateBreadcrumbs() {
        const breadcrumbs = [
            { name: 'Home', url: '/' }
        ];

        switch (this.currentPage) {
            case 'over':
                breadcrumbs.push({ name: 'Over Ons', url: '/pages/over/' });
                break;
            case 'diensten':
                breadcrumbs.push({ name: 'Diensten', url: '/pages/diensten/' });
                break;
            case 'projecten':
                breadcrumbs.push({ name: 'Projecten', url: '/pages/projecten/' });
                break;
            case 'contact':
                breadcrumbs.push({ name: 'Contact', url: '/pages/contact/' });
                break;
            case 'ai-generator':
                breadcrumbs.push({ name: 'Projecten', url: '/pages/projecten/' });
                breadcrumbs.push({ name: 'AI Generator', url: '/pages/projecten/gemini-generator.html' });
                break;
        }

        return breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return `
                ${isLast ? '' : '<a href="' + crumb.url + '">'}${crumb.name}${isLast ? '' : '</a>'}
                ${isLast ? '' : '<span class="separator">></span>'}
            `;
        }).join('');
    }

    initFAQSchema() {
        // Add FAQ structured data
        const faqData = this.getFAQData();
        if (faqData.length > 0) {
            const faqElement = document.createElement('div');
            faqElement.className = 'faq-section rich-snippet';
            faqElement.innerHTML = `
                <div itemscope itemtype="https://schema.org/FAQPage">
                    ${faqData.map(faq => `
                        <div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                            <h3 itemprop="name">${faq.question}</h3>
                            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                                <div itemprop="text">${faq.answer}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            // Add to main content
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.appendChild(faqElement);
            }
        }
    }

    getFAQData() {
        return [
            {
                question: "Welke diensten biedt Yannova aan?",
                answer: "Yannova biedt isolatiewerken, renovatiewerken, platedakken, ramen en deuren, en tuinaanleg. Wij zijn gespecialiseerd in duurzame oplossingen voor energiebesparing en woningverbetering."
            },
            {
                question: "In welk gebied werkt Yannova?",
                answer: "Wij bedienen Amsterdam en de hele regio Noord-Holland. Onze lokale kennis en ervaring zorgen voor de beste resultaten in uw specifieke omgeving."
            },
            {
                question: "Hoe lang duurt een gemiddeld project?",
                answer: "De duur van een project hangt af van de omvang en complexiteit. Een gemiddeld isolatieproject duurt 1-3 dagen, terwijl een complete renovatie 2-6 weken kan duren."
            },
            {
                question: "Biedt Yannova garantie op werk?",
                answer: "Ja, wij bieden uitgebreide garantie op al ons werk. Isolatiewerken hebben 25 jaar garantie, ramen en deuren 10 jaar, en renovatiewerken 5 jaar garantie."
            }
        ];
    }

    initReviewSchema() {
        // Add review structured data
        const reviews = this.getReviewData();
        if (reviews.length > 0) {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'reviews-section rich-snippet';
            reviewElement.innerHTML = `
                <div itemscope itemtype="https://schema.org/Organization">
                    <div itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
                        <meta itemprop="ratingValue" content="4.8">
                        <meta itemprop="reviewCount" content="127">
                        <meta itemprop="bestRating" content="5">
                        <meta itemprop="worstRating" content="1">
                    </div>
                    ${reviews.map(review => `
                        <div itemscope itemprop="review" itemtype="https://schema.org/Review">
                            <div itemprop="author" itemscope itemtype="https://schema.org/Person">
                                <span itemprop="name">${review.author}</span>
                            </div>
                            <div itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
                                <meta itemprop="ratingValue" content="${review.rating}">
                                <meta itemprop="bestRating" content="5">
                            </div>
                            <div itemprop="reviewBody">${review.text}</div>
                            <div itemprop="datePublished" content="${review.date}">${review.date}</div>
                        </div>
                    `).join('')}
                </div>
            `;

            // Add to main content
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.appendChild(reviewElement);
            }
        }
    }

    getReviewData() {
        return [
            {
                author: "Jan de Vries",
                rating: 5,
                text: "Uitstekende service! Onze dakisolatie is perfect uitgevoerd en we merken direct het verschil in comfort en energiekosten.",
                date: "2024-01-15"
            },
            {
                author: "Maria van der Berg",
                rating: 5,
                text: "Professioneel team dat onze renovatie tot in de perfectie heeft uitgevoerd. Zeker een aanrader!",
                date: "2024-01-10"
            },
            {
                author: "Peter Jansen",
                rating: 4,
                text: "Goede kwaliteit ramen en deuren. Installatie was netjes en op tijd. Tevreden klant!",
                date: "2024-01-05"
            }
        ];
    }

    getPageData() {
        const baseData = {
            siteName: this.siteName,
            baseUrl: this.baseUrl,
            defaultImage: this.defaultImage
        };

        const pageConfigs = {
            home: {
                title: 'Yannova Ramen en Deuren | Isolatiewerken, Renovatiewerken, Platedakken & Tuinaanleg',
                description: 'Yannova - Uw specialist in isolatiewerken, renovatiewerken, platedakken, ramen en deuren, en tuinaanleg. Professionele installatie, energiebesparing en duurzame oplossingen voor uw woning in Amsterdam en omgeving.',
                keywords: 'isolatiewerken, renovatiewerken, platedakken, ramen, deuren, schuifdeuren, garagedeuren, tuinaanleg, energiebesparing, isolatieglas, dakisolatie, spouwmuurisolatie, vloerisolatie, zolderisolatie, renovatie, verbouwing, platedak, EPDM dak, bitumen dak, tuinontwerp, tuinaanleg, Amsterdam, Noord-Holland, duurzaam, energiezuinig, installatie, advies, offerte',
                ogType: 'website',
                imageAlt: 'Yannova team aan het werk bij isolatiewerken en renovatie'
            },
            over: {
                title: 'Over Yannova | Specialist in Isolatiewerken, Renovatiewerken & Platedakken',
                description: 'Leer meer over Yannova. Ons team van vakmensen met 15+ jaar ervaring zorgt voor perfecte isolatiewerken, renovatiewerken, platedakken, ramen en deuren, en tuinaanleg.',
                keywords: 'over yannova, team, ervaring, vakmensen, kwaliteit, garantie, isolatiewerken specialist, renovatie expert, platedakken specialist',
                ogType: 'website',
                imageAlt: 'Yannova team van ervaren vakmensen'
            },
            diensten: {
                title: 'Onze Diensten | Isolatiewerken, Renovatiewerken, Platedakken & Meer',
                description: 'Ontdek onze professionele diensten: isolatiewerken, renovatiewerken, platedakken, ramen en deuren, en tuinaanleg. Van advies tot installatie en onderhoud in Amsterdam en omgeving.',
                keywords: 'diensten, isolatiewerken, renovatiewerken, platedakken, ramen, deuren, installatie, onderhoud, advies, dakisolatie, spouwmuurisolatie, vloerisolatie, zolderisolatie, EPDM, bitumen, groendak, energiezuinige ramen, schuifdeuren, garagedeuren, tuinontwerp, tuinaanleg',
                ogType: 'website',
                imageAlt: 'Yannova diensten overzicht - isolatiewerken, renovatiewerken, platedakken'
            },
            projecten: {
                title: 'Onze Projecten | Isolatiewerken, Renovatiewerken & Platedakken Realisaties',
                description: 'Bekijk onze projecten en realisaties. Van moderne appartementen tot historische villa\'s. Isolatiewerken, renovatiewerken, platedakken, ramen en deuren, en tuinaanleg projecten.',
                keywords: 'projecten, realisaties, portfolio, renovatie, nieuwbouw, isolatiewerken projecten, renovatiewerken projecten, platedakken projecten, ramen deuren projecten, tuinaanleg projecten, voor na foto\'s',
                ogType: 'website',
                imageAlt: 'Yannova projecten portfolio - voor en na foto\'s'
            },
            contact: {
                title: 'Contact | Yannova Ramen en Deuren - Vraag Gratis Offerte',
                description: 'Neem contact op met Yannova voor isolatiewerken, renovatiewerken, platedakken, ramen en deuren, en tuinaanleg. Vraag een gratis offerte aan of plan een afspraak in Amsterdam en omgeving.',
                keywords: 'contact, offerte, afspraak, telefoon, email, adres, gratis offerte, isolatiewerken offerte, renovatiewerken offerte, platedakken offerte, ramen deuren offerte, tuinaanleg offerte',
                ogType: 'website',
                imageAlt: 'Contact Yannova voor gratis offerte'
            },
            'ai-generator': {
                title: 'AI Generator | Yannova - Innovatieve Project Visualisatie',
                description: 'Gebruik onze AI Generator om uw isolatiewerken, renovatiewerken, platedakken, ramen en deuren, en tuinaanleg projecten te visualiseren. Gratis tool voor project planning.',
                keywords: 'AI generator, project visualisatie, isolatiewerken AI, renovatiewerken AI, platedakken AI, ramen deuren AI, tuinaanleg AI, project planning, visualisatie tool',
                ogType: 'website',
                imageAlt: 'Yannova AI Generator voor project visualisatie'
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

    setAlternateLanguages() {
        // Add hreflang tags for different languages if needed
        const hreflang = document.createElement('link');
        hreflang.setAttribute('rel', 'alternate');
        hreflang.setAttribute('hreflang', 'nl');
        hreflang.setAttribute('href', window.location.href);
        document.head.appendChild(hreflang);
    }

    trackEvent(eventName, parameters = {}) {
        // Validate event name
        if (!eventName || eventName === 'undefined') {
            console.warn('Invalid event name:', eventName);
            return;
        }

        // Track events for analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }

        // Send to server analytics
        if (window.yannovaAnalytics) {
            window.yannovaAnalytics.trackCustomEvent(eventName, parameters);
        } else {
            // Store event for later processing if analytics not ready
            if (!window.pendingAnalyticsEvents) {
                window.pendingAnalyticsEvents = [];
            }
            window.pendingAnalyticsEvents.push({ eventName, data: parameters });
        }
    }

    // Method to update meta tags dynamically
    updateMetaTags(newData) {
        Object.keys(newData).forEach(key => {
            this.setMetaTag(key, newData[key]);
        });
    }

    // Method to add custom structured data
    addCustomStructuredData(data) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }
}

// Initialize Enhanced SEO Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedSEOManager = new EnhancedSEOManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedSEOManager;
}