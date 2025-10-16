#!/usr/bin/env node

/**
 * Performance Optimization Script
 * Analyzes and optimizes the Yannova Bouw website performance
 */

const fs = require('fs').promises;
const path = require('path');

class PerformanceOptimizer {
  constructor() {
    this.results = {
      bundleSize: {},
      imageOptimization: {},
      codeOptimization: {},
      recommendations: []
    };
  }

  async analyzeBundleSize() {
    console.log('📦 Analyzing bundle sizes...');
    
    const bundlePath = path.join(__dirname, '..', 'dist', 'js', 'bundle.min.js');
    const cssPath = path.join(__dirname, '..', 'dist', 'css', 'bundle.min.css');
    
    try {
      const bundleStats = await fs.stat(bundlePath);
      const cssStats = await fs.stat(cssPath);
      
      this.results.bundleSize = {
        js: {
          size: bundleStats.size,
          sizeKB: Math.round(bundleStats.size / 1024),
          sizeMB: Math.round(bundleStats.size / (1024 * 1024) * 100) / 100
        },
        css: {
          size: cssStats.size,
          sizeKB: Math.round(cssStats.size / 1024),
          sizeMB: Math.round(cssStats.size / (1024 * 1024) * 100) / 100
        }
      };
      
      // Recommendations
      if (this.results.bundleSize.js.sizeKB > 500) {
        this.results.recommendations.push({
          type: 'bundle',
          priority: 'high',
          message: 'JavaScript bundle is large (>500KB). Consider code splitting.',
          impact: 'Loading performance'
        });
      }
      
      if (this.results.bundleSize.css.sizeKB > 100) {
        this.results.recommendations.push({
          type: 'css',
          priority: 'medium',
          message: 'CSS bundle is large (>100KB). Consider critical CSS extraction.',
          impact: 'Rendering performance'
        });
      }
      
    } catch (error) {
      console.log('Bundle files not found, running build first...');
    }
  }

  async analyzeImages() {
    console.log('🖼️ Analyzing images...');
    
    const imagesDir = path.join(__dirname, '..', 'assets', 'images');
    const imageStats = {
      totalFiles: 0,
      totalSize: 0,
      unoptimized: [],
      recommendations: []
    };
    
    try {
      const files = await fs.readdir(imagesDir, { recursive: true });
      
      for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          const filePath = path.join(imagesDir, file);
          const stats = await fs.stat(filePath);
          
          imageStats.totalFiles++;
          imageStats.totalSize += stats.size;
          
          // Check for optimization opportunities
          if (stats.size > 500000) { // > 500KB
            imageStats.unoptimized.push({
              file,
              size: Math.round(stats.size / 1024),
              recommendation: 'Compress or convert to WebP'
            });
          }
        }
      }
      
      this.results.imageOptimization = {
        ...imageStats,
        totalSizeKB: Math.round(imageStats.totalSize / 1024),
        totalSizeMB: Math.round(imageStats.totalSize / (1024 * 1024) * 100) / 100
      };
      
      if (imageStats.unoptimized.length > 0) {
        this.results.recommendations.push({
          type: 'images',
          priority: 'high',
          message: `${imageStats.unoptimized.length} large images need optimization`,
          impact: 'Loading performance',
          details: imageStats.unoptimized
        });
      }
      
    } catch (error) {
      console.log('Images directory not found');
    }
  }

  async analyzeCodeQuality() {
    console.log('🔍 Analyzing code quality...');
    
    const jsDir = path.join(__dirname, '..', 'assets', 'js');
    const codeStats = {
      totalFiles: 0,
      totalLines: 0,
      issues: []
    };
    
    try {
      const files = await fs.readdir(jsDir);
      
      for (const file of files) {
        if (file.endsWith('.js') && !file.includes('.min.')) {
          const filePath = path.join(jsDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          
          codeStats.totalFiles++;
          codeStats.totalLines += content.split('\n').length;
          
          // Check for common issues
          if (content.includes('console.log')) {
            codeStats.issues.push({
              file,
              type: 'console.log',
              count: (content.match(/console\.log/g) || []).length
            });
          }
          
          if (content.includes('var ')) {
            codeStats.issues.push({
              file,
              type: 'var usage',
              count: (content.match(/var /g) || []).length
            });
          }
        }
      }
      
      this.results.codeOptimization = codeStats;
      
      if (codeStats.issues.length > 0) {
        this.results.recommendations.push({
          type: 'code',
          priority: 'medium',
          message: 'Code quality issues found',
          impact: 'Maintainability',
          details: codeStats.issues
        });
      }
      
    } catch (error) {
      console.log('JavaScript directory not found');
    }
  }

  generateReport() {
    console.log('\n📊 Performance Analysis Report');
    console.log('================================\n');
    
    // Bundle Size Report
    if (this.results.bundleSize.js) {
      console.log('📦 Bundle Sizes:');
      console.log(`  JavaScript: ${this.results.bundleSize.js.sizeKB}KB (${this.results.bundleSize.js.sizeMB}MB)`);
      console.log(`  CSS: ${this.results.bundleSize.css.sizeKB}KB (${this.results.bundleSize.css.sizeMB}MB)`);
      console.log('');
    }
    
    // Image Report
    if (this.results.imageOptimization.totalFiles) {
      console.log('🖼️ Images:');
      console.log(`  Total files: ${this.results.imageOptimization.totalFiles}`);
      console.log(`  Total size: ${this.results.imageOptimization.totalSizeKB}KB (${this.results.imageOptimization.totalSizeMB}MB)`);
      console.log(`  Unoptimized: ${this.results.imageOptimization.unoptimized.length}`);
      console.log('');
    }
    
    // Code Quality Report
    if (this.results.codeOptimization.totalFiles) {
      console.log('🔍 Code Quality:');
      console.log(`  Total files: ${this.results.codeOptimization.totalFiles}`);
      console.log(`  Total lines: ${this.results.codeOptimization.totalLines}`);
      console.log(`  Issues found: ${this.results.codeOptimization.issues.length}`);
      console.log('');
    }
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      this.results.recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`  ${index + 1}. ${priority} ${rec.message}`);
        console.log(`     Impact: ${rec.impact}`);
        if (rec.details) {
          console.log(`     Details: ${rec.details.length} items`);
        }
        console.log('');
      });
    }
    
    // Performance Score
    const score = this.calculatePerformanceScore();
    console.log(`🎯 Overall Performance Score: ${score}/100`);
    
    if (score < 70) {
      console.log('⚠️  Performance needs improvement');
    } else if (score < 90) {
      console.log('✅ Good performance with room for optimization');
    } else {
      console.log('🚀 Excellent performance!');
    }
  }

  calculatePerformanceScore() {
    let score = 100;
    
    // Deduct points for issues
    this.results.recommendations.forEach(rec => {
      if (rec.priority === 'high') score -= 15;
      else if (rec.priority === 'medium') score -= 10;
      else score -= 5;
    });
    
    // Bundle size penalties
    if (this.results.bundleSize.js && this.results.bundleSize.js.sizeKB > 500) {
      score -= 10;
    }
    
    // Image optimization penalties
    if (this.results.imageOptimization.unoptimized && this.results.imageOptimization.unoptimized.length > 5) {
      score -= 10;
    }
    
    return Math.max(0, score);
  }

  async run() {
    console.log('🚀 Starting Performance Analysis...\n');
    
    await this.analyzeBundleSize();
    await this.analyzeImages();
    await this.analyzeCodeQuality();
    
    this.generateReport();
    
    // Save results to file
    const reportPath = path.join(__dirname, '..', 'performance-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run the optimizer
if (require.main === module) {
  const optimizer = new PerformanceOptimizer();
  optimizer.run().catch(console.error);
}

module.exports = PerformanceOptimizer;
