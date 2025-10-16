/**
 * AI Tools API Server
 * Handles all AI tool requests using Google Gemini API
 */

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./gemini-config');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for AI tools
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // limit each IP to 20 requests per windowMs
    message: 'Te veel AI verzoeken, probeer het later opnieuw.'
});

router.use(aiLimiter);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

/**
 * GET /api/ai-tools/status
 * Check AI tools status
 */
router.get('/status', (req, res) => {
    res.json({
        status: 'online',
        tools: [
            'video-generator',
            'content-writer',
            'quote-generator',
            'project-planner',
            'customer-service',
            'analytics',
            'report-generator',
            'design-assistant'
        ],
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/ai-tools/generate-video
 * Generate project video
 */
router.post('/generate-video', async (req, res) => {
    try {
        const { projectType, duration, style, description, prompt } = req.body;

        if (!projectType) {
            return res.status(400).json({
                success: false,
                error: 'Project type is required'
            });
        }

        // Generate video using Gemini
        const model = genAI.getGenerativeModel({ model: config.models.videoGeneration });
        const result = await model.generateContent(prompt || generateVideoPrompt(projectType, duration, style, description));
        const response = await result.response;
        const generatedContent = response.text();

        // For demo purposes, return placeholder video
        const videoData = {
            success: true,
            projectType,
            duration,
            style,
            videoUrl: generatePlaceholderVideo(projectType),
            thumbnailUrl: generatePlaceholderImage(projectType),
            prompt: generatedContent,
            generatedContent
        };

        res.json(videoData);

    } catch (error) {
        console.error('Error generating video:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate video'
        });
    }
});

/**
 * POST /api/ai-tools/generate-content
 * Generate content using AI
 */
router.post('/generate-content', async (req, res) => {
    try {
        const { contentType, topic, length, tone, keywords, prompt } = req.body;

        if (!contentType || !topic) {
            return res.status(400).json({
                success: false,
                error: 'Content type and topic are required'
            });
        }

        // Generate content using Gemini
        const model = genAI.getGenerativeModel({ model: config.models.textGeneration });
        const result = await model.generateContent(prompt || generateContentPrompt(contentType, topic, length, tone, keywords));
        const response = await result.response;
        const generatedContent = response.text();

        const contentData = {
            success: true,
            contentType,
            topic,
            content: generatedContent,
            seoScore: calculateSEOScore(keywords),
            wordCount: countWords(generatedContent),
            prompt: prompt || generateContentPrompt(contentType, topic, length, tone, keywords)
        };

        res.json(contentData);

    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate content'
        });
    }
});

/**
 * POST /api/ai-tools/generate-quote
 * Generate intelligent quote
 */
router.post('/generate-quote', async (req, res) => {
    try {
        const { projectType, size, complexity, location, urgency, quoteData } = req.body;

        if (!projectType) {
            return res.status(400).json({
                success: false,
                error: 'Project type is required'
            });
        }

        // Calculate quote
        const calculatedQuote = calculateQuote(projectType, size, complexity, location, urgency);

        const quoteResponse = {
            success: true,
            quote: calculatedQuote,
            generatedAt: new Date().toISOString()
        };

        res.json(quoteResponse);

    } catch (error) {
        console.error('Error generating quote:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate quote'
        });
    }
});

/**
 * POST /api/ai-tools/generate-project-plan
 * Generate project plan
 */
router.post('/generate-project-plan', async (req, res) => {
    try {
        const { projectName, projectType, startDate, duration, teamSize, plan } = req.body;

        if (!projectName || !projectType) {
            return res.status(400).json({
                success: false,
                error: 'Project name and type are required'
            });
        }

        // Generate project plan
        const projectPlan = createProjectPlan(projectName, projectType, startDate, duration, teamSize);

        const planResponse = {
            success: true,
            plan: projectPlan,
            generatedAt: new Date().toISOString()
        };

        res.json(planResponse);

    } catch (error) {
        console.error('Error generating project plan:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate project plan'
        });
    }
});

/**
 * POST /api/ai-tools/generate-customer-response
 * Generate customer service response
 */
router.post('/generate-customer-response', async (req, res) => {
    try {
        const { queryType, customerQuery, responseTone, response } = req.body;

        if (!queryType || !customerQuery) {
            return res.status(400).json({
                success: false,
                error: 'Query type and customer query are required'
            });
        }

        // Generate response using Gemini
        const model = genAI.getGenerativeModel({ model: config.models.textGeneration });
        const prompt = generateCustomerResponsePrompt(queryType, customerQuery, responseTone);
        const result = await model.generateContent(prompt);
        const geminiResponse = await result.response;
        const generatedResponse = geminiResponse.text();

        const responseData = {
            success: true,
            queryType,
            response: generatedResponse,
            tone: responseTone,
            generatedAt: new Date().toISOString()
        };

        res.json(responseData);

    } catch (error) {
        console.error('Error generating customer response:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate customer response'
        });
    }
});

/**
 * POST /api/ai-tools/generate-analytics
 * Generate analytics report
 */
router.post('/generate-analytics', async (req, res) => {
    try {
        const { dataType, period, metrics, analytics } = req.body;

        if (!dataType) {
            return res.status(400).json({
                success: false,
                error: 'Data type is required'
            });
        }

        // Generate analytics using Gemini
        const model = genAI.getGenerativeModel({ model: config.models.textGeneration });
        const prompt = generateAnalyticsPrompt(dataType, period, metrics);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedAnalytics = response.text();

        const analyticsData = {
            success: true,
            dataType,
            period,
            analytics: JSON.parse(generatedAnalytics) || createAnalytics(dataType, period, metrics),
            generatedAt: new Date().toISOString()
        };

        res.json(analyticsData);

    } catch (error) {
        console.error('Error generating analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate analytics'
        });
    }
});

/**
 * POST /api/ai-tools/generate-report
 * Generate report
 */
router.post('/generate-report', async (req, res) => {
    try {
        const { reportType, period, format, report } = req.body;

        if (!reportType) {
            return res.status(400).json({
                success: false,
                error: 'Report type is required'
            });
        }

        // Generate report using Gemini
        const model = genAI.getGenerativeModel({ model: config.models.textGeneration });
        const prompt = generateReportPrompt(reportType, period, format);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedReport = response.text();

        const reportData = {
            success: true,
            reportType,
            period,
            format,
            report: generatedReport,
            generatedAt: new Date().toISOString()
        };

        res.json(reportData);

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate report'
        });
    }
});

/**
 * POST /api/ai-tools/generate-design
 * Generate design/visualization
 */
router.post('/generate-design', async (req, res) => {
    try {
        const { projectType, description, style, quality, design } = req.body;

        if (!projectType) {
            return res.status(400).json({
                success: false,
                error: 'Project type is required'
            });
        }

        // Generate design using Gemini
        const model = genAI.getGenerativeModel({ model: config.models.imageGeneration });
        const prompt = generateDesignPrompt(projectType, description, style, quality);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedDesign = response.text();

        const designData = {
            success: true,
            projectType,
            description: description || `3D visualisatie van ${projectType} project`,
            style,
            quality,
            imageUrl: generatePlaceholderImage(projectType),
            specifications: getDesignSpecifications(projectType, style),
            materials: getDesignMaterials(projectType),
            generatedAt: new Date().toISOString()
        };

        res.json(designData);

    } catch (error) {
        console.error('Error generating design:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate design'
        });
    }
});

// Helper functions
function generateVideoPrompt(projectType, duration, style, description) {
    const basePrompts = {
        'isolatiewerken': 'Professional insulation work process',
        'renovatiewerken': 'Building renovation and construction work',
        'platedakken': 'Flat roof installation and maintenance',
        'ramen-deuren': 'Windows and doors installation',
        'tuinaanleg': 'Landscaping and garden design work'
    };

    const stylePrompts = {
        'timelapse': 'timelapse video showing the complete process from start to finish',
        'process': 'step-by-step process video showing detailed work procedures',
        'before-after': 'before and after comparison video with smooth transitions'
    };

    return `Create a ${duration}-second ${stylePrompts[style]} of ${basePrompts[projectType]}. ${description || ''} Professional construction work, high quality, realistic lighting, detailed work procedures.`;
}

function generateContentPrompt(contentType, topic, length, tone, keywords) {
    const lengthWords = {
        'short': '200-300 words',
        'medium': '500-700 words',
        'long': '1000+ words'
    };

    const toneInstructions = {
        'professional': 'professional and authoritative tone',
        'friendly': 'friendly and approachable tone',
        'technical': 'technical and detailed tone'
    };

    const contentTypeInstructions = {
        'project-description': 'detailed project description for a construction company website',
        'seo-content': 'SEO-optimized content for search engines',
        'blog-post': 'engaging blog post for construction industry',
        'service-page': 'comprehensive service page content',
        'about-page': 'compelling about page content'
    };

    return `Write ${lengthWords[length]} of ${contentTypeInstructions[contentType]} about "${topic}" using a ${toneInstructions[tone]}. Include these keywords naturally: ${keywords.join(', ')}. Focus on construction, renovation, and building services.`;
}

function calculateQuote(projectType, size, complexity, location, urgency) {
    const baseRates = {
        'isolatiewerken': 45,
        'renovatiewerken': 60,
        'platedakken': 55,
        'ramen-deuren': 50,
        'tuinaanleg': 40
    };

    const complexityMultipliers = {
        'simple': 1.0,
        'medium': 1.3,
        'complex': 1.6
    };

    const urgencyMultipliers = {
        'normal': 1.0,
        'urgent': 1.2,
        'asap': 1.5
    };

    const baseRate = baseRates[projectType] || 50;
    const complexityMultiplier = complexityMultipliers[complexity] || 1.0;
    const urgencyMultiplier = urgencyMultipliers[urgency] || 1.0;
    
    const ratePerM2 = baseRate * complexityMultiplier * urgencyMultiplier;
    const materialsCost = size * ratePerM2 * 0.4;
    const laborCost = size * ratePerM2 * 0.6;
    const totalCost = materialsCost + laborCost;

    const duration = calculateDuration(projectType, size, complexity);

    return {
        projectType,
        size,
        complexity,
        location,
        urgency,
        totalCost: Math.round(totalCost),
        materialsCost: Math.round(materialsCost),
        laborCost: Math.round(laborCost),
        duration: duration,
        breakdown: generateBreakdown(projectType, materialsCost, laborCost),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
}

function calculateDuration(projectType, size, complexity) {
    const baseDurations = {
        'isolatiewerken': 1,
        'renovatiewerken': 4,
        'platedakken': 2,
        'ramen-deuren': 1,
        'tuinaanleg': 3
    };

    const complexityMultipliers = {
        'simple': 1.0,
        'medium': 1.5,
        'complex': 2.0
    };

    const sizeMultiplier = Math.max(1, size / 100);
    const baseDuration = baseDurations[projectType] || 2;
    const complexityMultiplier = complexityMultipliers[complexity] || 1.0;

    return Math.ceil(baseDuration * complexityMultiplier * sizeMultiplier);
}

function generateBreakdown(projectType, materialsCost, laborCost) {
    const breakdowns = {
        'isolatiewerken': [
            { item: 'Isolatiemateriaal', cost: materialsCost * 0.6 },
            { item: 'Afdichtingsmaterialen', cost: materialsCost * 0.3 },
            { item: 'Overige materialen', cost: materialsCost * 0.1 }
        ],
        'renovatiewerken': [
            { item: 'Bouwmateriaal', cost: materialsCost * 0.5 },
            { item: 'Afwerkingsmaterialen', cost: materialsCost * 0.3 },
            { item: 'Hardware en bevestigingsmaterialen', cost: materialsCost * 0.2 }
        ],
        'platedakken': [
            { item: 'Dakbedekking materiaal', cost: materialsCost * 0.7 },
            { item: 'Isolatie en damprem', cost: materialsCost * 0.2 },
            { item: 'Goten en afvoeren', cost: materialsCost * 0.1 }
        ],
        'ramen-deuren': [
            { item: 'Ramen/Deuren', cost: materialsCost * 0.8 },
            { item: 'Kozijnen', cost: materialsCost * 0.15 },
            { item: 'Hardware en bevestigingsmaterialen', cost: materialsCost * 0.05 }
        ],
        'tuinaanleg': [
            { item: 'Planten en beplanting', cost: materialsCost * 0.4 },
            { item: 'Grond en bemesting', cost: materialsCost * 0.3 },
            { item: 'Bestrating en materialen', cost: materialsCost * 0.3 }
        ]
    };

    const baseBreakdown = breakdowns[projectType] || [
        { item: 'Materialen', cost: materialsCost * 0.7 },
        { item: 'Overige kosten', cost: materialsCost * 0.3 }
    ];

    return baseBreakdown.map(item => ({
        item: item.item,
        cost: Math.round(item.cost)
    }));
}

function createProjectPlan(projectName, projectType, startDate, duration, teamSize) {
    const phases = getProjectPhases(projectType, duration);
    const resources = getProjectResources(projectType, teamSize);
    const risks = getProjectRisks(projectType);

    return {
        projectName,
        projectType,
        startDate,
        duration,
        teamSize,
        timeline: phases,
        resources: resources,
        risks: risks,
        milestones: getProjectMilestones(phases)
    };
}

function getProjectPhases(projectType, duration) {
    const phaseTemplates = {
        'isolatiewerken': [
            { task: 'Voorbereiding en opmeting', duration: 1, teamSize: 1 },
            { task: 'Materiaal bestelling en levering', duration: 1, teamSize: 0 },
            { task: 'Isolatie installatie', duration: 2, teamSize: 2 },
            { task: 'Afdichting en afwerking', duration: 1, teamSize: 2 },
            { task: 'Controle en oplevering', duration: 1, teamSize: 1 }
        ],
        'renovatiewerken': [
            { task: 'Planning en vergunningen', duration: 2, teamSize: 1 },
            { task: 'Sloop en voorbereiding', duration: 3, teamSize: 3 },
            { task: 'Bouw en constructie', duration: 6, teamSize: 4 },
            { task: 'Afwerking en installaties', duration: 4, teamSize: 3 },
            { task: 'Oplevering en nazorg', duration: 1, teamSize: 2 }
        ],
        'platedakken': [
            { task: 'Inspectie en opmeting', duration: 1, teamSize: 1 },
            { task: 'Materiaal bestelling', duration: 1, teamSize: 0 },
            { task: 'Dakbedekking installatie', duration: 3, teamSize: 3 },
            { task: 'Goten en afvoeren', duration: 1, teamSize: 2 },
            { task: 'Controle en garantie', duration: 1, teamSize: 1 }
        ],
        'ramen-deuren': [
            { task: 'Opmeting en bestelling', duration: 1, teamSize: 1 },
            { task: 'Productie en levering', duration: 2, teamSize: 0 },
            { task: 'Installatie ramen', duration: 2, teamSize: 2 },
            { task: 'Installatie deuren', duration: 1, teamSize: 2 },
            { task: 'Afwerking en controle', duration: 1, teamSize: 1 }
        ],
        'tuinaanleg': [
            { task: 'Ontwerp en planning', duration: 1, teamSize: 1 },
            { task: 'Grondwerk en voorbereiding', duration: 2, teamSize: 2 },
            { task: 'Beplanting en aanleg', duration: 3, teamSize: 3 },
            { task: 'Bestrating en verharding', duration: 2, teamSize: 2 },
            { task: 'Afronding en onderhoud', duration: 1, teamSize: 1 }
        ]
    };

    const template = phaseTemplates[projectType] || phaseTemplates['renovatiewerken'];
    let currentWeek = 1;

    return template.map(phase => {
        const phaseData = {
            week: currentWeek,
            task: phase.task,
            duration: phase.duration,
            teamSize: phase.teamSize
        };
        currentWeek += phase.duration;
        return phaseData;
    });
}

function getProjectResources(projectType, teamSize) {
    const baseResources = [
        'Project manager',
        'Vakmensen',
        'Materiaal en gereedschap',
        'Veiligheidsuitrusting'
    ];

    const specificResources = {
        'isolatiewerken': ['Isolatiemateriaal', 'Afdichtingsmiddelen', 'Meetapparatuur'],
        'renovatiewerken': ['Bouwmateriaal', 'Gereedschap', 'Hijsmateriaal'],
        'platedakken': ['Dakbedekking', 'Lijm en bevestigingsmaterialen', 'Veiligheidsmateriaal'],
        'ramen-deuren': ['Ramen en deuren', 'Kozijnen', 'Installatiegereedschap'],
        'tuinaanleg': ['Planten en beplanting', 'Grond en bemesting', 'Bestrating']
    };

    return [...baseResources, ...(specificResources[projectType] || [])];
}

function getProjectRisks(projectType) {
    const commonRisks = [
        'Weersomstandigheden',
        'Leveringsproblemen',
        'Onvoorziene constructieproblemen'
    ];

    const specificRisks = {
        'isolatiewerken': ['Vochtproblemen', 'Bestaande constructie schade'],
        'renovatiewerken': ['Asbest', 'Fundering problemen'],
        'platedakken': ['Lekkage', 'Wind en stormschade'],
        'ramen-deuren': ['Maatvoering', 'Kozijn problemen'],
        'tuinaanleg': ['Bodemkwaliteit', 'Drainage problemen']
    };

    return [...commonRisks, ...(specificRisks[projectType] || [])];
}

function getProjectMilestones(phases) {
    return phases.map((phase, index) => ({
        milestone: phase.task,
        week: phase.week,
        status: 'planned'
    }));
}

function generateCustomerResponsePrompt(queryType, customerQuery, responseTone) {
    return `Generate a professional customer service response for a construction company. Query type: ${queryType}. Customer query: "${customerQuery}". Response tone: ${responseTone}. The company specializes in insulation, renovation, flat roofs, windows/doors, and landscaping.`;
}

function generateAnalyticsPrompt(dataType, period, metrics) {
    return `Generate analytics insights for a construction company. Data type: ${dataType}. Period: ${period}. Focus on: ${metrics}. Return as JSON with insights, recommendations, and key metrics.`;
}

function generateReportPrompt(reportType, period, format) {
    return `Generate a ${reportType} report for a construction company. Period: ${period}. Format: ${format}. Include executive summary, project details, financial data, and recommendations.`;
}

function generateDesignPrompt(projectType, description, style, quality) {
    return `Generate a ${style} style ${quality} quality design for ${projectType}. Description: ${description}. Focus on construction and building design.`;
}

function createAnalytics(dataType, period, metrics) {
    const insights = [
        'Website verkeer is met 15% gestegen deze maand',
        'Quote conversie is verbeterd naar 12%',
        'Meeste projecten zijn isolatiewerken (40%)',
        'Klanttevredenheid is 4.8/5 sterren'
    ];

    const recommendations = [
        'Focus meer op SEO voor platedakken content',
        'Verbeter mobile website performance',
        'Implementeer chat functionaliteit',
        'Voeg meer project foto\'s toe'
    ];

    const metricsData = {
        'website': {
            'Page Views': '12,450',
            'Unique Visitors': '3,210',
            'Bounce Rate': '35%',
            'Conversion Rate': '2.8%'
        },
        'projects': {
            'Active Projects': '8',
            'Completed This Month': '12',
            'Average Duration': '3.2 weeks',
            'Success Rate': '96%'
        },
        'quotes': {
            'Quotes Generated': '45',
            'Conversion Rate': '12%',
            'Average Value': '€8,500',
            'Response Time': '2.3 hours'
        },
        'customers': {
            'New Customers': '23',
            'Returning Customers': '67%',
            'Customer Satisfaction': '4.8/5',
            'Referral Rate': '34%'
        }
    };

    return {
        dataType,
        period,
        insights: insights,
        recommendations: recommendations,
        metrics: metricsData[dataType] || metricsData['website']
    };
}

function getDesignSpecifications(projectType, style) {
    return {
        'Resolution': '1920x1080',
        'Format': 'PNG/JPEG',
        'Quality': 'High',
        'Lighting': 'Realistic'
    };
}

function getDesignMaterials(projectType) {
    const materials = {
        'isolatiewerken': ['PIR isolatie', 'Afdichtingsband', 'Damprem'],
        'renovatiewerken': ['Beton', 'Staal', 'Hout', 'Gips'],
        'platedakken': ['EPDM', 'Bitumen', 'Isolatie'],
        'ramen-deuren': ['Aluminium', 'Kunststof', 'Glas'],
        'tuinaanleg': ['Planten', 'Grond', 'Bestrating']
    };

    return materials[projectType] || materials['renovatiewerken'];
}

function generatePlaceholderVideo(projectType) {
    return `https://via.placeholder.com/800x450/667eea/ffffff?text=${projectType.replace('-', '+')}+Video`;
}

function generatePlaceholderImage(projectType) {
    return `https://via.placeholder.com/600x400/667eea/ffffff?text=${projectType.replace('-', '+')}+Image`;
}

function calculateSEOScore(keywords) {
    return Math.min(100, Math.max(60, 70 + keywords.length * 5));
}

function countWords(text) {
    return text.split(/\s+/).length;
}

module.exports = router;
