/**
 * Gemini API Configuration
 * Configuratie voor Google Gemini AI integratie
 */

const config = {
    // Gemini API Configuration
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        models: {
            imageGeneration: 'gemini-2.5-flash-image-preview',
            textGeneration: 'gemini-1.5-flash',
            videoGeneration: 'veo-3.0-generate-preview'
        },
        defaultSettings: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048
        }
    },

    // Image Generation Settings
    imageGeneration: {
        maxImagesPerRequest: 9,
        defaultImageCount: 3,
        supportedFormats: ['jpg', 'png', 'webp'],
        maxImageSize: '1024x1024',
        quality: 'high'
    },

    // Project Types Configuration
    projectTypes: {
        'ramen': {
            name: 'Ramen Installatie',
            description: 'Professionele ramen installatie projecten',
            prompts: {
                base: 'Professional window installation on modern building, high-quality architectural photography, clean lines, natural lighting, craftsmanship detail, construction site safety',
                styles: ['modern', 'classic', 'contemporary', 'minimalist'],
                materials: ['aluminum', 'wood', 'PVC', 'composite']
            }
        },
        'deuren': {
            name: 'Deuren Installatie',
            description: 'Moderne deuren installatie en renovatie',
            prompts: {
                base: 'Modern door installation project, professional construction work, high-quality finish, architectural detail, clean workspace, professional craftsmanship',
                styles: ['modern', 'classic', 'contemporary', 'industrial'],
                materials: ['steel', 'wood', 'aluminum', 'glass']
            }
        },
        'renovatie': {
            name: 'Renovatie Project',
            description: 'Complete gebouw renovatie projecten',
            prompts: {
                base: 'Building renovation project, before and after transformation, professional construction work, modern materials, clean construction site, architectural improvement',
                styles: ['modern', 'classic', 'contemporary', 'industrial'],
                materials: ['brick', 'concrete', 'steel', 'glass']
            }
        },
        'nieuwbouw': {
            name: 'Nieuwbouw Project',
            description: 'Nieuwe constructie projecten met ramen en deuren',
            prompts: {
                base: 'New construction project with windows and doors, modern architecture, professional construction site, high-quality materials, clean and organized work environment',
                styles: ['modern', 'contemporary', 'minimalist', 'industrial'],
                materials: ['steel', 'concrete', 'glass', 'aluminum']
            }
        },
        'onderhoud': {
            name: 'Onderhoud & Service',
            description: 'Onderhoud en service werkzaamheden',
            prompts: {
                base: 'Window and door maintenance work, professional service, attention to detail, quality craftsmanship, clean and organized workspace',
                styles: ['professional', 'clean', 'organized', 'efficient'],
                materials: ['maintenance tools', 'cleaning supplies', 'replacement parts']
            }
        }
    },

    // Building Types
    buildingTypes: {
        'residential': 'Woning',
        'commercial': 'Kantoor',
        'industrial': 'Industrieel',
        'retail': 'Winkel',
        'public': 'Openbaar gebouw'
    },

    // Time of Day Options
    timeOfDay: {
        'morning': 'Ochtend licht',
        'afternoon': 'Middag licht',
        'golden hour': 'Gouden uur',
        'blue hour': 'Blauwe uur',
        'evening': 'Avond licht'
    },

    // Safety Settings
    safetySettings: [
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
    ],

    // Cache Settings
    cache: {
        enabled: true,
        ttl: 3600000, // 1 hour in milliseconds
        maxSize: 100 // Maximum number of cached images
    },

    // Rate Limiting
    rateLimit: {
        enabled: true,
        maxRequestsPerMinute: 60,
        maxRequestsPerHour: 1000
    }
};

module.exports = config;
