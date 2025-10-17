#!/usr/bin/env node

/**
 * Photo Optimization Script voor Yannova Website
 * 
 * Dit script optimaliseert foto's voor web gebruik:
 * - Resize naar verschillende formaten
 * - Compressie optimalisatie
 * - WebP conversie
 * - Alt-text generatie
 * - SEO metadata
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class PhotoOptimizer {
    constructor() {
        this.inputDir = 'assets/images/raw'; // Upload je foto's hier eerst
        this.outputDir = 'assets/images';
        this.sizes = {
            desktop: 1920,
            tablet: 1280,
            mobile: 768,
            thumbnail: 300
        };
        this.quality = 85;
    }

    async init() {
        console.log('🚀 Yannova Photo Optimizer gestart...\n');
        
        // Controleer of sharp geïnstalleerd is
        try {
            await sharp('package.json');
        } catch (error) {
            console.log('❌ Sharp niet gevonden. Installeer met: npm install sharp');
            process.exit(1);
        }

        // Maak input directory aan als deze niet bestaat
        if (!fs.existsSync(this.inputDir)) {
            fs.mkdirSync(this.inputDir, { recursive: true });
            console.log(`📁 Input directory aangemaakt: ${this.inputDir}`);
            console.log('💡 Upload je foto\'s naar deze map en voer het script opnieuw uit.\n');
            return;
        }

        await this.processPhotos();
    }

    async processPhotos() {
        const files = fs.readdirSync(this.inputDir)
            .filter(file => /\.(jpg|jpeg|png)$/i.test(file));

        if (files.length === 0) {
            console.log('📁 Geen foto\'s gevonden in input directory.');
            console.log('💡 Upload je foto\'s naar assets/images/raw/ en voer het script opnieuw uit.\n');
            return;
        }

        console.log(`📸 ${files.length} foto\'s gevonden voor optimalisatie...\n`);

        for (const file of files) {
            await this.processPhoto(file);
        }

        console.log('\n✅ Alle foto\'s geoptimaliseerd!');
        console.log('📋 Bekijk PHOTO_INSTRUCTIONS.md voor meer informatie.\n');
    }

    async processPhoto(filename) {
        const inputPath = path.join(this.inputDir, filename);
        const baseName = path.parse(filename).name;
        
        console.log(`🔄 Bezig met: ${filename}`);

        try {
            // Bepaal project type en categorie
            const { projectType, category } = this.categorizePhoto(filename);
            
            // Maak output directories
            const outputBase = path.join(this.outputDir, 'projects', projectType, category);
            fs.mkdirSync(outputBase, { recursive: true });

            // Verwerk foto voor verschillende formaten
            for (const [sizeName, width] of Object.entries(this.sizes)) {
                const outputPath = path.join(outputBase, `${baseName}-${sizeName}.jpg`);
                
                await sharp(inputPath)
                    .resize(width, null, { 
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .jpeg({ 
                        quality: this.quality,
                        progressive: true
                    })
                    .toFile(outputPath);

                // Maak ook WebP versie
                const webpPath = path.join(outputBase, `${baseName}-${sizeName}.webp`);
                await sharp(inputPath)
                    .resize(width, null, { 
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .webp({ 
                        quality: this.quality
                    })
                    .toFile(webpPath);
            }

            // Genereer alt-text
            const altText = this.generateAltText(filename, projectType, category);
            
            // Maak metadata bestand
            const metadataPath = path.join(outputBase, `${baseName}-metadata.json`);
            const metadata = {
                filename: baseName,
                projectType,
                category,
                altText,
                sizes: Object.keys(this.sizes),
                createdAt: new Date().toISOString(),
                seoKeywords: this.generateSEOKeywords(projectType, category)
            };

            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

            console.log(`   ✅ ${filename} → ${projectType}/${category}/`);

        } catch (error) {
            console.log(`   ❌ Fout bij ${filename}: ${error.message}`);
        }
    }

    categorizePhoto(filename) {
        const name = filename.toLowerCase();
        
        // Bepaal project type
        let projectType = 'ramen-deuren'; // default
        if (name.includes('isolatie') || name.includes('dakisolatie') || name.includes('spouwmuur')) {
            projectType = 'isolatiewerken';
        } else if (name.includes('renovatie') || name.includes('verbouwing')) {
            projectType = 'renovatiewerken';
        } else if (name.includes('platedak') || name.includes('epdm') || name.includes('bitumen')) {
            projectType = 'platedakken';
        } else if (name.includes('raam') || name.includes('deur') || name.includes('kozijn')) {
            projectType = 'ramen-deuren';
        } else if (name.includes('tuin') || name.includes('terras') || name.includes('gazon')) {
            projectType = 'tuinaanleg';
        }

        // Bepaal categorie
        let category = 'after'; // default
        if (name.includes('voor') || name.includes('before')) {
            category = 'before';
        } else if (name.includes('tijdens') || name.includes('proces') || name.includes('process')) {
            category = 'process';
        } else if (name.includes('detail') || name.includes('close')) {
            category = 'details';
        }

        return { projectType, category };
    }

    generateAltText(filename, projectType, category) {
        const projectNames = {
            'isolatiewerken': 'isolatiewerken',
            'renovatiewerken': 'renovatiewerken', 
            'platedakken': 'platedakken',
            'ramen-deuren': 'ramen en deuren',
            'tuinaanleg': 'tuinaanleg'
        };

        const categoryNames = {
            'before': 'voor',
            'after': 'na',
            'process': 'tijdens werk',
            'details': 'detail'
        };

        return `Yannova ${projectNames[projectType]} ${categoryNames[category]} - ${filename.replace(/[-_]/g, ' ')}`;
    }

    generateSEOKeywords(projectType, category) {
        const keywords = {
            'isolatiewerken': ['isolatie', 'energiebesparing', 'dakisolatie', 'spouwmuurisolatie'],
            'renovatiewerken': ['renovatie', 'verbouwing', 'modernisering', 'woningverbetering'],
            'platedakken': ['platedak', 'epdm', 'bitumen', 'dakbedekking'],
            'ramen-deuren': ['ramen', 'deuren', 'kozijnen', 'glas'],
            'tuinaanleg': ['tuin', 'terras', 'gazon', 'tuinaanleg']
        };

        return keywords[projectType] || [];
    }
}

// Voer script uit
if (require.main === module) {
    const optimizer = new PhotoOptimizer();
    optimizer.init().catch(console.error);
}

module.exports = PhotoOptimizer;
