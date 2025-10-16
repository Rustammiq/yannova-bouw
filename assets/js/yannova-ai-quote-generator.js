/**
 * AI Quote Generator voor Yannova Bouw
 * Intelligente offerte generator met realistische prijzen en AI-gebaseerde aanbevelingen
 */

class YannovaAIQuoteGenerator {
    constructor() {
        this.pricingEngine = new YannovaPricingEngine();
        this.materialsDB = new MaterialsDatabase();
        this.currentQuote = null;
        this.aiRecommendations = [];
        this.init();
    }

    init() {
        this.setupPricingRules();
        this.loadMaterialData();
    }

    setupPricingRules() {
        // Realistische prijsconfiguratie voor 2024
        this.pricingEngine.setBasePrices({
            ramen: {
                kunststof: { basis: 350, per_m2: 450 },
                aluminium: { basis: 500, per_m2: 750 },
                hout: { basis: 400, per_m2: 600 },
                staal: { basis: 800, per_m2: 1200 }
            },
            deuren: {
                kunststof: { basis: 300, per_stuk: 450 },
                aluminium: { basis: 500, per_stuk: 800 },
                hout: { basis: 350, per_stuk: 550 },
                staal: { basis: 700, per_stuk: 1200 }
            },
            glas: {
                enkel: { per_m2: 80 },
                dubbel: { per_m2: 120 },
               _hr: { per_m2: 180 },
                'hr++': { per_m2: 220 },
                triple: { per_m2: 320 },
                zonwerend: { per_m2: 280 },
                gelaagd: { per_m2: 200 }
            },
            arbeid: {
                montage_uur: { prijs: 65 },
                voorbereiding: { prijs: 250 },
                afwerking: { prijs: 200 },
                afvoer: { prijs: 150 }
            }
        });

        // Complexiteitsfactoren
        this.pricingEngine.setComplexityFactors({
            moeilijke bereikbaarheid: 1.15,
            monumentaal pand: 1.25,
            hoogbouw: 1.10,
            speciale afmetingen: 1.20,
            dubbelzijdig werken: 1.10
        });

        // Korting structuren
        this.pricingEngine.setDiscountRules({
            volume: [
                { min: 5000, korting: 0.02 },
                { min: 10000, korting: 0.05 },
                { min: 15000, korting: 0.08 },
                { min: 25000, korting: 0.12 }
            ],
            seizoen: [
                { maanden: [1, 2, 11, 12], korting: 0.05 }, // Winterkorting
                { maanden: [6, 7, 8], korting: 0.03 } // Zomer korting
            ],
            nieuwklant: { korting: 0.05 },
            aanbeveling: { korting: 0.03 }
        });
    }

    loadMaterialData() {
        this.materialsDB.addMaterials({
            kunststof: {
                merken: ['Schüco', 'Reynaers', 'Kömmerling', 'VEKA'],
                kleuren: ['wit', 'crème', 'grijs', 'antraciet', 'zwart', 'houtlook'],
                profielen: ['standaard', 'versterkt', 'passiefhuis'],
                isolatiewaarden: { standaard: 1.3, versterkt: 1.1, passiefhuis: 0.8 },
                levensduur: '50+ jaar',
                onderhoud: 'minimaal'
            },
            aluminium: {
                merken: ['Schüco', 'Reynaers', 'Aluprof', 'Jansen'],
                kleuren: ['wit', 'zwart', 'grijs', 'antraciet', 'brons', 'RAL kleuren'],
                profielen: ['standaard', 'thermisch onderbroken', 'slim'],
                isolatiewaarden: { standaard: 2.1, thermisch: 1.4, slim: 1.2 },
                levensduur: '40+ jaar',
                onderhoud: 'periodiek'
            },
            hout: {
                merken: ['Houtfabriek', 'Skypoint', 'Liberon'],
                houtsoorten: ['grenen', 'lariks', 'eiken', 'meranti', 'hardhout'],
                afwerking: ['onbehandeld', 'gelakt', 'geolied', 'verduurzaamd'],
                isolatiewaarden: { grenen: 2.2, lariks: 1.9, eiken: 1.6, meranti: 1.8 },
                levensduur: '30-50 jaar',
                onderhoud: 'jaarlijks'
            }
        });
    }

    async generateQuote(requirements) {
        try {
            // Analyseer requirements
            const analysis = this.analyzeRequirements(requirements);
            
            // Genereer AI aanbevelingen
            this.aiRecommendations = await this.generateAIRecommendations(analysis);
            
            // Bereken prijzen
            const pricing = await this.calculatePricing(analysis);
            
            // Maak offerte object
            const quote = {
                id: this.generateQuoteId(),
                klant: requirements.klant,
                analyse: analysis,
                aanbevelingen: this.aiRecommendations,
                prijzen: pricing,
                specificaties: this.generateSpecificaties(analysis),
                voorwaarden: this.generateVoorwaarden(analysis),
                timestamp: new Date().toISOString(),
                geldigTot: this.calculateGeldigheid()
            };

            this.currentQuote = quote;
            return quote;

        } catch (error) {
            console.error('Quote generation error:', error);
            throw new Error('Offerte generatie mislukt');
        }
    }

    analyzeRequirements(requirements) {
        const analysis = {
            project: {
                type: requirements.projectType || 'vervanging',
                omvang: this.calculateOmvang(requirements),
                complexiteit: this.assessComplexity(requirements),
                prioriteit: this.assessPriority(requirements)
            },
            ramen: this.analyzeRamen(requirements.ramen || []),
            deuren: this.analyzeDeuren(requirements.deuren || []),
            locatie: {
                type: requirements.locatieType || 'woning',
                bouwjaar: requirements.bouwjaar,
                verdiepingen: requirements.verdiepingen || 1,
                bereikbaarheid: requirements.bereikbaarheid || 'normaal'
            },
            energie: {
                huidig_isolatieniveau: requirements.huidigIsolatie || 'slecht',
                gewenst_niveau: requirements.gewenstIsolatie || 'goed',
                subsidie_mogelijk: this.checkSubsidieMogelijkheid(requirements)
            }
        };

        return analysis;
    }

    calculateOmvang(requirements) {
        let totaalM2 = 0;
        let totaalStuk = 0;

        // Ramen
        if (requirements.ramen) {
            requirements.ramen.forEach(raam => {
                if (raam.afmetingen) {
                    totaalM2 += (raam.afmetingen.breedte * raam.afmetingen.hoogte) / 10000; // cm² naar m²
                }
                totaalStuk += raam.aantal || 1;
            });
        }

        // Deuren
        if (requirements.deuren) {
            requirements.deuren.forEach(deur => {
                totaalStuk += deur.aantal || 1;
            });
        }

        return {
            totaalM2: Math.round(totaalM2 * 100) / 100,
            totaalStuk,
            categorie: this.categorizeOmvang(totaalM2, totaalStuk)
        };
    }

    categorizeOmvang(m2, stuk) {
        if (m2 < 10 || stuk < 5) return 'klein';
        if (m2 < 30 || stuk < 15) return 'gemiddeld';
        if (m2 < 60 || stuk < 30) return 'groot';
        return 'zeer groot';
    }

    assessComplexity(requirements) {
        let complexityScore = 1;
        const factors = [];

        // Bereikbaarheid
        if (requirements.bereikbaarheid === 'moeilijk') {
            complexityScore += 0.15;
            factors.push('Moeilijke bereikbaarheid');
        }

        // Type pand
        if (requirements.locatieType === 'monument') {
            complexityScore += 0.25;
            factors.push('Monumentaal pand');
        }

        // Hoogbouw
        if (requirements.verdiepingen > 3) {
            complexityScore += 0.10;
            factors.push('Hoogbouw');
        }

        // Speciale afmetingen
        const specialeAfmetingen = this.checkSpecialeAfmetingen(requirements);
        if (specialeAfmetingen.length > 0) {
            complexityScore += 0.20;
            factors.push('Speciale afmetingen');
        }

        return {
            score: Math.round(complexityScore * 100) / 100,
            factoren: factors,
            niveau: this.getComplexityNiveau(complexityScore)
        };
    }

    getComplexityNiveau(score) {
        if (score <= 1.0) return 'eenvoudig';
        if (score <= 1.15) return 'normaal';
        if (score <= 1.25) return 'complex';
        return 'zeer complex';
    }

    assessPriority(requirements) {
        if (requirements.spoed) return 'hoog';
        if (requirements.deadline) {
            const dagen = Math.ceil((new Date(requirements.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            if (dagen < 14) return 'hoog';
            if (dagen < 30) return 'gemiddeld';
        }
        return 'normaal';
    }

    analyzeRamen(ramen) {
        return ramen.map(raam => ({
            ...raam,
            oppervlakte: raam.afmetingen ? 
                (raam.afmetingen.breedte * raam.afmetingen.hoogte) / 10000 : 0,
            gewicht: this.calculateGewicht(raam),
            isolatiewaarde: this.getBerekendeIsolatiewaarde(raam),
            complexiteit: this.assessRaamComplexiteit(raam)
        }));
    }

    analyzeDeuren(deuren) {
        return deuren.map(deur => ({
            ...deur,
            gewicht: this.calculateDeurGewicht(deur),
            isolatiewaarde: this.getDeurIsolatiewaarde(deur),
            veiligheid: this.assessVeiligheid(deur),
            complexiteit: this.assessDeurComplexiteit(deur)
        }));
    }

    async generateAIRecommendations(analysis) {
        const recommendations = [];

        // Energiebesparing aanbevelingen
        if (analysis.energie.huidig_isolatieniveau === 'slecht') {
            recommendations.push({
                type: 'energie',
                titel: 'HR++ Triple Glas Aanbevolen',
                beschrijving: 'Met uw huidige isolatieniveau is triple glas de beste investering. U bespaart tot 40% op energiekosten.',
                besparing: '€400-800 per jaar',
                meerprijs: '+15%',
                terugverdientijd: '5-7 jaar'
            });
        }

        // Materiaal aanbevelingen
        const materiaalAdvies = this.getMateriaalAdvies(analysis);
        recommendations.push(materiaalAdvies);

        // Onderhoud aanbevelingen
        const onderhoudAdvies = this.getOnderhoudAdvies(analysis);
        recommendations.push(onderhoudAdvies);

        // Subsidie aanbevelingen
        if (analysis.energie.subsidie_mogelijk) {
            recommendations.push({
                type: 'subsidie',
                titel: 'ISDE Subsidie Mogelijk',
                beschrijving: 'U komt in aanmerking voor de Investeringssubsidie Duurzame Energie. Wij helpen u met de aanvraag.',
                bedrag: '€150-500 per m²',
                voorwaarden: 'Minimaal HR++ glas, 2 jaar geldig'
            });
        }

        return recommendations;
    }

    getMateriaalAdvies(analysis) {
        const locatie = analysis.locatie.type;
        const complexiteit = analysis.project.complexiteit.niveau;

        if (locatie === 'kantoor' || locatie === 'commercial') {
            return {
                type: 'materiaal',
                titel: 'Aluminium Aanbevolen',
                beschrijving: 'Voor commercieel gebruik is aluminium de beste keuze: duurzaam, modern en onderhoudsarm.',
                voordelen: ['Lange levensduur', 'Professionele uitstraling', 'Onderhoudsarm'],
                meerprijs: '+20% t.o.v. kunststof'
            };
        }

        if (complexiteit === 'zeer complex') {
            return {
                type: 'materiaal',
                titel: 'Kunststof Versterkt Aanbevolen',
                beschrijving: 'Bij complexe projecten biedt versterkt kunststof de beste prijs-kwaliteitverhouding.',
                voordelen: ['Goede isolatie', 'Makkelijk bewerkbaar', 'Lange garantie'],
                meerprijs: '+10% t.o.v. standaard kunststof'
            };
        }

        return {
            type: 'materiaal',
            titel: 'Kunststof Standaard Aanbevolen',
            beschrijving: 'Voor de meeste projecten is standaard kunststof de beste keuze: uitstekende prijs-kwaliteitverhouding.',
            voordelen: ['Beste prijs', 'Goede isolatie', 'Onderhoudsarm'],
            meerprijs: 'Standaard optie'
        };
    }

    getOnderhoudAdvies(analysis) {
        return {
            type: 'onderhoud',
            titel: 'Onderhoudscontract Aanbevolen',
            beschrijving: 'Met een onderhoudscontract verlengt u de levensduur en behoudt u 10 jaar garantie.',
            kosten: '€75-150 per jaar',
            voordelen: ['10 jaar garantie behouden', 'Jaarlijkse inspectie', 'Voorrang bij calamiteiten'],
            besparing: 'Voorkomt dure reparaties'
        };
    }

    async calculatePricing(analysis) {
        const pricing = {
            materialen: await this.calculateMaterialPrijzen(analysis),
            arbeid: await this.calculateArbeidsPrijzen(analysis),
            bijkomend: await this.calculateBijkomendeKosten(analysis),
            totalen: {}
        };

        // Bereken subtotalen
        pricing.totalen.materiaal = pricing.materialen.reduce((sum, item) => sum + item.totaal, 0);
        pricing.totalen.arbeid = pricing.arbeid.reduce((sum, item) => sum + item.totaal, 0);
        pricing.totalen.bijkomend = pricing.bijkomend.reduce((sum, item) => sum + item.bedrag, 0);

        // Bereken totaal
        pricing.totalen.excl_btw = pricing.totalen.materiaal + pricing.totalen.arbeid + pricing.totalen.bijkomend;
        pricing.totalen.btw = pricing.totalen.excl_btw * 0.21;
        pricing.totalen.incl_btw = pricing.totalen.excl_btw + pricing.totalen.btw;

        // Pas kortingen toe
        pricing.kortingen = this.calculateKortingen(pricing.totalen.excl_btw, analysis);
        pricing.totalen.korting = pricing.kortingen.reduce((sum, korting) => sum + korting.bedrag, 0);

        // Finale totaal
        pricing.totalen.finale_totaal = pricing.totalen.excl_btw - pricing.totalen.korting;
        pricing.totalen.finale_btw = pricing.totalen.finale_totaal * 0.21;
        pricing.totalen.finale_incl = pricing.totalen.finale_totaal + pricing.totalen.finale_btw;

        return pricing;
    }

    async calculateMaterialPrijzen(analysis) {
        const prijzen = [];

        // Ramen prijzen
        analysis.ramen.forEach((raam, index) => {
            const basisPrijs = this.pricingEngine.getRaamPrijs(raam);
            const complexiteitFactor = analysis.project.complexiteit.score;

            prijzen.push({
                type: 'raam',
                omschrijving: `Raam ${index + 1} - ${raam.materiaal} ${raam.glas}`,
                hoeveelheid: raam.aantal || 1,
                eenheidsprijs: basisPrijs * complexiteitFactor,
                totaal: basisPrijs * complexiteitFactor * (raam.aantal || 1),
                specificaties: {
                    afmetingen: raam.afmetingen,
                    materiaal: raam.materiaal,
                    glas: raam.glas
                }
            });
        });

        // Deuren prijzen
        analysis.deuren.forEach((deur, index) => {
            const basisPrijs = this.pricingEngine.getDeurPrijs(deur);
            const complexiteitFactor = analysis.project.complexiteit.score;

            prijzen.push({
                type: 'deur',
                omschrijving: `Deur ${index + 1} - ${deur.materiaal} ${deur.type}`,
                hoeveelheid: deur.aantal || 1,
                eenheidsprijs: basisPrijs * complexiteitFactor,
                totaal: basisPrijs * complexiteitFactor * (deur.aantal || 1),
                specificaties: {
                    afmetingen: deur.afmetingen,
                    materiaal: deur.materiaal,
                    type: deur.type
                }
            });
        });

        return prijzen;
    }

    async calculateArbeidsPrijzen(analysis) {
        const arbeid = [];

        // Montage kosten
        const totaalUren = this.calculateMontageUren(analysis);
        arbeid.push({
            type: 'montage',
            omschrijving: 'Montage ramen en deuren',
            uren: totaalUren,
            uurtarief: this.pricingEngine.getArbeidsPrijs('montage_uur'),
            totaal: totaalUren * this.pricingEngine.getArbeidsPrijs('montage_uur')
        });

        // Voorbereiding
        arbeid.push({
            type: 'voorbereiding',
            omschrijving: 'Voorbereiding en afplanken',
            eenheidsprijs: this.pricingEngine.getArbeidsPrijs('voorbereiding'),
            totaal: this.pricingEngine.getArbeidsPrijs('voorbereiding')
        });

        // Afwerking
        arbeid.push({
            type: 'afwerking',
            omschrijving: 'Afwerken kozijnen en kitten',
            eenheidsprijs: this.pricingEngine.getArbeidsPrijs('afwerking'),
            totaal: this.pricingEngine.getArbeidsPrijs('afwerking')
        });

        // Afvoer
        arbeid.push({
            type: 'afvoer',
            omschrijving: 'Afvoer oude materialen',
            eenheidsprijs: this.pricingEngine.getArbeidsPrijs('afvoer'),
            totaal: this.pricingEngine.getArbeidsPrijs('afvoer')
        });

        return arbeid;
    }

    calculateMontageUren(analysis) {
        let uren = 0;

        // Ramen montage tijd
        analysis.ramen.forEach(raam => {
            const basisUren = 2; // 2 uur per raam
            const complexiteitFactor = raam.complexiteit?.score || 1;
            uren += basisUren * complexiteitFactor * (raam.aantal || 1);
        });

        // Deuren montage tijd
        analysis.deuren.forEach(deur => {
            const basisUren = 3; // 3 uur per deur
            const complexiteitFactor = deur.complexiteit?.score || 1;
            uren += basisUren * complexiteitFactor * (deur.aantal || 1);
        });

        return Math.round(uren * 100) / 100;
    }

    async calculateBijkomendeKosten(analysis) {
        const kosten = [];

        // Voorrijkosten
        kosten.push({
            type: 'voorr',
            omschrijving: 'Voorrijkosten',
            bedrag: analysis.locatie.verdiepingen > 1 ? 150 : 75
        });

        // Materialen huur
        if (analysis.project.complexiteit.niveau === 'zeer complex') {
            kosten.push({
                type: 'materiaal_huur',
                omschrijving: 'Speciaal materieel (steiger, lift etc.)',
                bedrag: 500
            });
        }

        // Vergunningen
        if (analysis.locatie.type === 'monument') {
            kosten.push({
                type: 'vergunning',
                omschrijving: 'Monumentenvergunning aanvraag',
                bedrag: 350
            });
        }

        return kosten;
    }

    calculateKortingen(totaal, analysis) {
        const kortingen = [];

        // Volume korting
        const volumeKorting = this.pricingEngine.getVolumeKorting(totaal);
        if (volumeKorting > 0) {
            kortingen.push({
                type: 'volume',
                omschrijving: 'Volume korting',
                percentage: volumeKorting * 100,
                bedrag: totaal * volumeKorting
            });
        }

        // Seizoen korting
        const seizoenKorting = this.pricingEngine.getSeizoenKorting();
        if (seizoenKorting > 0) {
            kortingen.push({
                type: 'seizoen',
                omschrijving: 'Seizoenskorting',
                percentage: seizoenKorting * 100,
                bedrag: totaal * seizoenKorting
            });
        }

        return kortingen;
    }

    generateSpecificaties(analysis) {
        return {
            project: {
                type: analysis.project.type,
                omvang: analysis.project.omvang,
                duur: this.schatDuur(analysis),
                startdatum: this.suggestStartdatum(analysis)
            },
            garantie: {
                materiaal: '10 jaar',
                montage: '10 jaar',
                verlenging: 'Mogelijk tot 15 jaar'
            },
            voorwaarden: {
                aanbetaling: '30%',
                oplevering: 'Restantbetaling',
                garantie: '10 jaar',
                service: '24/7 calamiteitendienst'
            }
        };
    }

    generateVoorwaarden(analysis) {
        return {
            algemeen: [
                'Offerte is vrijblijvend en 30 dagen geldig',
                'Prijzen zijn inclusief 21% BTW',
                'Wijzigingen in specificaties kunnen de prijs beïnvloeden',
                'Aanbetaling van 30% vereist bij opdrachtverstrekking'
            ],
            uitvoering: [
                'Montage door gecertificeerde vakmensen',
                'Werkzaamheden worden netjes uitgevoerd',
                'Oude materialen worden professioneel afgevoerd',
                'Locatie wordt schoon en opgeleverd achtergelaten'
            ],
            garantie: [
                '10 jaar garantie op materiaal en montage',
                'Garantiecertificaat wordt verstrekt',
                '24/7 servicedienst voor calamiteiten',
                'Jaarlijkse onderhoudsbeurt beschikbaar'
            ]
        };
    }

    // Helper methods
    generateQuoteId() {
        return 'YAN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    calculateGeldigheid() {
        const datum = new Date();
        datum.setDate(datum.getDate() + 30);
        return datum.toISOString();
    }

    schatDuur(analysis) {
        const basisDagen = 7; // Basis projectduur
        const complexiteitFactor = analysis.project.complexiteit.score;
        const omvangFactor = Math.log(analysis.project.omvang.totaalStuk + 1) / Math.log(10);
        
        return Math.round(basisDagen * complexiteitFactor * omvangFactor);
    }

    suggestStartdatum(analysis) {
        const datum = new Date();
        if (analysis.project.prioriteit === 'hoog') {
            datum.setDate(datum.getDate() + 7);
        } else {
            datum.setDate(datum.getDate() + 21);
        }
        return datum.toISOString();
    }

    checkSubsidieMogelijkheid(requirements) {
        // Simpele check - in werkelijkheid complexere logica
        return requirements.gewenstIsolatie === 'zeer goed' || 
               requirements.gewenstIsolatie === 'excellent';
    }

    checkSpecialeAfmetingen(requirements) {
        const speciale = [];
        
        if (requirements.ramen) {
            requirements.ramen.forEach(raam => {
                if (raam.afmetingen) {
                    if (raam.afmetingen.breedte > 200 || raam.afmetingen.hoogte > 250) {
                        speciale.push('Groot formaat raam');
                    }
                }
            });
        }
        
        return speciale;
    }

    calculateGewicht(raam) {
        // Geschat gewicht in kg
        const gewichtPerM2 = {
            kunststof: 15,
            aluminium: 20,
            hout: 25,
            staal: 40
        };
        
        const oppervlakte = raam.oppervlakte || 0;
        const basisGewicht = gewichtPerM2[raam.materiaal] || 20;
        
        return Math.round(oppervlakte * basisGewicht);
    }

    getBerekendeIsolatiewaarde(raam) {
        // U-waarden in W/m²K
        const isolatieWaarden = {
            enkel: 5.8,
            dubbel: 2.8,
            hr: 2.0,
            'hr++': 1.3,
            triple: 0.8,
            zonwerend: 1.6,
            gelaagd: 2.5
        };
        
        return isolatieWaarden[raam.glas] || 2.8;
    }

    assessRaamComplexiteit(raam) {
        let score = 1;
        
        if (raam.afmetingen) {
            if (raam.afmetingen.breedte > 200 || raam.afmetingen.hoogte > 250) {
                score += 0.2;
            }
        }
        
        if (raam.type === 'schuifraam' || raam.type === 'draaikiepraam') {
            score += 0.1;
        }
        
        return {
            score: Math.round(score * 100) / 100,
            niveau: score <= 1.0 ? 'eenvoudig' : score <= 1.2 ? 'normaal' : 'complex'
        };
    }

    // Pricing Engine class
    class YannovaPricingEngine {
        constructor() {
            this.basePrices = {};
            this.complexityFactors = {};
            this.discountRules = {};
        }

        setBasePrices(prices) {
            this.basePrices = prices;
        }

        setComplexityFactors(factors) {
            this.complexityFactors = factors;
        }

        setDiscountRules(rules) {
            this.discountRules = rules;
        }

        getRaamPrijs(raam) {
            const materiaalPrijs = this.basePrices.ramen[raam.materiaal];
            const glasPrijs = this.basePrices.glas[raam.glas];
            
            if (!materiaalPrijs || !glasPrijs) {
                return 500; // Default prijs
            }
            
            const oppervlakte = raam.oppervlakte || 1;
            return (materiaalPrijs.basis + (materiaalPrijs.per_m2 * oppervlakte)) + 
                   (glasPrijs.per_m2 * oppervlakte);
        }

        getDeurPrijs(deur) {
            const materiaalPrijs = this.basePrices.deuren[deur.materiaal];
            
            if (!materiaalPrijs) {
                return 600; // Default prijs
            }
            
            return materiaalPrijs.basis + materiaalPrijs.per_stuk;
        }

        getArbeidsPrijs(type) {
            return this.basePrices.arbeid[type] || 65;
        }

        getVolumeKorting(totaal) {
            const rules = this.discountRules.volume || [];
            for (const rule of rules.reverse()) {
                if (totaal >= rule.min) {
                    return rule.korting;
                }
            }
            return 0;
        }

        getSeizoenKorting() {
            const rules = this.discountRules.seizoen || [];
            const currentMonth = new Date().getMonth() + 1;
            
            for (const rule of rules) {
                if (rule.maanden.includes(currentMonth)) {
                    return rule.korting;
                }
            }
            return 0;
        }
    }

    // Materials Database class
    class MaterialsDatabase {
        constructor() {
            this.materials = {};
        }

        addMaterials(materials) {
            this.materials = { ...this.materials, ...materials };
        }

        getMaterialInfo(type, property) {
            return this.materials[type]?.[property] || null;
        }
    }
}

// Export voor gebruik
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YannovaAIQuoteGenerator;
}