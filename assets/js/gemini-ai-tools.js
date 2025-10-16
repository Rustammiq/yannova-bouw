/**
 * Gemini AI Tools JavaScript
 * Handles all AI tool functionality using Google Gemini API
 */

class GeminiAITools {
  constructor() {
    this.apiKey = this.getAPIKey();
    this.baseUrl = '/api/gemini';
    this.models = {
      text: 'gemini-1.5-flash',
      image: 'gemini-2.5-flash-image-preview',
      video: 'veo-3.0-generate-preview'
    };
  }

  getAPIKey() {
    // Get API key from environment or localStorage
    return process.env.GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || 'your-api-key-here';
  }

  async makeRequest(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Video Generation
  async generateVideo(options) {
    const { projectType, duration, style, description } = options;

    const prompt = this.generateVideoPrompt(projectType, duration, style, description);

    try {
      const result = await this.makeRequest('/generate-video', {
        projectType,
        duration,
        style,
        description,
        prompt
      });

      return {
        projectType,
        duration,
        style,
        videoUrl: result.videoUrl || this.generatePlaceholderVideo(projectType),
        thumbnailUrl: result.thumbnailUrl || this.generatePlaceholderImage(projectType),
        prompt: result.prompt || prompt
      };
    } catch (error) {
      // Return placeholder for demo purposes
      return {
        projectType,
        duration,
        style,
        videoUrl: this.generatePlaceholderVideo(projectType),
        thumbnailUrl: this.generatePlaceholderImage(projectType),
        prompt: prompt
      };
    }
  }

  generateVideoPrompt(projectType, duration, style, description) {
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

  // Content Generation
  async generateContent(options) {
    const { contentType, topic, length, tone, keywords } = options;

    const prompt = this.generateContentPrompt(contentType, topic, length, tone, keywords);

    try {
      const result = await this.makeRequest('/generate-content', {
        contentType,
        topic,
        length,
        tone,
        keywords,
        prompt
      });

      return {
        contentType,
        topic,
        content: result.content || this.generatePlaceholderContent(contentType, topic),
        seoScore: result.seoScore || this.calculateSEOScore(keywords),
        wordCount: result.wordCount || this.countWords(result.content),
        prompt: result.prompt || prompt
      };
    } catch (error) {
      return {
        contentType,
        topic,
        content: this.generatePlaceholderContent(contentType, topic),
        seoScore: this.calculateSEOScore(keywords),
        wordCount: this.countWords(this.generatePlaceholderContent(contentType, topic)),
        prompt: prompt
      };
    }
  }

  generateContentPrompt(contentType, topic, length, tone, keywords) {
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

  // Quote Generation
  async generateQuote(options) {
    const { projectType, size, complexity, location, urgency } = options;

    const quoteData = this.calculateQuote(projectType, size, complexity, location, urgency);

    try {
      const result = await this.makeRequest('/generate-quote', {
        projectType,
        size,
        complexity,
        location,
        urgency,
        quoteData
      });

      return result.quote || quoteData;
    } catch (error) {
      return quoteData;
    }
  }

  calculateQuote(projectType, size, complexity, location, urgency) {
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

    const duration = this.calculateDuration(projectType, size, complexity);

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
      breakdown: this.generateBreakdown(projectType, materialsCost, laborCost),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }

  calculateDuration(projectType, size, complexity) {
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

  generateBreakdown(projectType, materialsCost, laborCost) {
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

  // Project Planning
  async generateProjectPlan(options) {
    const { projectName, projectType, startDate, duration, teamSize } = options;

    const plan = this.createProjectPlan(projectName, projectType, startDate, duration, teamSize);

    try {
      const result = await this.makeRequest('/generate-project-plan', {
        projectName,
        projectType,
        startDate,
        duration,
        teamSize,
        plan
      });

      return result.plan || plan;
    } catch (error) {
      return plan;
    }
  }

  createProjectPlan(projectName, projectType, startDate, duration, teamSize) {
    const phases = this.getProjectPhases(projectType, duration);
    const resources = this.getProjectResources(projectType, teamSize);
    const risks = this.getProjectRisks(projectType);

    return {
      projectName,
      projectType,
      startDate,
      duration,
      teamSize,
      timeline: phases,
      resources: resources,
      risks: risks,
      milestones: this.getProjectMilestones(phases)
    };
  }

  getProjectPhases(projectType, duration) {
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

  getProjectResources(projectType, teamSize) {
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

  getProjectRisks(projectType) {
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

  getProjectMilestones(phases) {
    return phases.map((phase, index) => ({
      milestone: phase.task,
      week: phase.week,
      status: 'planned'
    }));
  }

  // Customer Service
  async generateCustomerResponse(options) {
    const { queryType, customerQuery, responseTone } = options;

    const response = this.createCustomerResponse(queryType, customerQuery, responseTone);

    try {
      const result = await this.makeRequest('/generate-customer-response', {
        queryType,
        customerQuery,
        responseTone,
        response
      });

      return result.response || response;
    } catch (error) {
      return response;
    }
  }

  createCustomerResponse(queryType, customerQuery, responseTone) {
    const responseTemplates = {
      'general': {
        'professional': 'Dank u voor uw interesse in onze diensten. Wij zijn gespecialiseerd in isolatiewerken, renovatiewerken, platedakken, ramen en deuren, en tuinaanleg. Hoe kunnen wij u helpen?',
        'friendly': 'Hallo! Leuk dat u contact met ons opneemt. Wij helpen u graag verder met uw bouwproject. Wat heeft u in gedachten?',
        'apologetic': 'Excuses voor de vertraging in onze reactie. Wij waarderen uw geduld en helpen u graag verder.',
        'urgent': 'Wij begrijpen dat uw vraag urgent is. Wij nemen zo snel mogelijk contact met u op.'
      },
      'quote': {
        'professional': 'Dank u voor uw offerteverzoek. Wij maken graag een gedetailleerde offerte voor u op. Kunt u ons meer details geven over uw project?',
        'friendly': 'Geweldig dat u een offerte wilt! Wij maken er graag een mooie offerte voor u van. Vertel ons meer over uw plannen!',
        'apologetic': 'Excuses dat de offerte langer duurt dan verwacht. Wij werken er hard aan en sturen deze zo snel mogelijk.',
        'urgent': 'Wij begrijpen dat u snel een offerte nodig heeft. Wij sturen deze vandaag nog naar u op.'
      }
    };

    const template = responseTemplates[queryType] || responseTemplates['general'];
    return template[responseTone] || template['professional'];
  }

  // Analytics
  async generateAnalytics(options) {
    const { dataType, period, metrics } = options;

    const analytics = this.createAnalytics(dataType, period, metrics);

    try {
      const result = await this.makeRequest('/generate-analytics', {
        dataType,
        period,
        metrics,
        analytics
      });

      return result.analytics || analytics;
    } catch (error) {
      return analytics;
    }
  }

  createAnalytics(dataType, period, metrics) {
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

  // Report Generation
  async generateReport(options) {
    const { reportType, period, format } = options;

    const report = this.createReport(reportType, period, format);

    try {
      const result = await this.makeRequest('/generate-report', {
        reportType,
        period,
        format,
        report
      });

      return result.report || report;
    } catch (error) {
      return report;
    }
  }

  createReport(reportType, period, format) {
    const reportTemplates = {
      'project-summary': `PROJECT SAMENVATTING - ${period.toUpperCase()}

EXECUTIVE SUMMARY
In de afgelopen periode hebben wij 12 projecten succesvol afgerond met een gemiddelde klanttevredenheid van 4.8/5 sterren. Onze focus lag op isolatiewerken en renovatiewerken.

PROJECT DETAILS
- Isolatiewerken: 5 projecten (€45,000 totaal)
- Renovatiewerken: 4 projecten (€78,000 totaal)
- Platedakken: 2 projecten (€23,000 totaal)
- Ramen en Deuren: 1 project (€12,000 totaal)

FINANCIËLE DATA
- Totale omzet: €158,000
- Gemiddelde projectwaarde: €13,167
- Winstmarge: 23%

AANBEVELINGEN
1. Verhoog marketing budget voor platedakken
2. Implementeer project management software
3. Train team in nieuwe isolatietechnieken`,

      'monthly-report': `MAANDELIJKS RAPPORT - ${period.toUpperCase()}

OVERZICHT
Deze maand hebben wij 15 projecten voltooid en 8 nieuwe projecten gestart. Onze team prestaties zijn uitstekend.

PROJECTEN
- Voltooid: 15 projecten
- In uitvoering: 8 projecten
- Geannuleerd: 1 project
- Gemiddelde duur: 2.8 weken

FINANCIËN
- Omzet: €189,000 (+12% vs vorige maand)
- Kosten: €145,000
- Winst: €44,000 (23% marge)

TEAM PRESTATIES
- Productiviteit: +8% vs vorige maand
- Klanttevredenheid: 4.9/5 sterren
- Geen veiligheidsincidenten

VOLGENDE STAPPEN
1. Uitbreiden team met 2 vakmensen
2. Nieuwe marketing campagne starten
3. Klant feedback systeem implementeren`
    };

    return reportTemplates[reportType] || reportTemplates['project-summary'];
  }

  // Design Assistant
  async generateDesign(options) {
    const { projectType, description, style, quality } = options;

    const design = this.createDesign(projectType, description, style, quality);

    try {
      const result = await this.makeRequest('/generate-design', {
        projectType,
        description,
        style,
        quality,
        design
      });

      return result.design || design;
    } catch (error) {
      return design;
    }
  }

  createDesign(projectType, description, style, quality) {
    return {
      projectType,
      description: description || `3D visualisatie van ${projectType} project in ${style} stijl`,
      style,
      quality,
      imageUrl: this.generatePlaceholderImage(projectType),
      specifications: this.getDesignSpecifications(projectType, style),
      materials: this.getDesignMaterials(projectType)
    };
  }

  getDesignSpecifications(projectType, style) {
    const specifications = {
      '3d-visualization': {
        'Resolution': '1920x1080',
        'Format': 'PNG/JPEG',
        'Quality': 'High',
        'Lighting': 'Realistic'
      },
      'floor-plan': {
        'Scale': '1:100',
        'Format': 'PDF/DWG',
        'Layers': 'Multiple',
        'Annotations': 'Complete'
      }
    };

    return specifications['3d-visualization'];
  }

  getDesignMaterials(projectType) {
    const materials = {
      'isolatiewerken': ['PIR isolatie', 'Afdichtingsband', 'Damprem'],
      'renovatiewerken': ['Beton', 'Staal', 'Hout', 'Gips'],
      'platedakken': ['EPDM', 'Bitumen', 'Isolatie'],
      'ramen-deuren': ['Aluminium', 'Kunststof', 'Glas'],
      'tuinaanleg': ['Planten', 'Grond', 'Bestrating']
    };

    return materials[projectType] || materials['renovatiewerken'];
  }

  // Utility methods
  generatePlaceholderVideo(projectType) {
    return `https://via.placeholder.com/800x450/667eea/ffffff?text=${projectType.replace('-', '+')}+Video`;
  }

  generatePlaceholderImage(projectType) {
    return `https://via.placeholder.com/600x400/667eea/ffffff?text=${projectType.replace('-', '+')}+Image`;
  }

  generatePlaceholderContent(contentType, topic) {
    return `Dit is een voorbeeld van ${contentType} content over "${topic}". In een echte implementatie zou dit gegenereerd worden door de Gemini AI API met specifieke informatie over het onderwerp, SEO-optimalisatie, en relevante keywords. De content zou professioneel geschreven zijn en aangepast aan de gewenste lengte en toon.`;
  }

  calculateSEOScore(keywords) {
    // Simple SEO score calculation
    return Math.min(100, Math.max(60, 70 + keywords.length * 5));
  }

  countWords(text) {
    return text.split(/\s+/).length;
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GeminiAITools;
}
