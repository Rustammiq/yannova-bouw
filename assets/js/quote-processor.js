// AI Quote Processing Engine voor Yannova Ramen en Deuren
class YannovaQuoteProcessor {
    constructor() {
        this.scenarios = {
            'raamvervanging': this.getRaamvervangingPrompt(),
            'gevelrenovatie': this.getGevelrenovatiePrompt(),
            'schuifpui': this.getSchuifpuiPrompt(),
            'dakramen': this.getDakramenPrompt(),
            'nieuwbouw': this.getNieuwbouwPrompt()
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for voice input from chatbot
        document.addEventListener('quoteRequest', (e) => {
            this.processQuoteRequest(e.detail);
        });
    }

    async processQuoteRequest(voiceInput) {
        try {
            // Analyze voice input to determine scenario
            const scenario = this.detectScenario(voiceInput);
            
            // Extract structured data from voice input
            const extractedData = this.extractDataFromVoice(voiceInput);
            
            // Generate AI prompt based on scenario
            const aiPrompt = this.generateAIPrompt(scenario, extractedData);
            
            // Send to AI processing service
            const quote = await this.sendToAI(aiPrompt);
            
            // Process and format the response
            const formattedQuote = this.formatQuoteResponse(quote);
            
            // Return to chatbot or quote generator
            this.deliverQuote(formattedQuote);
            
        } catch (error) {
            console.error('Quote processing error:', error);
            this.handleError(error);
        }
    }

    detectScenario(voiceInput) {
        const input = voiceInput.toLowerCase();
        
        if (input.includes('dakkapel') || input.includes('dakraam')) {
            return 'dakramen';
        } else if (input.includes('schuifpui') || input.includes('schuifdeur')) {
            return 'schuifpui';
        } else if (input.includes('nieuwbouw') || input.includes('nieuwe woning')) {
            return 'nieuwbouw';
        } else if (input.includes('alle ramen') || input.includes('gevel') || input.includes('rijtjeshuis')) {
            return 'gevelrenovatie';
        } else {
            return 'raamvervanging'; // Default scenario
        }
    }

    extractDataFromVoice(voiceInput) {
        const data = {
            naam: this.extractName(voiceInput),
            afmetingen: this.extractDimensions(voiceInput),
            materiaal: this.extractMaterial(voiceInput),
            glasType: this.extractGlassType(voiceInput),
            kleur: this.extractColor(voiceInput),
            extraWensen: this.extractExtraWishes(voiceInput),
            locatie: this.extractLocation(voiceInput)
        };
        
        return data;
    }

    extractName(input) {
        const nameMatch = input.match(/(?:ik ben|mijn naam is|dit is)\s+([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
        return nameMatch ? nameMatch[1] : 'Onbekend';
    }

    extractDimensions(input) {
        const dimensions = [];
        
        // Pattern for dimensions like "150 bij 120 centimeter"
        const dimPattern = /(\d+)\s*(?:bij|x|×)\s*(\d+)\s*(?:cm|centimeter|meter)/gi;
        let match;
        
        while ((match = dimPattern.exec(input)) !== null) {
            dimensions.push({
                breedte: parseInt(match[1]),
                hoogte: parseInt(match[2]),
                eenheid: match[0].includes('meter') ? 'meter' : 'cm'
            });
        }
        
        return dimensions;
    }

    extractMaterial(input) {
        if (input.includes('kunststof') || input.includes('pvc')) return 'kunststof';
        if (input.includes('aluminium')) return 'aluminium';
        if (input.includes('hout') || input.includes('houten')) return 'hout';
        return 'geen voorkeur';
    }

    extractGlassType(input) {
        if (input.includes('triple') || input.includes('hr+++')) return 'HR+++ triple glas';
        if (input.includes('dubbel') || input.includes('hr++')) return 'HR++ dubbel glas';
        if (input.includes('hr+')) return 'HR+ glas';
        return 'HR++ dubbel glas'; // Default
    }

    extractColor(input) {
        if (input.includes('wit')) return 'wit';
        if (input.includes('zwart')) return 'zwart';
        if (input.includes('grijs') || input.includes('antraciet')) return 'grijs';
        if (input.includes('bruin')) return 'bruin';
        return 'wit'; // Default
    }

    extractExtraWishes(input) {
        const wishes = [];
        if (input.includes('zonwering')) wishes.push('zonwering');
        if (input.includes('screen') || input.includes('horren')) wishes.push('screens');
        if (input.includes('elektrisch')) wishes.push('elektrische bediening');
        if (input.includes('inbraakwerend')) wishes.push('inbraakwerend');
        return wishes;
    }

    extractLocation(input) {
        if (input.includes('woonkamer')) return 'woonkamer';
        if (input.includes('slaapkamer')) return 'slaapkamer';
        if (input.includes('keuken')) return 'keuken';
        if (input.includes('voorkant')) return 'voorkant';
        if (input.includes('achterkant')) return 'achterkant';
        return 'niet gespecificeerd';
    }

    generateAIPrompt(scenario, extractedData) {
        const basePrompt = this.scenarios[scenario];
        
        // Replace placeholders with extracted data
        let prompt = basePrompt.replace(/\[uit transcript halen\]/g, extractedData.naam);
        prompt = prompt.replace(/\[uit transcript\]/g, extractedData.afmetingen.length > 0 ? 
            `${extractedData.afmetingen.length}x raam ${extractedData.afmetingen[0].breedte}x${extractedData.afmetingen[0].hoogte}cm` : 
            'Afmetingen uit transcript');
        
        // Add extracted data to prompt
        prompt += `\n\nEXTRACTED DATA FROM VOICE INPUT:\n`;
        prompt += `- Naam: ${extractedData.naam}\n`;
        prompt += `- Afmetingen: ${JSON.stringify(extractedData.afmetingen)}\n`;
        prompt += `- Materiaal voorkeur: ${extractedData.materiaal}\n`;
        prompt += `- Glas type: ${extractedData.glasType}\n`;
        prompt += `- Kleur: ${extractedData.kleur}\n`;
        prompt += `- Extra wensen: ${extractedData.extraWensen.join(', ')}\n`;
        prompt += `- Locatie: ${extractedData.locatie}\n`;
        
        return prompt;
    }

    async sendToAI(prompt) {
        // This would integrate with OpenAI, Claude, or other AI service
        // For now, we'll simulate the response
        
        try {
            const response = await fetch('/api/ai/process-quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt })
            });
            
            const data = await response.json();
            return data.quote;
        } catch (error) {
            // Fallback to local processing
            return this.generateLocalQuote(prompt);
        }
    }

    generateLocalQuote(prompt) {
        // Local fallback quote generation
        return {
            scenario: 'raamvervanging',
            totalPrice: 2500,
            breakdown: {
                materials: 1800,
                labor: 500,
                extras: 200
            },
            timeline: '4-6 weken',
            summary: 'Offerte gegenereerd op basis van uw spraakinput'
        };
    }

    formatQuoteResponse(quote) {
        return {
            success: true,
            quote: quote,
            timestamp: new Date().toISOString(),
            formatted: this.formatForDisplay(quote)
        };
    }

    formatForDisplay(quote) {
        return `
🎯 OFFERTE OVERZICHT

💰 Totaalprijs: €${quote.totalPrice?.toLocaleString() || 'Op aanvraag'}
📅 Levertijd: ${quote.timeline || '4-6 weken'}
📋 Scenario: ${quote.scenario || 'Standaard'}

${quote.summary || 'Offerte gegenereerd op basis van uw aanvraag'}

📞 Voor een definitieve offerte kunt u contact opnemen via:
- Telefoon: +32 (0)477 28 10 28
- Email: info@yannova.nl
        `;
    }

    deliverQuote(formattedQuote) {
        // Send quote to chatbot
        if (window.yannovaChatbot) {
            window.yannovaChatbot.addMessage({
                text: formattedQuote.formatted
            }, 'bot');
        }
        
        // Also trigger quote generator if needed
        if (window.yannovaQuoteGenerator) {
            window.yannovaQuoteGenerator.openModal();
        }
        
        // Track analytics
        if (window.yannovaAnalytics) {
            window.yannovaAnalytics.trackQuoteGeneration({
                scenario: formattedQuote.quote.scenario,
                price: formattedQuote.quote.totalPrice,
                source: 'voice_input'
            });
        }
    }

    handleError(error) {
        const errorMessage = `
❌ Er is een fout opgetreden bij het verwerken van uw aanvraag.

Probeer het opnieuw of neem contact op via:
📞 +32 (0)477 28 10 28
📧 info@yannova.nl
        `;
        
        if (window.yannovaChatbot) {
            window.yannovaChatbot.addMessage({
                text: errorMessage
            }, 'bot');
        }
    }

    // Scenario-specific prompts
    getRaamvervangingPrompt() {
        return `Je bent een expert in ramen en deuren voor woningen. Genereer een professionele offerte voor raamvervanging op basis van de volgende informatie:

KLANTGEGEVENS:
- Naam: [uit transcript halen]
- Type woning: Standaard eengezinswoning
- Locatie: [indien vermeld]

SPECIFICATIES:
- Aantal ramen: [uit transcript]
- Afmetingen per raam: [B x H in cm]
- Type glas: HR++ dubbel glas (U-waarde 1.2)
- Kozijnmateriaal: Kunststof (wit)
- Huidige situatie: Houten kozijnen
- Beglazingstype: Geïsoleerd dubbel glas
- Hang: Draai-kiepraam (standaard)

WERKZAAMHEDEN:
1. Demontage oude ramen inclusief kozijnen
2. Afvoer oud materiaal
3. Voorbereiding metselwerk/stucwerk
4. Plaatsing nieuwe kunststof kozijnen
5. Plaatsing nieuwe ramen met HR++ glas
6. Afkitten en afwerken
7. Opruimen werkplek

PRIJSBEREKENING:
- Kunststof kozijn + HR++ raam (150x120cm): €450-550 per stuk
- Plaatsingskosten per raam: €150-200
- Demontage oude raam: €75-100 per stuk
- Afvoerkosten: €50 (totaal)
- Stucwerk/afwerking: €100-150 per raam
- BTW: 21%

EXTRA INFORMATIE:
- Levertijd: 4-6 weken
- Garantie: 10 jaar op kozijn, 5 jaar op glas
- Certificering: KOMO-keur, CE-markering
- Energielabel: A++ (door HR++ glas)

GENEREER OFFERTE IN JSON FORMAAT.`;
    }

    getGevelrenovatiePrompt() {
        return `COMPLETE GEVELRENOVATIE OFFERTE

PROJECTTYPE: Totaalrenovatie ramen + voordeur rijtjeshuis
URGENTIE: Normaal (4-8 weken levertijd)

RAAM INVENTARISATIE:
Begane grond:
- 3x raam 100x120cm - HR+++ triple glas - Draai-kiepraam - Aluminium antraciet
- Inclusief: Elektrische zonwering buitenzijde (3 stuks)

Verdieping 1:
- 4x raam 80x100cm - HR+++ triple glas - Draai-kiepraam - Aluminium antraciet

Dakramen:
- 2x dakraam 60x80cm - HR+++ triple glas - Elektrisch bedienbaar - Velux/Roto kwaliteit

VOORDEUR:
- Afmetingen: 90x210cm
- Materiaal: Aluminium antraciet met houtnerf structuur
- Type: Veiligheidsdeur RC2 (inbraakwerend)
- Beglazing: Gedeeltelijk mat glas (privacy)
- Hang: Rechtsdraaiend (standaard)
- Slot: 3-punts sluiting met cilinder
- Extra: Deurautomaat + nachtslot

WERKZAAMHEDEN:
1. Opname ter plaatse (verplicht bij totaalproject)
2. Demontage alle oude ramen + voordeur
3. Afvoer oud materiaal en glas (gescheiden)
4. Herstel/aanpassing metselwerk waar nodig
5. Plaatsing nieuwe aluminium kozijnen (15 stuks totaal)
6. Plaatsing nieuwe ramen met HR+++ glas
7. Plaatsing voordeur met beslag
8. Montage zonwering (3 stuks) + elektrische aansluiting
9. Installatie dakramen incl. loodslabben
10. Kitten, stucen en afwerken binnen/buiten
11. Eindschoonmaak

PRIJSOPBOUW:

MATERIALEN:
- Aluminium ramen 100x120cm HR+++ (3x): €750/stuk = €2.250
- Aluminium ramen 80x100cm HR+++ (4x): €550/stuk = €2.200
- Dakramen elektrisch 60x80cm (2x): €950/stuk = €1.900
- Aluminium voordeur RC2 90x210cm: €2.800
- Elektrische zonwering (3x): €450/stuk = €1.350
- Beslag, toebehoren, kitranden: €400

ARBEID:
- Demontage (9 ramen + deur): 1 dag = €600
- Plaatsing ramen: 2 dagen = €1.200
- Plaatsing voordeur: 0.5 dag = €300
- Dakramen plaatsing: 1 dag = €650
- Zonwering montage + elektra: 0.5 dag = €400
- Afwerking stucwerk/schilderwerk: 1 dag = €500

EXTRA KOSTEN:
- Afvoer materiaal: €150
- Steigerkosten (indien nodig): €300
- Metselwerk herstel: €250

SUBTOTAAL: €15.250
BTW 21%: €3.203
TOTAAL: €18.453

KORTINGEN:
- Totaalpakket korting: -€1.500
EINDTOTAAL: €16.953

EXTRA OPTIES:
[ ] Horren bij alle ramen (+€750)
[ ] Smart home integratie zonwering (+€200)
[ ] Glasfolie UV-werend (+€300)
[ ] Slimme deurbel met camera (+€250)

VOORWAARDEN:
- Aanbetaling: 40% bij opdracht
- Betaling: 30% bij levering, 30% na plaatsing
- Levertijd: 6-8 weken na opdracht
- Garantie: 15 jaar op kozijnen, 10 jaar op glas, 5 jaar op zonwering
- Opname: Verplicht voor definitieve offerte
- Keuring: KOMO-gekeurd en CE-gemarkeerd

ENERGIEBESPARING:
- Huidige situatie: HR glas (U-waarde 2.8)
- Nieuwe situatie: HR+++ glas (U-waarde 0.6)
- Besparing: ±€450 per jaar op stookkosten
- Terugverdientijd: ±12 jaar
- CO2 reductie: ±800kg per jaar

GENEREER VOLLEDIGE OFFERTE MET ALLE DETAILS.`;
    }

    getSchuifpuiPrompt() {
        return `SCHUIFPUI OFFERTE - MODERNE WONING

PROJECT TYPE: Schuifpui nieuwbouw/aanbouw
WONINGTYPE: Moderne vrijstaande woning met aanbouw
ORIËNTATIE: Zuidgevel (zonwerend glas vereist)

SPECIFICATIES SCHUIFPUI:
- Totale breedte: 400cm (4000mm)
- Hoogte: 240cm (2400mm)
- Type: 4-delige lift & slide (2 vast, 2 schuifbaar)
- Materiaal: Aluminium thermisch onderbroken
- Kleur: RAL 9005 Zwart (mat afwerking)
- Profiel: Slanke profielen (design lijn)

BEGLAZING:
- Type: HR+++ triple glas met zonwerend coating
- Dikte: 44mm geïsoleerd pakket
- U-waarde: 0.5 W/m²K (triple glas)
- G-waarde: 0.35 (70% zonwering)
- Geluidswerend: 37dB
- Veiligheid: Gelaagd glas binnenste

SCHUIFSYSTEEM:
- Type: Lift & Slide mechanisme (hydraulisch)
- Schuifrichting: Links én rechts schuifbaar
- Drempel: Verlaagde drempel (3mm) - rolstoelvriendelijk
- Vergrendeling: Meerpuntssluiting (6 punten)
- Beslag: RVS kleur zwart

GEÏNTEGREERDE SCREENS:
- Type: Inbouw insectenscreen (plissé)
- Bediening: Elektrisch met afstandsbediening
- Kleur: Zwart mesh (transparant)
- Positie: Boven in kozijn verwerkt

WERKZAAMHEDEN:
1. Inmeten bestaande opening (nauwkeurig ±2mm)
2. Controle draagkracht bovenzijde (±400kg schuifpui)
3. Voorbewerking metselwerk/beton
4. Plaatsing onderdorpel (waterdicht)
5. Montage vast frame + isolatie
6. Plaatsing schuifelementen
7. Afstelling lift & slide mechanisme
8. Montage screens in kozijn
9. Elektrische aansluiting screens (230V)
10. Afkitten binnen/buiten (2-componenten)
11. Instructie bediening en onderhoud

PRIJSOPBOUW:

HOOFDCOMPONENTEN:
- Aluminium schuifpui 4-delig 400x240cm: €8.500
- Zonwerend HR+++ triple glas 9.6m²: €3.200
- Lift & slide mechanisme premium: €1.200
- Verlaagde drempel + waterafvoer: €450
- Geïntegreerde screens elektrisch (2x): €1.400

MONTAGE & AFWERKING:
- Transport en hijswerk (400kg): €350
- Plaatsing door 2 monteurs (2 dagen): €1.600
- Elektrische aansluiting screens: €200
- Afkitten professioneel 2-comp: €300
- Afwerking en eindschoonmaak: €150

VOORBEREIDINGSWERK:
- Extra metselwerk aanpassing: €400
- Isolatie rondom kozijn: €200
- Lateien/staalwerk controle: €150

SUBTOTAAL: €18.100
BTW 9% (nieuwbouw): €1.629
TOTAAL: €19.729

EXTRA OPTIES:
[ ] Smart Home integratie (Somfy): €350
[ ] Additionele buitenzonwering elektrisch: €2.800
[ ] Anti-inbraakbeslag RC3: €650
[ ] Extra glas coating (zelfreinigend): €400

TECHNISCHE SPECIFICATIES:
- Inbraakwerendheid: RC2 (standaard)
- Windbelasting: Klasse 4 (tot 140 km/u)
- Waterdichtheid: Klasse 9A (hoogste)
- Luchtdoorlatendheid: Klasse 4
- Certificering: KOMO, CE, SKH
- Garantie: 15 jaar op profielen, 10 jaar op mechanisme

PLANNING:
- Productietijd: 8-10 weken
- Plaatsing: 2 werkdagen
- Best season: Voorjaar/zomer (droog weer vereist)
- Oplevering: Inclusief afleverprotocol

ONDERHOUD:
- Smerenl mechanisme: 1x per jaar
- Reinigen rails: 2x per jaar
- Controle kit/afdichting: 1x per 2 jaar
- Onderhoudscontract optioneel: €150/jaar

ENERGIEPRESTATIE:
- U-waarde totaal kozijn: 0.8 W/m²K
- G-waarde zonwerend: 0.35 (65% warmte tegen)
- Energielabel contribution: A+++
- Gemiddelde besparing: €200/jaar vs standaard glas

GENEREER COMPLETE OFFERTE MET TECHNISCHE TEKENINGEN EN 3D VISUALISATIE.`;
    }

    getDakramenPrompt() {
        return `DAKKAPEL RAMEN OFFERTE

PROJECT: Ramen plaatsing in bestaande dakkapel
WONINGTYPE: Eengezinswoning met dakkapel
LOCATIE: Dakkapel achterzijde (aanname)

SITUATIE:
- Dakkapel: Bestaand, afgemeten
- Breedte dakkapel: 350cm totaal
- Hoogte opening: Standaard ±120-140cm (nader op te meten)
- Huidige staat: Kaal/niet afgewerkt binnenwerk

RAAM CONFIGURATIE:
- Aantal ramen: 3 stuks (naast elkaar)
- Verdeling: Gelijke maat per raam
- Berekende maat per raam: ±110 x 120cm (onder voorbehoud inmeten)
- Type: Draai-kiepraam (standaard woning)
- Opening: Naar binnen draaiend
- Ventilatie: Kiepraam functie voor ventilatie

MATERIAAL & GLAS:
- Kozijnmateriaal: Kunststof 5-kamer profiel
- Kleur: Wit (RAL 9016)
- Beglazing: HR++ dubbel glas (U-waarde 1.2)
- Glassoort: Gelaagd veiligheidsglas (dakkapel vereist)
- Geluidswerend: 30dB (standaard)

EXTRA WENSEN:
- Gordijnrails: Inbouw rails in bovenkozijn (3x)
- Type rails: Aluminium 2-baans systeem
- Kleur rails: Wit (passend bij kozijn)

WERKZAAMHEDEN TOTAAL:
1. Opname ter plaatse (verplicht bij dakkapel)
2. Maatwerk inmeten (nauwkeurig per mm)
3. Voorbereiding dakkapel binnenzijde
4. Aanpassing/afwerking metselwerk
5. Plaatsing 3 kunststof kozijnen
6. Plaatsing 3 draaikiepramen met HR++ glas
7. Montage gordijnrails in kozijn (3x)
8. Afkitten en afdichten binnen/buiten
9. Schilderwerk binnenzijde (indien gewenst)
10. Stucwerk/gipsplaat afwerking rondom
11. Eindcontrole en oplevering

PRIJSOPBOUW DETAIL:

MATERIAALKOSTEN:
- Kunststof kozijn + draaikiepraam 110x120cm HR++ (3x): €500/stuk = €1.500
- Veiligheidsglas upgrade (dakkapel eis): €150
- Inbouw gordijnrails aluminium 2-baans (3x): €80/stuk = €240
- Toebehoren (scharnieren, grepen, etc.): €120
- Kit- en afdichtmateriaal: €60

ARBEIDSKOSTEN:
- Opname/inmeten dakkapel: €100
- Plaatsing 3 ramen door 2 monteurs: €900 (1 dag)
- Montage gordijnrails: €150
- Binnenwerkafwerking (stuken): €400
- Afkitten professioneel: €200

BIJKOMENDE KOSTEN:
- Steigerwerk/ladderstelling: €200
- Afvoer verpakkingsmateriaal: €40
- Reiskosten (standaard): €50

SUBTOTAAL: €4.110
BTW 21%: €863
TOTAAL: €4.973

OPTIONELE TOEVOEGINGEN:
[ ] Binnenschilderwerk kozijnen: €350
[ ] Elektrische zonwering (3x): €1.200
[ ] Ventilatieroosters geluiddempend: €180
[ ] Horren (3x): €300

GARANTIE & SERVICE:
- Kozijn en beglazing: 10 jaar
- Montage/plaatsing: 5 jaar
- Gordijnrails: 2 jaar
- Jaarlijkse controle: Aanbevolen

PLANNING:
- Opmeting: Binnen 1 week na akkoord
- Levertijd: 4-6 weken na inmeten
- Plaatsing: 1 werkdag
- Weer afhankelijk: Ja (droog weer nodig)

VOORWAARDEN:
- Definitieve prijs na opmeting (maatwerk)
- Aanbetaling: 40% bij opdracht
- Restbetaling: Na oplevering
- Geldig: 30 dagen

VENTILATIE ADVIES:
- Dakkapel vaak warmer (oplopende warmte)
- Kiepramen zorgen voor goede ventilatie
- Advies: Regelmatig ventileren via kiepraam
- Overweeg: Mechanische ventilatie in dakkapel

LET OP - DAKKAPEL SPECIFIEK:
⚠️ Opmeting is verplicht (geen standaardmaten)
⚠️ Veiligheidsglas is voorgeschreven
⚠️ Extra aandacht voor waterdichtheid bovenzijde
⚠️ Steigerwerk mogelijk nodig (afhankelijk hoogte)

GENEREER OFFERTE + INCLUSIEF OPMETING AFSPRAAK VOORSTEL.`;
    }

    getNieuwbouwPrompt() {
        return `COMPLETE NIEUWBOUW PAKKET - VRIJSTAANDE VILLA

PROJECT TYPE: Totaallevering ramen + deuren nieuwbouw
WONINGTYPE: Vrijstaande villa moderne architectuur
WOONOPPERVLAK: ±180m²
BOUWNUMMER: [in te vullen]

TOTALE INVENTARIS:
━━━━━━━━━━━━━━━━━━━━━━━━━

📐 RAMEN (20 stuks totaal):

BEGANE GROND (8 ramen):
- Woonkamer: 3x raam 150x200cm (draaikiepraam)
- Keuken: 2x raam 100x120cm (kiepraam)
- Bijkeuken: 1x raam 80x80cm (vast glas)
- Toilet: 1x raam 60x60cm (matglas, kiepraam)
- Hal: 1x raam 60x150cm (vast glas, matglas)

VERDIEPING (12 ramen):
- Master bedroom: 2x raam 120x150cm (draaikiepraam)
- Slaapkamer 2: 2x raam 100x120cm (draaikiepraam)
- Slaapkamer 3: 2x raam 100x120cm (draaikiepraam)
- Slaapkamer 4: 2x raam 80x120cm (draaikiepraam)
- Badkamer: 2x raam 80x80cm (matglas, kiepraam)
- Overloop: 2x raam 60x120cm (vast glas)

🚪 DEUREN (3 stuks totaal):

VOORDEUR:
- Afmeting: 100x230cm
- Type: Veiligheidsdeur RC3 (inbraakwerend)
- Materiaal: Aluminium + geïsoleerde kern
- Kleur: RAL 7016 antraciet grijs
- Beglazing: Gedeeltelijk mat glas design
- Beslag: RVS zwart (greep + rozet)
- Slot: 5-punts cilinder SKG***
- Extra: Video deurbel Ring/Nest (bekabeld)
- Extra: LED verlichting geïntegreerd
- Extra: Electronisch slot (optioneel)

ACHTERDEUR:
- Afmeting: 90x220cm  
- Type: Tuindeuren buitendraaiend
- Materiaal: Aluminium + isolatie
- Kleur: RAL 7016 antraciet grijs
- Beglazing: Volledig glas HR+++
- Beslag: RVS zwart
- Slot: 3-punts sluiting

SCHUIFPUI:
- Afmeting: 300x240cm (3-delig)
- Type: Lift & Slide schuifsysteem
- Materiaal: Aluminium smal profiel
- Kleur: RAL 7016 antraciet grijs
- Beglazing: HR+++ triple glas zonwerend
- Drempel: Verlaagd (5mm max)

🛡️ SPECIFICATIES ALGEMEEN:

KOZIJNMATERIAAL:
- Type: Aluminium thermisch onderbroken
- Profiel: 70mm diepte (premium isolatie)
- Kleur: RAL 7016 antraciet grijs mat
- Afwerking: Poedercoating UV-bestendig
- Kwaliteit: Klasse 1 (hoogste kwaliteit)

BEGLAZING ALLE RAMEN:
- Standaard: HR+++ triple glas
- U-waarde: 0.5 W/m²K (excellent)
- Dikte: 40mm isolatiepakket
- Coating: Low-E (warmtereflecterend)
- Afstandhouder: Warm-edge kunststof
- Geluidswerend: 35dB gemiddeld

INBRAAKWERENDHEID:
- Classificatie: RC2 standaard, RC3 deuren
- Hang- en sluitwerk: SKG** gecertificeerd
- Veiligheidsglas: Gelaagd P4A binnenste  
- Slot cilinders: SKG*** (3 sterren)
- Beslag: Anti-uitlift scharnieren

🔌 ELEKTRISCHE OPTIES:

ZONWERING/SCREENS (8 stuks):
- Locatie: Alle grote ramen begane grond
- Type: Inbouw screens elektrisch
- Bediening: Somfy motor + RTS
- Doek: Zwart transparant 5% (zonwerend + zicht)
- Integratie: Smart home ready (Somfy TaHoma)

VIDEO DEURBEL:
- Type: Ring Video Doorbell Pro 2
- Features: 1536p video, 150° viewing angle
- Bekabeling: Bedrade versie (24V)
- Chime: Inclusief binnen

━━━━━━━━━━━━━━━━━━━━━━━━━

💰 PRIJSOPBOUW VOLLEDIG PROJECT:

MATERIAALKOSTEN:

Ramen:
- 8x grote ramen (>2m²): €850/stuk = €6.800
- 12x standaard ramen: €650/stuk = €7.800
- Subtotaal ramen: €14.600

Deuren:
- Voordeur RC3 + extra's: €4.500
- Achterdeur: €2.200
- Schuifpui 3-delig: €7.500
- Subtotaal deuren: €14.200

Zonwering:
- 8x elektrische screens Somfy: €550/stuk = €4.400

Extra:
- Video deurbel systeem: €350
- Smart home gateway: €200
- Toebehoren/beslag totaal: €800

TOTAAL MATERIAAL: €34.550

ARBEIDSKOSTEN:

Installatie:
- Plaatsing 20 ramen (4 dagen, 2 monteurs): €3.200
- Plaatsing 3 deuren (1.5 dag): €1.200
- Afstelling schuifpui: €400
- Montage 8 screens + elektra: €1.600
- Installatie deurbel + bekabeling: €300
- Afkitten professioneel (totaal): €1.200

Planning & Coördinatie:
- Projectleiding (opnames, afstemming): €800
- Nazorg en service (2x controle): €300

TOTAAL ARBEID: €9.000

BIJKOMEND:

- Transport (20 ramen + 3 deuren): €600
- Steigerwerk/hijswerk: €800
- Afvoer verpakkingsmateriaal: €150
- Verzekering transport: €100

TOTAAL BIJKOMEND: €1.650

━━━━━━━━━━━━━━━━━━━━━━━━━

SUBTOTAAL PROJECT: €45.200
BTW 9% (nieuwbouw): €4.068
TOTAAL INCLUSIEF: €49.268

NIEUWBOUW PAKKET KORTING: -€3.500
━━━━━━━━━━━━━━━━━━━━━━━━━
EINDPRIJS: €45.768

EXTRA OPTIES (niet inbegrepen):

[ ] Buitenzonwering elektrisch (8x): €5.600
[ ] Upgrade naar RC3 alle ramen: €2.400
[ ] Zelfreinigend glas coating: €1.200
[ ] Extra ventilatieroosters CO2-gestuurd: €800
[ ] Uitgebreid smart home pakket: €1.500
[ ] Fingerprint toegang voordeur: €650

━━━━━━━━━━━━━━━━━━━━━━━━━

📋 PLANNING & LEVERTIJD:

FASE 1: Offerte & Definitieve Tekeningen (2 weken)
- Bouwtekeningen analyseren
- Definitieve maatvoering bevestigen
- Kleurstalen opvragen
- Contract ondertekenen

FASE 2: Productie (10-12 weken)
- Kozijnen productie: 8 weken
- Deuren productie: 10 weken
- Beglazing: 3 weken
- Screens: 4 weken

FASE 3: Levering & Montage (2 weken)
- Week 1: Levering + montage ramen
- Week 2: Montage deuren + screens
- Eindoplevering + instructie

TOTALE DOORLOOPTIJD: 14-16 weken vanaf opdracht

━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 ENERGIEPRESTATIE:

Huidige EPC-waarde (zonder ramen): ~0.8
Met dit pakket: ~0.4 (Nul-op-de-meter-ready)

JAARLIJKSE ENERGIEBESPARING:
- Verwarming: €800/jaar
- Koeling (zomers): €200/jaar
- Totaal: €1.000/jaar vs standaard glas

CO2 REDUCTIE: 1.500kg per jaar

SUBSIDIES (controleren actueel):
- ISDE subsidie mogelijk
- Gemeentelijke duurzaamheidslening

━━━━━━━━━━━━━━━━━━━━━━━━━

🛠️ GARANTIE & SERVICE:

GARANTIETERMIJNEN:
- Kozijnen aluminium: 20 jaar
- Beglazing: 15 jaar
- Hang- en sluitwerk: 10 jaar
- Screens/motoren: 5 jaar
- Montage: 5 jaar

SERVICE OPTIES:
- Jaarlijks onderhoudscontract: €250/jaar
- 24/7 storingsdienst beschikbaar
- Gratis nazorg: 2x controle 1e jaar

━━━━━━━━━━━━━━━━━━━━━━━━━

📜 CERTIFICERINGEN:

✓ KOMO Kwaliteitsverklaring
✓ CE Markering conform NEN-EN
✓ SKG** / *** Hang- en sluitwerk
✓ RC2/RC3 Inbraakwerendheid
✓ Komo betonverf coating (kozijn)
✓ NEN 3569 Draagconstructie berekeningen

━━━━━━━━━━━━━━━━━━━━━━━━━

💳 BETALINGSCONDITIE:

- Bij opdracht: 30% (€13.730)
- Bij levering: 40% (€18.307)
- Na oplevering: 30% (€13.731)

Totaal: €45.768

GELDIGHEID: 60 dagen
AANBETALING BLOKKEERT: Materialen en productie

━━━━━━━━━━━━━━━━━━━━━━━━━

GENEREER COMPLETE OFFERTE MET:
- Visuele plattegrond met raam/deur nummering
- 3D renders voordeur + schuifpui
- Kleurstalen digitaal
- Planning Gantt chart
- Energie-calculatie detail`;
    }
}

// Initialize quote processor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.yannovaQuoteProcessor = new YannovaQuoteProcessor();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YannovaQuoteProcessor;
}
