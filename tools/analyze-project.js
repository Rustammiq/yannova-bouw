#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Gemini API configuratie
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key-here');

async function analyzeProject() {
    const projectPath = process.cwd();
    console.log(`🔍 Analyseren van project: ${projectPath}`);
    
    // Lees project structuur
    const projectStructure = getProjectStructure(projectPath);
    
    // Lees belangrijke bestanden
    const keyFiles = [
        'package.json',
        'index.html',
        'assets/js/main.js',
        'assets/css/main.css',
        'admin/dashboard.html'
    ];
    
    const fileContents = {};
    for (const file of keyFiles) {
        const filePath = path.join(projectPath, file);
        if (fs.existsSync(filePath)) {
            fileContents[file] = fs.readFileSync(filePath, 'utf8');
        }
    }
    
    // Gemini prompt voor project analyse
    const prompt = `
Analyseer dit web development project en geef concrete verbeteringen:

PROJECT STRUCTUUR:
${JSON.stringify(projectStructure, null, 2)}

BELANGRIJKE BESTANDEN:
${JSON.stringify(fileContents, null, 2)}

Geef een gedetailleerde analyse met:
1. Code kwaliteit beoordeling
2. Performance verbeteringen
3. Security issues
4. UI/UX verbeteringen
5. Code organisatie suggesties
6. Best practices implementatie
7. Concrete code voorbeelden voor verbeteringen

Focus op:
- JavaScript best practices
- CSS optimalisatie
- HTML semantiek
- Admin panel beveiliging
- Mobile responsiveness
- SEO optimalisatie
`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('\n📊 GEMINI PROJECT ANALYSE:');
        console.log('=' .repeat(50));
        console.log(text);
        
        // Sla analyse op
        fs.writeFileSync('project-analysis.md', text);
        console.log('\n💾 Analyse opgeslagen in: project-analysis.md');
        
    } catch (error) {
        console.error('❌ Fout bij Gemini API:', error.message);
        console.log('\n🔧 Zet je GEMINI_API_KEY environment variable:');
        console.log('export GEMINI_API_KEY="your-api-key"');
    }
}

function getProjectStructure(dir, baseDir = dir, level = 0) {
    const structure = {};
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules') continue;
        
        const fullPath = path.join(dir, item);
        const relativePath = path.relative(baseDir, fullPath);
        
        if (fs.statSync(fullPath).isDirectory()) {
            if (level < 3) { // Beperk diepte
                structure[item] = getProjectStructure(fullPath, baseDir, level + 1);
            }
        } else {
            structure[item] = 'file';
        }
    }
    
    return structure;
}

// Uitvoeren
if (require.main === module) {
    analyzeProject();
}

module.exports = { analyzeProject };
