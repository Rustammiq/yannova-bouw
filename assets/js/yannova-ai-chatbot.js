/**
 * Enhanced AI Chatbot voor Yannova Bouw
 * Met geavanceerde AI, kennisbank en slimme responses
 */

class YannovaAIChatbot {
    constructor() {
        this.knowledgeBase = new YannovaKnowledgeBase();
        this.conversationContext = [];
        this.userProfile = {};
        this.sessionId = this.generateSessionId();
        this.apiConfig = {
            provider: 'gemini',
            model: 'gemini-pro',
            temperature: 0.7,
            maxTokens: 1000
        };
        this.init();
    }

    init() {
        this.loadUserProfile();
        this.setupKnowledgeBase();
        this.initializeConversation();
    }

    generateSessionId() {
        return 'yannova_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    loadUserProfile() {
        const saved = localStorage.getItem('yannova_user_profile');
        if (saved) {
            try {
                this.userProfile = JSON.parse(saved);
            } catch (error) {
                console.error('Failed to load user profile:', error);
            }
        }
    }

    saveUserProfile() {
        localStorage.setItem('yannova_user_profile', JSON.stringify(this.userProfile));
    }

    setupKnowledgeBase() {
        // Initialiseer kennisbank met Yannova specifieke informatie
        this.knowledgeBase.addCategory('bedrijfsinfo', {
            naam: 'Yannova Bouw',
            vestiging: 'Industrieweg 123, 1234 AB Amsterdam',
            telefoon: '+32 (0)477 28 10 28',
            email: 'info@yannovabouw.ai',
            website: 'www.yannovabouw.ai',
            kvk: '12345678',
            btw: 'NL123456789B01',
            oprichting: '2008',
            ervaring: '15+ jaar',
            specialisatie: 'Ramen, deuren, renovatie, nieuwbouw'
        });

        this.knowledgeBase.addCategory('diensten', {
            ramen: {
                types: ['kunststof', 'aluminium', 'hout', 'staal'],
                glas: ['enkelglas', 'dubbelglas', 'hr++', 'triple glas', 'zonwerend glas'],
                merken: ['Schüco', 'Reynaers', 'Velux', 'Skypoint'],
                prijzen: {
                    kunststof: '€300-800 per m²',
                    aluminium: '€500-1200 per m²',
                    hout: '€400-1000 per m²',
                    staal: '€800-2000 per m²'
                }
            },
            deuren: {
                types: ['buitendeuren', 'binnendeuren', 'schuifdeuren', 'garagedeuren'],
                materialen: ['kunststof', 'aluminium', 'hout', 'staal'],
                isolatie: ['standaard', 'hoog', 'passiefhuis'],
                prijzen: {
                    binnendeur: '€200-600 per stuk',
                    buitendeur: '€500-2000 per stuk',
                    schuifdeur: '€1500-5000 per stuk',
                    garagedeur: '€2000-8000 per stuk'
                }
            },
            extra_diensten: [
                'Plaatsing en montage',
                'Oude ramen/deuren verwijderen',
                'Afvoer en recycling',
                'Binnenafwerking',
                'Buitenzijde afwerken',
                'Kozijnen schilderen',
                'Glasschade verzekering',
                '10 jaar garantie'
            ]
        });

        this.knowledgeBase.addCategory('garantie', {
            standaard: '10 jaar op materiaal en montage',
            verlengd: '15 jaar mogelijk tegen meerprijs',
            dekking: 'Materiaal- en constructiefouten',
            exclusies: ['Normale slijtage', 'Schade door onjuist gebruik', 'Force majeure'],
            service: '24/7 servicedienst voor calamiteiten',
            onderhoud: 'Jaarlijkse onderhoudsbeurt beschikbaar'
        });

        this.knowledgeBase.addCategory('process', {
            stappen: [
                '1. Kennismaking en advies',
                '2. Inmeten en offerte',
                '3. Productie (4-6 weken)',
                '4. Montage (1-3 dagen)',
                '5. Oplevering en nazorg'
            ],
            doorlooptijd: '6-8 weken van bestelling tot oplevering',
            betaling: '30% aanbetaling, 70% na oplevering',
            vergunningen: 'Wordt verzorgd indien nodig'
        });
    }

    initializeConversation() {
        this.conversationContext = [{
            role: 'system',
            content: `Je bent een professionele AI assistent voor Yannova Bouw, een gespecialiseerd bedrijf in ramen en deuren met 15+ jaar ervaring. 

Je belangrijkste taken:
- Geef deskundig advies over ramen, deuren en gerelateerde diensten
- Help klanten met het maken van de juiste keuzes
- Beantwoord vragen over prijzen, materialen en processen
- Wees behulpzaam, professioneel en klantgericht

Belangrijke informatie over Yannova:
- Gespecialiseerd in ramen en deuren
- 15+ jaar ervaring
- Werkzaam in heel Nederland en België
- 10 jaar garantie op alle producten en montage
- Gespecialiseerd in energiezuinige oplossingen

Prijsindicaties (ruwe schattingen):
- Kunststof ramen: €300-800 per m²
- Aluminium ramen: €500-1200 per m²
- Houten ramen: €400-1000 per m²
- Binnendeuren: €200-600 per stuk
- Buitendeuren: €500-2000 per stuk

Wees altijd eerlijk over prijzen en verwijs door voor exacte offertes.`
        }];
    }

    async processMessage(userMessage) {
        try {
            // Update conversation context
            this.conversationContext.push({
                role: 'user',
                content: userMessage
            });

            // Analyseer het bericht
            const analysis = this.analyzeMessage(userMessage);
            
            // Update user profile
            this.updateUserProfile(analysis);

            // Genereer response
            const response = await this.generateResponse(analysis);

            // Update conversation context
            this.conversationContext.push({
                role: 'assistant',
                content: response
            );

            // Beperk context lengte
            if (this.conversationContext.length > 10) {
                this.conversationContext = this.conversationContext.slice(-10);
            }

            return {
                response: response,
                analysis: analysis,
                suggestions: this.generateSuggestions(analysis)
            };

        } catch (error) {
            console.error('Error processing message:', error);
            return {
                response: 'Er is een fout opgetreden. Probeer het later opnieuw of neem contact op via +32 (0)477 28 10 28.',
                analysis: null,
                suggestions: []
            };
        }
    }

    analyzeMessage(message) {
        const analysis = {
            intent: this.detectIntent(message),
            entities: this.extractEntities(message),
            sentiment: this.detectSentiment(message),
            urgency: this.detectUrgency(message),
            category: this.categorizeMessage(message)
        };

        return analysis;
    }

    detectIntent(message) {
        const intents = {
            'offerte_aanvragen': ['offerte', 'prijs', 'kosten', 'wat kost', 'quote', 'prijsopgave'],
            'informatie_producten': ['ramen', 'deuren', 'kunststof', 'aluminium', 'hout', 'glas', 'isolatie'],
            'informatie_diensten': ['plaatsing', 'montage', 'installatie', 'service', 'onderhoud'],
            'contact': ['contact', 'telefoon', 'adres', 'openingstijden', 'bereikbaar'],
            'garantie': ['garantie', 'verzekering', 'service', 'nazorg'],
            'proces': ['hoe lang', 'doorlooptijd', 'stappen', 'proces', 'wanneer'],
            'technisch': ['afmetingen', 'maten', 'specificaties', 'technische details'],
            'afspraak_maken': ['afspraak', 'bezoek', 'inmeten', 'advies', 'langskomen']
        };

        const lowerMessage = message.toLowerCase();
        
        for (const [intent, keywords] of Object.entries(intents)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                return intent;
            }
        }

        return 'algemeen';
    }

    extractEntities(message) {
        const entities = {};

        // Telefoonnummers
        const phoneMatch = message.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch) {
            entities.telefoon = phoneMatch[0];
        }

        // Email adressen
        const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
            entities.email = emailMatch[0];
        }

        // Maten en afmetingen
        const sizeMatch = message.match(/(\d+)\s*[xX×]\s*(\d+)/);
        if (sizeMatch) {
            entities.afmetingen = {
                breedte: parseInt(sizeMatch[1]),
                hoogte: parseInt(sizeMatch[2])
            };
        }

        // Materialen
        const materials = ['kunststof', 'aluminium', 'hout', 'staal'];
        materials.forEach(material => {
            if (message.toLowerCase().includes(material)) {
                entities.materiaal = material;
            }
        });

        // Glas types
        const glassTypes = ['enkelglas', 'dubbelglas', 'hr++', 'triple glas', 'zonwerend'];
        glassTypes.forEach(glass => {
            if (message.toLowerCase().includes(glass)) {
                entities.glas = glass;
            }
        });

        // Aantallen
        const numberMatch = message.match(/(\d+)\s*(?:ramen|deuren|stuks|stuk)/);
        if (numberMatch) {
            entities.aantal = parseInt(numberMatch[1]);
        }

        return entities;
    }

    detectSentiment(message) {
        const positiveWords = ['goed', 'prima', 'tevreden', 'fijn', 'mooi', 'perfect', 'uitstekend'];
        const negativeWords = ['slecht', 'teleurgesteld', 'probleem', 'klacht', 'fout', 'niet tevreden'];
        
        const lowerMessage = message.toLowerCase();
        
        if (positiveWords.some(word => lowerMessage.includes(word))) {
            return 'positief';
        } else if (negativeWords.some(word => lowerMessage.includes(word))) {
            return 'negatief';
        }
        
        return 'neutraal';
    }

    detectUrgency(message) {
        const urgentWords = ['spoed', 'dringend', 'zo snel mogelijk', 'direct', 'nu', 'meteen', 'urgent'];
        const lowerMessage = message.toLowerCase();
        
        if (urgentWords.some(word => lowerMessage.includes(word))) {
            return 'hoog';
        }
        
        return 'normaal';
    }

    categorizeMessage(message) {
        const categories = {
            'commercieel': ['offerte', 'prijs', 'kosten', 'koop', 'bestel'],
            'technisch': ['technisch', 'specificatie', 'maat', 'afmeting', 'materiaal'],
            'service': ['service', 'klantenservice', 'help', 'ondersteuning', 'probleem'],
            'informatief': ['informatie', 'weet', 'vertel', 'leg uit', 'wat is']
        };

        const lowerMessage = message.toLowerCase();
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                return category;
            }
        }
        
        return 'algemeen';
    }

    async generateResponse(analysis) {
        // Gebruik kennisbank voor snelle responses
        const knowledgeResponse = this.knowledgeBase.getResponse(analysis);
        if (knowledgeResponse) {
            return knowledgeResponse;
        }

        // Gebruik AI voor complexe vragen
        try {
            const aiResponse = await this.callAI(analysis);
            return aiResponse;
        } catch (error) {
            console.error('AI call failed:', error);
            return this.getFallbackResponse(analysis);
        }
    }

    async callAI(analysis) {
        const prompt = this.buildPrompt(analysis);
        
        // Simuleer AI response (in productie gebruik echte AI API)
        const responses = {
            'offerte_aanvragen': `Ik begrijp dat u een offerte wilt aanvragen. Om u een zo nauwkeurig mogelijke prijsindicatie te geven, heb ik wat meer informatie nodig:

📋 **Benodigde informatie:**
- Hoeveel ramen en/of deuren heeft u nodig?
- Wat zijn de afmetingen (breedte x hoogte)?
- Welk materiaal prefereert u (kunststof, aluminium, hout)?
- Welk type glas (dubbelglas, HR++, triple glas)?

**Direct contact voor offerte:**
📞 Bel: +32 (0)477 28 10 28
📧 Email: info@yannovabouw.ai
🌐 Website: www.yannovabouw.ai

Ik kan u ook direct doorverbinden met een specialist of een afspraak inplannen voor een vrijblijvend bezoek.`,

            'informatie_producten': `Bij Yannova Bouw bieden we een ruim assortiment ramen en deuren van topkwaliteit:

**🪟 Ramen:**
- **Kunststof:** €300-800 per m² - Onderhoudsarm en energiezuinig
- **Aluminium:** €500-1200 per m² - Modern en duurzaam
- **Hout:** €400-1000 per m² - Klassiek en isolerend

**🚪 Deuren:**
- **Binnendeuren:** €200-600 per stuk
- **Buitendeuren:** €500-2000 per stuk  
- **Schuifdeuren:** €1500-5000 per stuk

**🔆 Glasopties:**
- Dubbelglas (standaard)
- HR++ (hoog rendement)
- Triple glas (maximale isolatie)
- Zonwerend glas

Alle producten komen met 10 jaar garantie en professionele montage. Waar bent u specifiek naar op zoek?`,

            'contact': `U kunt Yannova Bouw op verschillende manieren bereiken:

**📞 Telefoon:** +32 (0)477 28 10 28
**📧 Email:** info@yannovabouw.ai
**🌐 Website:** www.yannovabouw.ai
**📍 Adres:** Industrieweg 123, 1234 AB Amsterdam

**Openingstijden:**
- Maandag t/m Vrijdag: 8:00 - 18:00 uur
- Zaterdag: 9:00 - 16:00 uur
- Zondag: Gesloten

**Snel contact nodig?** Ik kan u direct doorverbinden of een specialist laat terugbellen. Wat heeft uw voorkeur?`,

            'garantie': `Bij Yannova Bouw staan we voor kwaliteit en bieden we uitgebreide garantie:

**🛡️ Standaard garantie:**
- 10 jaar op alle materialen en montage
- Dekking van materiaal- en constructiefouten
- Gratis reparatie of vervanging

**🔧 Service:**
- 24/7 servicedienst voor calamiteiten
- Jaarlijkse onderhoudsbeurt beschikbaar
- Snelle response tijd: binnen 48 uur

**📋 Verlengde garantie:**
- 15 jaar mogelijk tegen meerprijs
- Uitgebreide dekking inclusief slijtage

**❌ Niet gedekt:**
- Normale slijtage
- Schade door onjuist gebruik
- Force majeure situaties

We zorgen ervoor dat u jarenlang zorgeloos geniet van uw ramen en deuren!`,

            'proces': `Het proces bij Yannova Bouw is transparant en efficiënt:

**📋 Stap 1: Kennismaking en advies**
- Gratis adviesgesprek
- Demonstratie van mogelijkheden
- Advies op maat

**📏 Stap 2: Inmeten en offerte**
- Precieze inmeting ter plaatse
- Gedetailleerde offerte binnen 3 dagen
- Vrijblijvend en kosteloos

**🏭 Stap 3: Productie**
- Productie op maat (4-6 weken)
- Kwaliteitscontrole
- Transport planning

**🔧 Stap 4: Montage**
- Professionele montage (1-3 dagen)
- Minimale overlast
- Nette afwerking

**✅ Stap 5: Oplevering en nazorg**
- Controle en instructies
- Garantiecertificaat
- 10 jaar nazorg

**Doorlooptijd:** 6-8 weken van bestelling tot oplevering
**Betaling:** 30% aanbetaling, 70% na oplevering`

        };

        return responses[analysis.intent] || responses['algemeen'] || `Bedankt voor uw vraag. Ik help u graag verder! Wat specifieker zoekt u?`;
    }

    buildPrompt(analysis) {
        const context = this.conversationContext.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n');
        
        return `${context}

Gebruiker intent: ${analysis.intent}
Entiteiten: ${JSON.stringify(analysis.entities)}
Categorie: ${analysis.category}

Geef een professioneel, behulpzaam en accuraat antwoord als Yannova Bouw assistent.`;
    }

    getFallbackResponse(analysis) {
        const fallbacks = {
            'offerte_aanvragen': 'Voor een offerte kunt u het beste contact opnemen via +32 (0)477 28 10 28 of het contactformulier invullen.',
            'contact': 'U kunt ons bereiken op +32 (0)477 28 10 28 of via info@yannovabouw.ai',
            'algemeen': 'Ik help u graag verder! Kunt u uw vraag specifieker formuleren?'
        };

        return fallbacks[analysis.intent] || fallbacks['algemeen'];
    }

    generateSuggestions(analysis) {
        const suggestions = {
            'offerte_aanvragen': [
                'Direct offerte aanvragen',
                'Inmeten afspraak maken',
                'Showroom bezoeken',
                'Referenties bekijken'
            ],
            'informatie_producten': [
                'Kunststof ramen',
                'Aluminium deuren',
                'HR++ glas',
                'Garantie informatie'
            ],
            'contact': [
                'Telefoonnummer',
                'Adres en route',
                'Openingstijden',
                'Afspraak maken'
            ],
            'garantie': [
                'Garantievoorwaarden',
                'Service contract',
                'Onderhoudsbeurt',
                'Contact service'
            ]
        };

        return suggestions[analysis.intent] || [
            'Offerte aanvragen',
            'Product informatie',
            'Contact opnemen',
            'Veelgestelde vragen'
        ];
    }

    updateUserProfile(analysis) {
        // Update user profile based on conversation
        if (analysis.entities.materiaal) {
            this.userProfile.materiaalVoorkeur = analysis.entities.materiaal;
        }
        
        if (analysis.entities.glas) {
            this.userProfile.glasVoorkeur = analysis.entities.glas;
        }
        
        if (analysis.category) {
            this.userProfile.laatsteCategorie = analysis.category;
        }
        
        this.userProfile.laatsteBezoek = new Date().toISOString();
        this.userProfile.aantalBerichten = (this.userProfile.aantalBerichten || 0) + 1;
        
        this.saveUserProfile();
    }

    // Knowledge Base class
    class YannovaKnowledgeBase {
        constructor() {
            this.categories = {};
            this.responses = {};
        }

        addCategory(name, data) {
            this.categories[name] = data;
        }

        getResponse(analysis) {
            // Quick responses based on analysis
            if (analysis.intent === 'contact') {
                return this.getContactInfo();
            }
            
            if (analysis.intent === 'garantie') {
                return this.getGarantieInfo();
            }
            
            return null;
        }

        getContactInfo() {
            return `**Yannova Bouw Contactgegevens:**

📞 **Telefoon:** +32 (0)477 28 10 28
📧 **Email:** info@yannovabouw.ai
🌐 **Website:** www.yannovabouw.ai
📍 **Adres:** Industrieweg 123, 1234 AB Amsterdam

**Openingstijden:**
• Maandag t/m Vrijdag: 8:00 - 18:00 uur
• Zaterdag: 9:00 - 16:00 uur
• Zondag: Gesloten

Ik kan u ook direct doorverbinden of een specialist laat terugbellen. Wat heeft uw voorkeur?`;
        }

        getGarantieInfo() {
            return `**Yannova Bouw Garantie:**

🛡️ **10 Jaar Garantie** op alle producten en montage
✅ Volledige dekking van materiaal- en constructiefouten
🔧 24/7 servicedienst voor calamiteiten
📋 Jaarlijkse onderhoudsbeurt beschikbaar

**Verlengde opties:**
- 15 jaar garantie mogelijk
- Uitgebreide service contracten

We staan 100% achter onze kwaliteit!`;
        }
    }
}

// Export voor gebruik
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YannovaAIChatbot;
}