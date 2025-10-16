# Gemini AI Image Generator Setup

Deze handleiding helpt je bij het instellen van de Gemini AI image generator voor je Yannova website.

## Overzicht

De Gemini image generator integreert Google's Gemini AI om professionele project afbeeldingen te genereren voor je constructie website. Dit systeem kan realistische afbeeldingen maken van ramen, deuren, renovatie projecten en meer.

## Functies

- **AI Image Generation**: Genereer realistische project afbeeldingen met tekst prompts
- **Project Types**: Ondersteuning voor ramen, deuren, renovatie, nieuwbouw en onderhoud
- **Customizable Options**: Stijl, tijdstip, gebouw type en materialen
- **Gallery Management**: Beheer gegenereerde afbeeldingen in een galerij
- **API Integration**: Server-side API voor veilige image generation
- **Responsive Design**: Werkt op alle apparaten

## Installatie

### 1. Dependencies Installeren

```bash
cd /Users/innovars_lab/Yannovabouw
npm install
```

### 2. Gemini API Key Instellen

1. Ga naar [Google AI Studio](https://aistudio.google.com/)
2. Maak een account aan of log in
3. Genereer een API key voor Gemini
4. Voeg de API key toe aan je environment variabelen:

```bash
# In je .env bestand of environment
export GEMINI_API_KEY="your_actual_api_key_here"
```

### 3. Server Starten

```bash
# Start de development server
npm run dev

# Of start de production server
npm start
```

## Gebruik

### Via de Web Interface

1. Ga naar `/pages/projecten/gemini-generator.html`
2. Selecteer een project type (ramen, deuren, etc.)
3. Kies optionele instellingen (stijl, tijdstip, gebouw type)
4. Klik op "Afbeeldingen Genereren"
5. Bekijk de gegenereerde afbeeldingen in de galerij

### Via de API

```javascript
// Genereer een enkele afbeelding
const response = await fetch('/api/gemini/generate-image', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        projectType: 'ramen',
        options: {
            style: 'modern',
            timeOfDay: 'golden hour',
            buildingType: 'residential'
        }
    })
});

const data = await response.json();
console.log(data.imageUrl);
```

```javascript
// Genereer meerdere afbeeldingen
const response = await fetch('/api/gemini/generate-gallery', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        projectType: 'deuren',
        count: 5,
        options: {
            style: 'classic',
            buildingType: 'commercial'
        }
    })
});

const data = await response.json();
console.log(data.images);
```

## Project Types

### Ramen
- **Prompt**: "Professional window installation on modern building, high-quality architectural photography"
- **Stijlen**: Modern, Classic, Contemporary, Minimalist
- **Materialen**: Aluminum, Wood, PVC, Composite

### Deuren
- **Prompt**: "Modern door installation project, professional construction work"
- **Stijlen**: Modern, Classic, Contemporary, Industrial
- **Materialen**: Steel, Wood, Aluminum, Glass

### Renovatie
- **Prompt**: "Building renovation project, before and after transformation"
- **Stijlen**: Modern, Classic, Contemporary, Industrial
- **Materialen**: Brick, Concrete, Steel, Glass

### Nieuwbouw
- **Prompt**: "New construction project with windows and doors"
- **Stijlen**: Modern, Contemporary, Minimalist, Industrial
- **Materialen**: Steel, Concrete, Glass, Aluminum

### Onderhoud
- **Prompt**: "Window and door maintenance work, professional service"
- **Stijlen**: Professional, Clean, Organized, Efficient
- **Materialen**: Maintenance tools, Cleaning supplies, Replacement parts

## API Endpoints

### POST /api/gemini/generate-image
Genereer een enkele afbeelding voor een project.

**Request Body:**
```json
{
    "projectType": "ramen",
    "options": {
        "style": "modern",
        "timeOfDay": "golden hour",
        "buildingType": "residential",
        "materials": "aluminum"
    }
}
```

**Response:**
```json
{
    "success": true,
    "imageUrl": "https://generated-image-url.com/image.jpg",
    "prompt": "Generated prompt text",
    "projectType": "ramen",
    "options": {...}
}
```

### POST /api/gemini/generate-gallery
Genereer meerdere afbeeldingen voor een project galerij.

**Request Body:**
```json
{
    "projectType": "deuren",
    "count": 3,
    "options": {
        "style": "classic",
        "buildingType": "commercial"
    }
}
```

**Response:**
```json
{
    "success": true,
    "images": [
        {
            "url": "https://image1.jpg",
            "alt": "Deuren project afbeelding 1",
            "title": "Deuren Project",
            "prompt": "Generated prompt",
            "projectType": "deuren",
            "options": {...}
        }
    ],
    "count": 3,
    "projectType": "deuren"
}
```

### GET /api/gemini/project-types
Krijg beschikbare project types.

**Response:**
```json
{
    "success": true,
    "projectTypes": [
        {
            "key": "ramen",
            "name": "Ramen Installatie",
            "description": "Professionele ramen installatie projecten"
        }
    ]
}
```

## Configuratie

### Rate Limiting
- **Per minuut**: 60 requests
- **Per uur**: 1000 requests
- **Max afbeeldingen per request**: 9

### Cache Settings
- **Enabled**: true
- **TTL**: 1 uur (3600000 ms)
- **Max size**: 100 afbeeldingen

### Image Settings
- **Max size**: 1024x1024 pixels
- **Formats**: JPG, PNG, WebP
- **Quality**: High

## Troubleshooting

### Veelvoorkomende Problemen

1. **API Key Error**
   - Controleer of je GEMINI_API_KEY correct is ingesteld
   - Zorg dat de API key geldig is en niet verlopen

2. **Rate Limit Exceeded**
   - Wacht even voordat je nieuwe requests doet
   - Controleer je rate limiting instellingen

3. **Image Generation Failed**
   - Controleer je internet verbinding
   - Controleer of de Gemini API beschikbaar is

4. **CORS Errors**
   - Zorg dat je server correct draait
   - Controleer je CORS instellingen

### Debug Mode

Activeer debug mode door de volgende environment variabele in te stellen:

```bash
export DEBUG=gemini:*
```

Dit geeft je gedetailleerde logs van alle Gemini API calls.

## Veiligheid

- API keys worden nooit in de frontend code opgeslagen
- Alle image generation gebeurt server-side
- Rate limiting voorkomt misbruik
- Input validatie voorkomt schadelijke prompts

## Kosten

- Gemini API heeft een gratis tier met beperkingen
- Controleer de [Google AI Pricing](https://ai.google.dev/pricing) voor actuele kosten
- Monitor je API usage via de Google AI Studio dashboard

## Support

Voor vragen of problemen:

1. Controleer deze documentatie
2. Bekijk de console logs voor error messages
3. Controleer je API key en internet verbinding
4. Neem contact op met de ontwikkelaar

## Toekomstige Uitbreidingen

- Video generation met Veo models
- Batch processing voor grote aantallen afbeeldingen
- Custom model training voor specifieke project types
- Integration met externe image hosting services
- Advanced prompt engineering tools
