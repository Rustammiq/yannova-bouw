#!/bin/bash

# Yannova Project Analyzer met Gemini
# Gebruik: ./analyze.sh

echo "🚀 Yannova Project Analyzer met Gemini"
echo "======================================"

# Check of Gemini API key is ingesteld
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ GEMINI_API_KEY is niet ingesteld!"
    echo ""
    echo "🔧 Stap 1: Krijg een API key van: https://makersuite.google.com/app/apikey"
    echo "🔧 Stap 2: Zet de key: export GEMINI_API_KEY=\"your-api-key\""
    echo "🔧 Stap 3: Voer dit script opnieuw uit: ./analyze.sh"
    exit 1
fi

# Check of dependencies geïnstalleerd zijn
if [ ! -d "node_modules" ]; then
    echo "📦 Installeer dependencies..."
    npm install
fi

# Voer analyse uit
echo "🔍 Start project analyse..."
node analyze-project.js

echo ""
echo "✅ Analyse voltooid! Check project-analysis.md voor details."
