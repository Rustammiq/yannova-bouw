/**
 * Gemini Image Generator voor Yannova Ramen en Deuren
 * Integreert Google Gemini AI voor het genereren van project foto's
 */

class GeminiImageGenerator {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = '/api/gemini';
        this.model = 'gemini-2.5-flash-image-preview';
    }

    /**
     * Genereer een afbeelding voor een specifiek project type
     * @param {string} projectType - Type project (ramen, deuren, renovatie, etc.)
     * @param {Object} options - Opties voor de afbeelding
     * @returns {Promise<string>} URL van de gegenereerde afbeelding
     */
    async generateProjectImage(projectType, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/generate-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectType,
                    ...options
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Fout bij het genereren van afbeelding');
            }

            return data.imageUrl;
        } catch (error) {
            console.error('Fout bij het genereren van afbeelding:', error);
            throw new Error('Kon geen afbeelding genereren. Probeer het opnieuw.');
        }
    }

    /**
     * Verbeter de prompt met specifieke opties
     * @param {string} basePrompt - Basis prompt
     * @param {Object} options - Opties voor aanpassing
     * @returns {string} Verbeterde prompt
     */
    enhancePrompt(basePrompt, options) {
        let prompt = basePrompt;

        if (options.style) {
            prompt += `, ${options.style} style`;
        }

        if (options.timeOfDay) {
            prompt += `, ${options.timeOfDay} lighting`;
        }

        if (options.buildingType) {
            prompt += `, ${options.buildingType} building`;
        }

        if (options.materials) {
            prompt += `, featuring ${options.materials}`;
        }

        prompt += ', high resolution, professional photography, suitable for construction company website, Yannova Ramen en Deuren branding';

        return prompt;
    }

    /**
     * Roep de Gemini API aan
     * @param {string} prompt - Tekst prompt voor afbeelding generatie
     * @param {Object} options - Opties voor de API call
     * @returns {Promise<Object>} API response
     */
    async callGeminiAPI(prompt, options = {}) {
        const requestBody = {
            contents: [{
                parts: [{
                    text: `Generate a professional construction image based on this prompt: ${prompt}`
                }]
            }],
            generationConfig: {
                temperature: options.temperature || 0.7,
                topK: options.topK || 40,
                topP: options.topP || 0.95,
                maxOutputTokens: options.maxOutputTokens || 2048
            }
        };

        const response = await fetch(`${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Voor nu retourneren we een placeholder URL
        // In een echte implementatie zou je de gegenereerde afbeelding URL hier terugkrijgen
        return {
            imageUrl: this.generatePlaceholderImage(prompt)
        };
    }

    /**
     * Genereer een placeholder afbeelding URL
     * @param {string} prompt - Prompt voor context
     * @returns {string} Placeholder URL
     */
    generatePlaceholderImage(prompt) {
        // Gebruik een placeholder service of lokaal gegenereerde afbeelding
        const encodedPrompt = encodeURIComponent(prompt.substring(0, 100));
        return `https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=${encodedPrompt}`;
    }

    /**
     * Genereer meerdere afbeeldingen voor een project galerij
     * @param {string} projectType - Type project
     * @param {number} count - Aantal afbeeldingen
     * @param {Object} options - Opties
     * @returns {Promise<Array>} Array van afbeelding URLs
     */
    async generateProjectGallery(projectType, count = 3, options = {}) {
        const images = [];

        for (let i = 0; i < count; i++) {
            const variantOptions = {
                ...options,
                style: this.getRandomStyle(),
                timeOfDay: this.getRandomTimeOfDay()
            };

            const imageUrl = await this.generateProjectImage(projectType, variantOptions);
            images.push({
                url: imageUrl,
                alt: `${projectType} project afbeelding ${i + 1}`,
                title: `Yannova ${projectType} project`
            });
        }

        return images;
    }

    /**
     * Krijg een willekeurige stijl
     * @returns {string} Stijl naam
     */
    getRandomStyle() {
        const styles = ['modern', 'classic', 'contemporary', 'minimalist', 'industrial'];
        return styles[Math.floor(Math.random() * styles.length)];
    }

    /**
     * Krijg een willekeurig tijdstip
     * @returns {string} Tijdstip
     */
    getRandomTimeOfDay() {
        const times = ['morning', 'afternoon', 'golden hour', 'blue hour'];
        return times[Math.floor(Math.random() * times.length)];
    }
}

/**
 * Project Image Manager - Beheert afbeeldingen voor specifieke projecten
 */
class ProjectImageManager {
    constructor(geminiGenerator) {
        this.generator = geminiGenerator;
        this.cache = new Map();
    }

    /**
     * Krijg afbeeldingen voor een project
     * @param {string} projectId - Unieke project ID
     * @param {string} projectType - Type project
     * @param {Object} options - Opties
     * @returns {Promise<Array>} Project afbeeldingen
     */
    async getProjectImages(projectId, projectType, options = {}) {
        const cacheKey = `${projectId}_${projectType}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const images = await this.generator.generateProjectGallery(projectType, 3, options);
        this.cache.set(cacheKey, images);

        return images;
    }

    /**
     * Wis cache voor een specifiek project
     * @param {string} projectId - Project ID
     */
    clearProjectCache(projectId) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(projectId)) {
                this.cache.delete(key);
            }
        }
    }
}

/**
 * UI Helper voor het tonen van gegenereerde afbeeldingen
 */
class ImageDisplayHelper {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    /**
     * Toon afbeeldingen in de container
     * @param {Array} images - Array van afbeelding objecten
     * @param {string} layout - Layout type (grid, carousel, masonry)
     */
    displayImages(images, layout = 'grid') {
        if (!this.container) {
            console.error('Container niet gevonden:', this.containerId);
            return;
        }

        this.container.innerHTML = '';

        images.forEach((image, index) => {
            const imageElement = this.createImageElement(image, index);
            this.container.appendChild(imageElement);
        });

        this.applyLayout(layout);
    }

    /**
     * Maak een afbeelding element
     * @param {Object} image - Afbeelding object
     * @param {number} index - Index
     * @returns {HTMLElement} Afbeelding element
     */
    createImageElement(image, index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'project-image-wrapper';
        wrapper.setAttribute('data-index', index);

        const img = document.createElement('img');
        img.src = image.url;
        img.alt = image.alt;
        img.title = image.title;
        img.className = 'project-image';
        img.loading = 'lazy';

        const overlay = document.createElement('div');
        overlay.className = 'image-overlay';
        overlay.innerHTML = `
            <div class="image-title">${image.title}</div>
            <div class="image-actions">
                <button class="btn-view" onclick="openImageModal('${image.url}', '${image.title}')">Bekijk</button>
                <button class="btn-download" onclick="downloadImage('${image.url}', '${image.title}')">Download</button>
            </div>
        `;

        wrapper.appendChild(img);
        wrapper.appendChild(overlay);

        return wrapper;
    }

    /**
     * Pas layout toe
     * @param {string} layout - Layout type
     */
    applyLayout(layout) {
        this.container.className = `image-container ${layout}`;
    }
}

// Globale functies voor gebruik in HTML
window.openImageModal = function(imageUrl, title) {
    // Implementeer modal voor het tonen van afbeeldingen

};

window.downloadImage = function(imageUrl, title) {
    // Implementeer download functionaliteit
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title.replace(/\s+/g, '_')}.jpg`;
    link.click();
};

// Export voor gebruik in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GeminiImageGenerator, ProjectImageManager, ImageDisplayHelper };
}
