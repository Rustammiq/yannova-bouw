# Admin Image Generator

De Admin Image Generator is een krachtige tool geïntegreerd in het admin dashboard waarmee je AI-gegenereerde afbeeldingen kunt maken en direct op je website kunt plaatsen.

## Overzicht

Deze functionaliteit stelt admins in staat om:
- Professionele project afbeeldingen te genereren met AI
- Afbeeldingen direct te integreren in verschillende website secties
- Een visuele galerij te beheren voor marketing doeleinden
- Aangepaste prompts te gebruiken voor specifieke afbeeldingen

## Toegang

1. Log in op het admin dashboard: `/admin/login.html`
2. Navigeer naar "AI Image Generator" in het zijmenu
3. Configureer je afbeelding instellingen
4. Genereer en integreer afbeeldingen

## Functies

### 🎨 **Image Generation**
- **Project Types**: Ramen, Deuren, Renovatie, Nieuwbouw, Onderhoud
- **Stijlen**: Modern, Klassiek, Hedendaags, Minimalistisch
- **Tijdstippen**: Ochtend, Middag, Gouden uur, Blauwe uur
- **Gebouw Types**: Woning, Kantoor, Industrieel, Winkel
- **Aangepaste Prompts**: Voeg specifieke details toe

### 🔧 **Admin Controls**
- **Batch Generation**: Genereer 1-9 afbeeldingen tegelijk
- **Image Selection**: Selecteer meerdere afbeeldingen voor integratie
- **Gallery Management**: Bekijk, download en beheer gegenereerde afbeeldingen
- **Custom Prompts**: Voeg extra details toe aan AI prompts

### 🌐 **Website Integration**
- **Homepage Hero**: Plaats afbeelding als hero achtergrond
- **Project Galerij**: Voeg toe aan project overzicht
- **Diensten Sectie**: Gebruik in diensten pagina
- **Marketing Materiaal**: Voor brochures en social media

## Gebruik

### Stap 1: Configureer Instellingen
1. Selecteer een **Project Type** (verplicht)
2. Kies optionele **Gebouw Type** en **Stijl**
3. Selecteer **Tijdstip** en **Aantal afbeeldingen**
4. Voeg eventueel een **Aangepaste Prompt** toe
5. Kies het **Gebruik** voor de afbeelding

### Stap 2: Genereer Afbeeldingen
1. Klik op **"Genereer Afbeeldingen"**
2. Wacht tot de AI de afbeeldingen heeft gegenereerd
3. Bekijk de resultaten in de galerij

### Stap 3: Selecteer en Integreer
1. **Selecteer** de gewenste afbeeldingen door op "Selecteer" te klikken
2. Kies een **Integratie optie**:
   - Homepage Hero
   - Project Galerij
   - Diensten Sectie
3. Klik op **"Integreer"** om de afbeelding op de website te plaatsen

## Project Types & Prompts

### Ramen Installatie
- **Base Prompt**: "Professional window installation on modern building, high-quality architectural photography"
- **Stijlen**: Modern, Classic, Contemporary, Minimalist
- **Materialen**: Aluminum, Wood, PVC, Composite

### Deuren Installatie
- **Base Prompt**: "Modern door installation project, professional construction work"
- **Stijlen**: Modern, Classic, Contemporary, Industrial
- **Materialen**: Steel, Wood, Aluminum, Glass

### Renovatie Project
- **Base Prompt**: "Building renovation project, before and after transformation"
- **Stijlen**: Modern, Classic, Contemporary, Industrial
- **Materialen**: Brick, Concrete, Steel, Glass

### Nieuwbouw Project
- **Base Prompt**: "New construction project with windows and doors"
- **Stijlen**: Modern, Contemporary, Minimalist, Industrial
- **Materialen**: Steel, Concrete, Glass, Aluminum

### Onderhoud & Service
- **Base Prompt**: "Window and door maintenance work, professional service"
- **Stijlen**: Professional, Clean, Organized, Efficient
- **Materialen**: Maintenance tools, Cleaning supplies, Replacement parts

## Aangepaste Prompts

Gebruik het "Aangepaste Prompt" veld om specifieke details toe te voegen:

**Voorbeelden:**
- "met zonsondergang achtergrond"
- "in een moderne loft stijl"
- "met werknemers in actie"
- "voor een luxe villa project"
- "met focus op duurzaamheid"

## Integratie Opties

### Homepage Hero
- Plaats afbeelding als achtergrond van de hero sectie
- Automatisch geoptimaliseerd voor verschillende schermformaten
- Behoud van tekst leesbaarheid

### Project Galerij
- Voeg afbeeldingen toe aan het project overzicht
- Automatische categorisering op project type
- Responsive grid layout

### Diensten Sectie
- Gebruik afbeeldingen in diensten overzicht
- Ondersteuning voor verschillende diensten
- Consistente styling

## API Endpoints

### GET /api/gemini/admin/images
Haal opgeslagen admin afbeeldingen op.

**Response:**
```json
{
    "success": true,
    "images": [
        {
            "id": "admin_img_123",
            "url": "https://generated-image.jpg",
            "title": "Ramen Project",
            "projectType": "ramen",
            "createdAt": "2024-01-15T10:30:00Z"
        }
    ]
}
```

### POST /api/gemini/admin/save-image
Sla een gegenereerde afbeelding op.

**Request:**
```json
{
    "imageData": {
        "url": "https://generated-image.jpg",
        "title": "Ramen Project",
        "projectType": "ramen"
    },
    "usage": "homepage",
    "section": "hero"
}
```

## Best Practices

### 1. **Prompt Engineering**
- Wees specifiek over gewenste stijl en sfeer
- Voeg locatie-specifieke details toe
- Gebruik technische termen voor betere resultaten

### 2. **Image Selection**
- Selecteer afbeeldingen die passen bij je merk
- Controleer kwaliteit en compositie
- Overweeg verschillende aspect ratios

### 3. **Website Integration**
- Test afbeeldingen op verschillende apparaten
- Zorg voor consistente branding
- Optimaliseer voor laadtijden

### 4. **Content Management**
- Organiseer afbeeldingen per project type
- Houd een backup van belangrijke afbeeldingen
- Documenteer gebruik van afbeeldingen

## Troubleshooting

### Veelvoorkomende Problemen

1. **Geen afbeeldingen gegenereerd**
   - Controleer of project type is geselecteerd
   - Controleer internet verbinding
   - Controleer API key configuratie

2. **Integratie werkt niet**
   - Controleer of afbeeldingen zijn geselecteerd
   - Controleer admin rechten
   - Controleer server logs

3. **Slechte afbeelding kwaliteit**
   - Verbeter de prompt met meer details
   - Probeer verschillende stijlen
   - Gebruik aangepaste prompts

### Debug Mode

Activeer debug mode in de browser console:
```javascript
localStorage.setItem('debug', 'admin-image-generator');
```

## Veiligheid

- Alle API calls worden server-side uitgevoerd
- Admin authenticatie vereist voor alle operaties
- Rate limiting voorkomt misbruik
- Input validatie voorkomt schadelijke prompts

## Kosten & Limieten

- **Rate Limiting**: 60 requests per minuut
- **Max Images**: 9 per generatie sessie
- **Storage**: Afbeeldingen worden lokaal opgeslagen
- **API Costs**: Volg Google Gemini pricing

## Support

Voor technische ondersteuning:
1. Controleer de browser console voor errors
2. Controleer server logs
3. Test met verschillende project types
4. Neem contact op met de ontwikkelaar

## Toekomstige Uitbreidingen

- **Batch Processing**: Meerdere projecten tegelijk
- **Template System**: Vooraf gedefinieerde prompts
- **Auto Integration**: Automatische plaatsing op website
- **Analytics**: Gebruik statistieken en performance metrics
- **Version Control**: Versie beheer voor afbeeldingen
