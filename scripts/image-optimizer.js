#!/usr/bin/env node

/**
 * Image Optimization Script
 * Optimizes images for web performance
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

class ImageOptimizer {
  constructor() {
    this.inputDir = path.join(__dirname, '..', 'assets', 'images');
    this.outputDir = path.join(__dirname, '..', 'dist', 'images');
    this.optimizedCount = 0;
    this.totalSavings = 0;
  }

  async optimizeImages() {
    console.log('🖼️ Starting image optimization...');
    
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      
      const files = await this.getImageFiles();
      console.log(`Found ${files.length} images to optimize`);
      
      for (const file of files) {
        await this.optimizeImage(file);
      }
      
      console.log(`\n✅ Optimization complete!`);
      console.log(`📊 Optimized: ${this.optimizedCount} images`);
      console.log(`💾 Total savings: ${Math.round(this.totalSavings / 1024)}KB`);
      
    } catch (error) {
      console.error('❌ Optimization failed:', error);
    }
  }

  async getImageFiles() {
    const files = [];
    
    const scanDir = async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scanDir(fullPath);
        } else if (this.isImageFile(entry.name)) {
          files.push(fullPath);
        }
      }
    };
    
    await scanDir(this.inputDir);
    return files;
  }

  isImageFile(filename) {
    return /\.(jpg|jpeg|png|gif|bmp|tiff)$/i.test(filename);
  }

  async optimizeImage(inputPath) {
    try {
      const relativePath = path.relative(this.inputDir, inputPath);
      const outputPath = path.join(this.outputDir, relativePath);
      
      // Create output directory if needed
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      
      const inputStats = await fs.stat(inputPath);
      const originalSize = inputStats.size;
      
      // Get image info
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      // Determine optimization settings
      const settings = this.getOptimizationSettings(metadata.format);
      
      // Optimize image
      await image
        .resize(settings.maxWidth, settings.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: settings.quality, progressive: true })
        .png({ quality: settings.quality, progressive: true })
        .webp({ quality: settings.quality })
        .toFile(outputPath);
      
      const outputStats = await fs.stat(outputPath);
      const newSize = outputStats.size;
      const savings = originalSize - newSize;
      
      if (savings > 0) {
        this.optimizedCount++;
        this.totalSavings += savings;
        
        console.log(`✅ ${relativePath}: ${Math.round(originalSize/1024)}KB → ${Math.round(newSize/1024)}KB (${Math.round(savings/originalSize*100)}% saved)`);
      } else {
        console.log(`⏭️ ${relativePath}: Already optimized`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to optimize ${inputPath}:`, error.message);
    }
  }

  getOptimizationSettings(format) {
    const settings = {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85
    };
    
    switch (format) {
      case 'jpeg':
      case 'jpg':
        settings.quality = 85;
        break;
      case 'png':
        settings.quality = 90;
        break;
      case 'webp':
        settings.quality = 80;
        break;
      default:
        settings.quality = 85;
    }
    
    return settings;
  }

  async generateWebP() {
    console.log('🔄 Generating WebP versions...');
    
    const files = await this.getImageFiles();
    let webpCount = 0;
    
    for (const file of files) {
      try {
        const relativePath = path.relative(this.inputDir, file);
        const webpPath = path.join(this.outputDir, relativePath.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
        
        await fs.mkdir(path.dirname(webpPath), { recursive: true });
        
        await sharp(file)
          .webp({ quality: 80 })
          .toFile(webpPath);
        
        webpCount++;
        console.log(`✅ Generated WebP: ${path.basename(webpPath)}`);
        
      } catch (error) {
        console.error(`❌ Failed to generate WebP for ${file}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Generated ${webpCount} WebP images`);
  }
}

// Run if called directly
if (require.main === module) {
  const optimizer = new ImageOptimizer();
  
  const command = process.argv[2];
  
  if (command === 'webp') {
    optimizer.generateWebP();
  } else {
    optimizer.optimizeImages();
  }
}

module.exports = ImageOptimizer;
