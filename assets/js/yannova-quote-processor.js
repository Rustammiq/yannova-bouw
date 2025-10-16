/**
 * Enhanced Quote Processor met AI integratie
 * Verwerkt offerteaanvragen en genereert slimme aanbevelingen
 */

class YannovaQuoteProcessor {
    constructor() {
        this.aiEngine = new YannovaAIEngine();
        this.pricingDB = new PricingDatabase();
        this.materialsDB = new MaterialsDatabase();
        this.init();
    }

    init() {
        this.loadPricingData();
        this.loadMaterialData();
        this.setupAIModels();
    }

    async processQuoteRequest(requestData) {
        try {
            // Analyseer de aanvraag
            const analysis = await this.analyzeRequest(requestData);
            
            // Genereer AI aanbevelingen
            const recommendations = await this.generateRecommendations(analysis);
            
            // Bereken prijzen
            const pricing = await this.calculatePricing(analysis, recommendations);
            
            // Maak complete offerte
            const quote = this.buildQuote(requestData, analysis, recommendations, pricing);
            
            // Sla op in database
            await this.saveQuote(quote);
            
            return quote;
            
        } catch (error) {
            console.error('Quote processing error:', error);
            throw new Error('Offerte verwerking mislukt');
        }
    }

    async analyzeRequest(requestData) {
        const analysis = {
            klant: this.analyzeCustomer(requestData.klant),
            project: this.analyzeProject(requestData),
            requirements: this.analyzeRequirements(requestData),
            complexity: this.assessComplexity(requestData),
            timeline: this.estimateTimeline(requestData)
        };

        return analysis;
    }

    analyzeCustomer(klantData) {
        return {
            type: this.determineCustomerType(klantData),
            voorkeuren: this.extractPreferences(klantData),
            budget: this.estimateBudget(klantData),
            urgentie: this.assessUrgency(klantData)
        };
    }

    determineCustomerType(klantData) {
        // Analyseer klanttype op basis van beschikbare data
        if (klantData.bedrijfsnaam) {
            return 'zakelijk';
        }
        if (klantData.projectType === 'nieuwbouw') {
            return 'bouw';
        }
        return 'particulier';
    }

    extractPreferences(klantData) {
        const preferences = {};
        
        // Extraheer materiaal voorkeuren
        if (klantData.voorkeuren?.materiaal) {
            preferences.materiaal = klantData.voorkeuren.materiaal;
        }
        
        // Extraheer kleur voorkeuren
        if (klantData.voorkeuren?.kleur) {
            preferences.kleur = klantData.voorkeuren.kleur;
        }
        
        // Extraheer stijl voorkeuren
        if (klantData.voorkeuren?.stijl) {
            preferences.stijl = klantData.voorkeuren.stijl;
        }
        
        return preferences;
    }

    estimateBudget(klantData) {
        // Schat budget op basis van beschikbare informatie
        if (klantData.voorkeuren?.budget) {
            return klantData.voorkeuren.budget;
        }
        
        // Geen budget opgegeven - return null
        return null;
    }

    assessUrgency(klantData) {
        if (klantData.spoed) return 'hoog';
        if (klantData.gewensteDatum) {
            const dagen = Math.ceil((new Date(klantData.gewensteDatum) - new Date()) / (1000 * 60 * 60 * 24));
            if (dagen < 14) return 'hoog';
            if (dagen < 30) return 'medium';
        }
        return 'normaal';
    }

    analyzeProject(requestData) {
        return {
            type: requestData.projectType || 'vervanging',
            omvang: this.calculateScope(requestData),
            locatie: this.analyzeLocation(requestData),
            condities: this.assessConditions(requestData)
        };
    }

    calculateScope(requestData) {
        let totaalM2 = 0;
        let totaalStuk = 0;

        // Bereken ramen
        if (requestData.ramen) {
            requestData.ramen.forEach(raam => {
                if (raam.afmetingen) {
                    const m2 = (raam.afmetingen.breedte * raam.afmetingen.hoogte) / 10000;
                    totaalM2 += m2 * (raam.aantal || 1);
                }
                totaalStuk += raam.aantal || 1;
            });
        }

        // Bereken deuren
        if (requestData.deuren) {
            requestData.deuren.forEach(deur => {
                totaalStuk += deur.aantal || 1;
            });
        }

        return {
            totaalM2: Math.round(totaalM2 * 100) / 100,
            totaalStuk,
            categorie: this.categorizeScope(totaalM2, totaalStuk)
        };
    }

    categorizeScope(m2, stuk) {
        if (m2 < 10 || stuk < 5) return 'klein';
        if (m2 < 30 || stuk < 15) return 'medium';
        if (m2 < 60 || stuk < 30) return 'groot';
        return 'zeer groot';
    }

    analyzeLocation(requestData) {
        return {
            type: requestData.locatieType || 'woning',
            bouwjaar: requestData.bouwjaar,
            verdiepingen: requestData.verdiepingen || 1,
            bereikbaarheid: requestData.bereikbaarheid || 'normaal',
            regio: requestData.regio || 'onbekend'
        };
    }

    assessConditions(requestData) {
        return {
            huidigeStaat: requestData.huidigeStaat || 'normaal',
            isolatieNiveau: requestData.isolatieNiveau || 'matig',
            vergunningen: this.checkPermitRequirements(requestData),
            seizoen: this.getCurrentSeason()
        };
    }

    checkPermitRequirements(requestData) {
        const requirements = [];
        
        if (requestData.locatieType === 'monument') {
            requirements.push('Monumentenvergunning');
        }
        
        if (requestData.projectType === 'nieuwbouw') {
            requirements.push('Bouwpvergunning');
        }
        
        if (requestData.verdiepingen > 2) {
            requirements.push('Gevelvergunning');
        }
        
        return requirements;
    }

    getCurrentSeason() {
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5) return 'lente';
        if (month >= 6 && month <= 8) return 'zomer';
        if (month >= 9 && month <= 11) return 'herfst';
        return 'winter';
    }

    analyzeRequirements(requestData) {
        return {
            functioneel: this.analyzeFunctionalRequirements(requestData),
            technisch: this.analyzeTechnicalRequirements(requestData),
            esthetisch: this.analyzeAestheticRequirements(requestData),
            duurzaamheid: this.analyzeSustainabilityRequirements(requestData)
        };
    }

    analyzeFunctionalRequirements(requestData) {
        return {
            ventilatie: this.checkVentilationNeeds(requestData),
            veiligheid: this.assessSafetyRequirements(requestData),
            toegankelijkheid: this.checkAccessibilityNeeds(requestData),
            geluidsisolatie: this.assessSoundInsulationNeeds(requestData)
        };
    }

    checkVentilationNeeds(requestData) {
        // Check ventilatie eisen
        if (requestData.locatieType === 'kantoor' || requestData.locatieType === 'school') {
            return 'hoog';
        }
        return 'normaal';
    }

    assessSafetyRequirements(requestData) {
        const requirements = [];
        
        if (requestData.deuren) {
            requestData.deuren.forEach(deur => {
                if (deur.type === 'buitendeur') {
                    requirements.push('Veiligheidsslot');
                }
                if (deur.type === 'garagedeur') {
                    requirements.push('Automatische verlichting');
                }
            });
        }
        
        return requirements;
    }

    checkAccessibilityNeeds(requestData) {
        // Check toegankelijkheidseisen
        if (requestData.locatieType === 'zorginstelling' || requestData.locatieType === 'school') {
            return 'hoog';
        }
        return 'normaal';
    }

    assessSoundInsulationNeeds(requestData) {
        if (requestData.locatieType === 'kantoor' || requestData.locatie.bouwjaar < 1980) {
            return 'hoog';
        }
        return 'normaal';
    }

    analyzeTechnicalRequirements(requestData) {
        return {
            isolatie: this.determineInsulationRequirements(requestData),
            constructie: this.assessStructuralRequirements(requestData),
            installatie: this.determineInstallationRequirements(requestData)
        };
    }

    determineInsulationRequirements(requestData) {
        const current = requestData.isolatieNiveau || 'matig';
        const desired = requestData.gewenstIsolatieNiveau || 'goed';
        
        return {
            huidig: current,
            gewenst: desired,
            verbetering: this.calculateInsulationImprovement(current, desired),
            aanbevolen: this.recommendInsulationType(current, desired)
        };
    }

    calculateInsulationImprovement(current, desired) {
        const levels = { slecht: 1, matig: 2, goed: 3, uitstekend: 4 };
        return levels[desired] - levels[current];
    }

    recommendInsulationType(current, desired) {
        const improvement = this.calculateInsulationImprovement(current, desired);
        
        if (improvement >= 2) {
            return 'triple glas';
        } else if (improvement >= 1) {
            return 'hr++ glas';
        }
        return 'dubbelglas';
    }

    assessStructuralRequirements(requestData) {
        return {
            draagkracht: this.assessLoadBearingRequirements(requestData),
            waterdichtheid: this.assessWaterproofingRequirements(requestData),
    brandveiligheid: this.assessFireSafetyRequirements(requestData)
        };
    }

    assessLoadBearingRequirements(requestData) {
        if (requestData.verdiepingen > 2) {
            return 'hoog';
        }
        return 'normaal';
    }

    assessWaterproofingRequirements(requestData) {
        return 'standaard'; // Meeste projecten hebben standaard waterdichtheid nodig
    }

    assessFireSafetyRequirements(requestData) {
        if (requestData.locatieType === 'kantoor' || requestData.locatieType === 'school') {
            return 'hoog';
        }
        return 'normaal';
    }

    determineInstallationRequirements(requestData) {
        return {
            methode: this.determineInstallationMethod(requestData),
            voorbereiding: this.assessPreparationNeeds(requestData),
            afwerking: this.determineFinishingRequirements(requestData)
        };
    }

    determineInstallationMethod(requestData) {
        if (requestData.verdiepingen > 2) {
            return 'steiger';
        }
        return 'standaard';
    }

    assessPreparationNeeds(requestData) {
        const needs = [];
        
        if (requestData.huidigeStaat === 'slecht') {
            needs.push('herstelwerkzaamheden');
        }
        
        if (requestData.projectType === 'renovatie') {
            needs.push('sloopwerkzaamheden');
        }
        
        return needs;
    }

    determineFinishingRequirements(requestData) {
        return {
            binnenkant: 'standaard',
            buitenkant: 'standaard',
            kitwerk: 'standaard',
            afwerking: requestData.voorkeuren?.afwerking || 'standaard'
        };
    }

    analyzeAestheticRequirements(requestData) {
        return {
            stijl: requestData.voorkeuren?.stijl || 'modern',
            kleur: requestData.voorkeuren?.kleur || 'wit',
            profiel: this.determineProfileStyle(requestData),
            afwerking: this.determineFinishingStyle(requestData)
        };
    }

    determineProfileStyle(requestData) {
        const stijl = requestData.voorkeuren?.stijl || 'modern';
        
        const profileMap = {
            'modern': 'slim',
            'klassiek': 'standaard',
            'landelijk': 'breed',
            'industrieel': 'staallook'
        };
        
        return profileMap[stijl] || 'standaard';
    }

    determineFinishingStyle(requestData) {
        return {
            binnenkant: 'standaard',
            buitenkant: 'standaard',
            hardware: requestData.voorkeuren?.hardware || 'standaard'
        };
    }

    analyzeSustainabilityRequirements(requestData) {
        return {
            energie: this.assessEnergyEfficiency(requestData),
            materiaal: this.assessMaterialSustainability(requestData),
            levensduur: this.assessLifecycle(requestData)
        };
    }

    assessEnergyEfficiency(requestData) {
        const current = requestData.isolatieNiveau || 'matig';
        const desired = requestData.gewenstIsolatieNiveau || 'goed';
        
        return {
            huidig: current,
            doel: desired,
            besparing: this.estimateEnergySavings(current, desired),
            subsidie: this.checkSubsidyEligibility(current, desired)
        };
    }

    estimateEnergySavings(current, desired) {
        const savings = {
            'slecht->goed': '30-40%',
            'slecht->uitstekend': '40-50%',
            'matig->goed': '20-30%',
            'matig->uitstekend': '30-40%',
            'goed->uitstekend': '10-20%'
        };
        
        const key = `${current}->${desired}`;
        return savings[key] || '10-20%';
    }

    checkSubsidyEligibility(current, desired) {
        const improvement = this.calculateInsulationImprovement(current, desired);
        return improvement >= 2;
    }

    assessMaterialSustainability(requestData) {
        const materiaal = requestData.voorkeuren?.materiaal || 'kunststof';
        
        return {
            type: materiaal,
            duurzaamheid: this.getMaterialSustainability(materiaal),
            recyclebaarheid: this.getMaterialRecyclability(materiaal),
            onderhoud: this.getMaintenanceImpact(materiaal)
        };
    }

    getMaterialSustainability(materiaal) {
        const sustainability = {
            'kunststof': 'medium',
            'aluminium': 'high',
            'hout': 'high',
            'staal': 'medium'
        };
        
        return sustainability[materiaal] || 'medium';
    }

    getMaterialRecyclability(materiaal) {
        const recyclability = {
            'kunststof': 'good',
            'aluminium': 'excellent',
            'hout': 'good',
            'staal': 'excellent'
        };
        
        return recyclability[materiaal] || 'good';
    }

    getMaintenanceImpact(materiaal) {
        const impact = {
            'kunststof': 'low',
            'aluminium': 'medium',
            'hout': 'high',
            'staal': 'medium'
        };
        
        return impact[materiaal] || 'medium';
    }

    assessLifecycle(requestData) {
        return {
            verwachte_levensduur: this.estimateLifecycle(requestData),
            onderhoudsinterval: this.getMaintenanceInterval(requestData),
            eind_leven_behandeling: this.getEndOfLifeTreatment(requestData)
        };
    }

    estimateLifecycle(requestData) {
        const materiaal = requestData.voorkeuren?.materiaal || 'kunststof';
        
        const lifecycles = {
            'kunststof': '50 jaar',
            'aluminium': '40 jaar',
            'hout': '30 jaar',
            'staal': '60 jaar'
        };
        
        return lifecycles[materiaal] || '40 jaar';
    }

    getMaintenanceInterval(requestData) {
        const materiaal = requestData.voorkeuren?.materiaal || 'kunststof';
        
        const intervals = {
            'kunststof': '5 jaar',
            'aluminium': '3 jaar',
            'hout': '1 jaar',
            'staal': '3 jaar'
        };
        
        return intervals[materiaal] || '3 jaar';
    }

    getEndOfLifeTreatment(requestData) {
        const materiaal = requestData.voorkeuren?.materiaal || 'kunststof';
        
        const treatments = {
            'kunststof': 'recycling',
            'aluminium': 'recycling',
            'hout': 'biomass',
            'staal': 'recycling'
        };
        
        return treatments[materiaal] || 'recycling';
    }

    assessComplexity(requestData) {
        let complexityScore = 1;
        const factors = [];

        // Bereikbaarheid
        if (requestData.bereikbaarheid === 'moeilijk') {
            complexityScore += 0.15;
            factors.push('Moeilijke bereikbaarheid');
        }

        // Type pand
        if (requestData.locatieType === 'monument') {
            complexityScore += 0.25;
            factors.push('Monumentaal pand');
        }

        // Hoogbouw
        if (requestData.verdiepingen > 3) {
            complexityScore += 0.10;
            factors.push('Hoogbouw');
        }

        // Speciale afmetingen
        if (this.hasSpecialDimensions(requestData)) {
            complexityScore += 0.20;
            factors.push('Speciale afmetingen');
        }

        return {
            score: Math.round(complexityScore * 100) / 100,
            factors,
            niveau: this.getComplexityLevel(complexityScore)
        };
    }

    hasSpecialDimensions(requestData) {
        if (requestData.ramen) {
            return requestData.ramen.some(raam => 
                raam.afmetingen && (
                    raam.afmetingen.breedte > 200 || 
                    raam.afmetingen.hoogte > 250
                )
            );
        }
        return false;
    }

    getComplexityLevel(score) {
        if (score <= 1.0) return 'eenvoudig';
        if (score <= 1.15) return 'normaal';
        if (score <= 1.25) return 'complex';
        return 'zeer complex';
    }

    estimateTimeline(requestData) {
        const baseDays = 7;
        const complexity = this.assessComplexity(requestData);
        const scope = this.calculateScope(requestData);
        
        let totalDays = baseDays * complexity.score;
        
        // Add time for scope
        if (scope.categorie === 'groot') totalDays += 7;
        if (scope.categorie === 'zeer groot') totalDays += 14;
        
        // Add time for special requirements
        if (requestData.locatieType === 'monument') totalDays += 10;
        if (requestData.verdiepingen > 2) totalDays += 5;
        
        return {
            productie: Math.round(totalDays * 0.6),
            montage: Math.round(totalDays * 0.4),
            totaal: Math.round(totalDays),
            start: this.estimateStartDate(requestData),
            oplevering: this.estimateCompletionDate(requestData, totalDays)
        };
    }

    estimateStartDate(requestData) {
        const date = new Date();
        if (requestData.urgentie === 'hoog') {
            date.setDate(date.getDate() + 7);
        } else {
            date.setDate(date.getDate() + 21);
        }
        return date.toISOString();
    }

    estimateCompletionDate(requestData, totalDays) {
        const date = new Date(this.estimateStartDate(requestData));
        date.setDate(date.getDate() + totalDays);
        return date.toISOString();
    }

    async generateRecommendations(analysis) {
        const recommendations = [];

        // Energie aanbevelingen
        if (analysis.requirements.duurzaamheid.energie.subsidie) {
            recommendations.push({
                type: 'energie',
                titel: 'Subsidie Mogelijk',
                beschrijving: 'U komt in aanmerking voor ISDE subsidie. Wij helpen u met de aanvraag.',
                voordeel: '€150-500 per m²',
                actie: 'Subsidie aanvragen'
            });
        }

        // Materiaal aanbevelingen
        const materiaalAdvies = this.generateMaterialRecommendation(analysis);
        recommendations.push(materiaalAdvies);

        // Onderhoud aanbevelingen
        const onderhoudAdvies = this.generateMaintenanceRecommendation(analysis);
        recommendations.push(onderhoudAdvies);

        return recommendations;
    }

    generateMaterialRecommendation(analysis) {
        const klantType = analysis.klant.type;
        const projectType = analysis.project.type;
        
        if (klantType === 'zakelijk' || projectType === 'nieuwbouw') {
            return {
                type: 'materiaal',
                titel: 'Aluminium Aanbevolen',
                beschrijving: 'Voor zakelijke projecten is aluminium de beste keuze: duurzaam en professioneel.',
                voordelen: ['Lange levensduur', 'Onderhoudsarm', 'Moderne uitstraling'],
                meerprijs: '+20% t.o.v. kunststof'
            };
        }
        
        return {
            type: 'materiaal',
            titel: 'Kunststof Aanbevolen',
            beschrijving: 'Beste prijs-kwaliteitverhouding voor uw project.',
            voordelen: ['Onderhoudsarm', 'Goede isolatie', 'Lange garantie'],
            meerprijs: 'Standaard optie'
        };
    }

    generateMaintenanceRecommendation(analysis) {
        return {
            type: 'onderhoud',
            titel: 'Onderhoudscontract Aanbevolen',
            beschrijving: 'Verleng de levensduur en behoud garantie met jaarlijks onderhoud.',
            kosten: '€75-150 per jaar',
            voordelen: ['10 jaar garantie behouden', 'Jaarlijkse inspectie', 'Voorrang bij calamiteiten']
        };
    }

    async calculatePricing(analysis, recommendations) {
        // Implementeer prijsberekening logica
        return {
            materialen: [],
            arbeid: [],
            bijkomend: [],
            totalen: {
                excl_btw: 0,
                btw: 0,
                incl_btw: 0
            }
        };
    }

    buildQuote(requestData, analysis, recommendations, pricing) {
        return {
            id: this.generateQuoteId(),
            klant: requestData.klant,
            analyse: analysis,
            aanbevelingen: recommendations,
            prijzen: pricing,
            timestamp: new Date().toISOString(),
            geldigTot: this.calculateValidity(),
            status: 'concept'
        };
    }

    generateQuoteId() {
        return 'YAN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    calculateValidity() {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString();
    }

    async saveQuote(quote) {
        // Implementeer database opslag
        console.log('Quote saved:', quote.id);
    }

    // AI Engine class
    class YannovaAIEngine {
        constructor() {
            this.models = {
                pricing: 'pricing-model-v1',
                recommendations: 'recommendation-model-v1',
                analysis: 'analysis-model-v1'
            };
        }

        async predict(data, model) {
            // Simuleer AI voorspelling
            return {
                confidence: 0.85,
                prediction: data,
                reasoning: 'AI-based analysis'
            };
        }
    }

    // Pricing Database class
    class PricingDatabase {
        constructor() {
            this.prices = {};
        }

        async getPrice(itemType, specifications) {
            // Implementeer prijs database logica
            return 500; // Default prijs
        }
    }

    // Materials Database class
    class MaterialsDatabase {
        constructor() {
            this.materials = {};
        }

        async getMaterialInfo(material, property) {
            // Implementeer materialen database logica
            return null;
        }
    }
}

// Export voor gebruik
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YannovaQuoteProcessor;
}