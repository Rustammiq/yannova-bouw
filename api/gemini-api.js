/**
 * Gemini API Server Endpoint
 * Server-side API voor Gemini image generation
 */

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./gemini-config');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 requests per windowMs
    message: 'Te veel verzoeken, probeer het later opnieuw.'
});

router.use(limiter);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

/**
 * POST /api/gemini/generate-image
 * Genereer een afbeelding voor een project
 */
router.post('/generate-image', async (req, res) => {
    try {
        const { projectType, options = {} } = req.body;

        if (!projectType) {
            return res.status(400).json({
                success: false,
                error: 'Project type is vereist'
            });
        }

        // Validate project type
        if (!config.projectTypes[projectType]) {
            return res.status(400).json({
                success: false,
                error: 'Ongeldig project type'
            });
        }

        // Generate prompt
        const prompt = generatePrompt(projectType, options);
        
        // For now, return a placeholder response
        // In a real implementation, you would call the Gemini API here
        const response = {
            success: true,
            imageUrl: generatePlaceholderImage(projectType, options),
            prompt: prompt,
            projectType: projectType,
            options: options
        };

        res.json(response);

    } catch (error) {
        console.error('Error generating image:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden bij het genereren van de afbeelding'
        });
    }
});

/**
 * POST /api/gemini/generate-gallery
 * Genereer meerdere afbeeldingen voor een project galerij
 */
router.post('/generate-gallery', async (req, res) => {
    try {
        const { projectType, count = 3, options = {} } = req.body;

        if (!projectType) {
            return res.status(400).json({
                success: false,
                error: 'Project type is vereist'
            });
        }

        if (count > config.imageGeneration.maxImagesPerRequest) {
            return res.status(400).json({
                success: false,
                error: `Maximum ${config.imageGeneration.maxImagesPerRequest} afbeeldingen per verzoek toegestaan`
            });
        }

        const images = [];
        
        for (let i = 0; i < count; i++) {
            const variantOptions = {
                ...options,
                style: getRandomStyle(),
                timeOfDay: getRandomTimeOfDay(),
                variant: i + 1
            };

            const prompt = generatePrompt(projectType, variantOptions);
            
            images.push({
                url: generatePlaceholderImage(projectType, variantOptions),
                alt: `${config.projectTypes[projectType].name} project afbeelding ${i + 1}`,
                title: `${config.projectTypes[projectType].name} Project`,
                prompt: prompt,
                projectType: projectType,
                options: variantOptions
            });
        }

        res.json({
            success: true,
            images: images,
            count: images.length,
            projectType: projectType
        });

    } catch (error) {
        console.error('Error generating gallery:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden bij het genereren van de galerij'
        });
    }
});

/**
 * GET /api/gemini/project-types
 * Krijg beschikbare project types
 */
router.get('/project-types', (req, res) => {
    const projectTypes = Object.keys(config.projectTypes).map(key => ({
        key: key,
        name: config.projectTypes[key].name,
        description: config.projectTypes[key].description
    }));

    res.json({
        success: true,
        projectTypes: projectTypes
    });
});

/**
 * GET /api/gemini/building-types
 * Krijg beschikbare gebouw types
 */
router.get('/building-types', (req, res) => {
    res.json({
        success: true,
        buildingTypes: config.buildingTypes
    });
});

/**
 * GET /api/gemini/time-options
 * Krijg beschikbare tijd opties
 */
router.get('/time-options', (req, res) => {
    res.json({
        success: true,
        timeOptions: config.timeOfDay
    });
});

/**
 * GET /api/gemini/admin/images
 * Krijg gegenereerde afbeeldingen voor admin
 */
router.get('/admin/images', async (req, res) => {
    try {
        // In a real implementation, you would fetch from database
        // For now, return empty array
        res.json({
            success: true,
            images: []
        });
    } catch (error) {
        console.error('Error fetching admin images:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden bij het ophalen van afbeeldingen'
        });
    }
});

/**
 * POST /api/gemini/admin/save-image
 * Sla een gegenereerde afbeelding op voor admin gebruik
 */
router.post('/admin/save-image', async (req, res) => {
    try {
        const { imageData, usage, section } = req.body;
        
        // In a real implementation, you would save to database
        // For now, just return success
        res.json({
            success: true,
            message: 'Afbeelding opgeslagen',
            imageId: `admin_img_${Date.now()}`
        });
    } catch (error) {
        console.error('Error saving admin image:', error);
        res.status(500).json({
            success: false,
            error: 'Er is een fout opgetreden bij het opslaan van de afbeelding'
        });
    }
});

/**
 * Genereer een prompt voor het project type
 */
function generatePrompt(projectType, options) {
    const projectConfig = config.projectTypes[projectType];
    let prompt = projectConfig.prompts.base;

    // Add style
    if (options.style) {
        prompt += `, ${options.style} style`;
    }

    // Add building type
    if (options.buildingType) {
        prompt += `, ${options.buildingType} building`;
    }

    // Add time of day
    if (options.timeOfDay) {
        prompt += `, ${options.timeOfDay} lighting`;
    }

    // Add materials
    if (options.materials) {
        prompt += `, featuring ${options.materials}`;
    }

    // Add quality and branding
    prompt += ', high resolution, professional photography, suitable for construction company website, Yannova Ramen en Deuren branding';

    return prompt;
}

/**
 * Genereer een placeholder afbeelding URL
 */
function generatePlaceholderImage(projectType, options) {
    const projectName = config.projectTypes[projectType].name;
    const encodedName = encodeURIComponent(projectName);
    const colors = ['4A90E2', '2ECC71', 'E74C3C', 'F39C12', '9B59B6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return `https://via.placeholder.com/800x600/${color}/FFFFFF?text=${encodedName}`;
}

/**
 * Krijg een willekeurige stijl
 */
function getRandomStyle() {
    const styles = ['modern', 'classic', 'contemporary', 'minimalist', 'industrial'];
    return styles[Math.floor(Math.random() * styles.length)];
}

/**
 * Krijg een willekeurig tijdstip
 */
function getRandomTimeOfDay() {
    const times = ['morning', 'afternoon', 'golden hour', 'blue hour'];
    return times[Math.floor(Math.random() * times.length)];
}

module.exports = router;
