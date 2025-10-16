# Slideshow en Video Setup Instructies

## Overzicht
Er zijn twee nieuwe secties toegevoegd aan de website:
1. **Slideshow sectie** - Volledig scherm slideshow met 5 afbeeldingen
2. **Video sectie** - Video player met overlay en play button

## Benodigde Bestanden

### Slideshow Afbeeldingen
Plaats de volgende afbeeldingen in `assets/images/gallery/hero/`:
- `construction-1.jpg` - Professionele Isolatiewerken
- `construction-2.jpg` - Moderne Renovatiewerken  
- `construction-3.jpg` - Duurzame Platedakken
- `construction-4.jpg` - Energiezuinige Ramen & Deuren
- `construction-5.jpg` - Prachtige Tuinaanleg

**Aanbevelingen voor afbeeldingen:**
- Formaat: 1920x1080px (16:9 aspect ratio)
- Bestandsgrootte: Maximaal 500KB per afbeelding
- Kwaliteit: Hoge resolutie, scherpe beelden
- Onderwerp: Bouwprojecten, isolatiewerken, renovaties, etc.

### Video Bestanden
Plaats de volgende bestanden in `assets/videos/`:
- `yannova-intro.mp4` - Hoofdvideo (MP4 formaat)
- `yannova-intro.webm` - Backup video (WebM formaat)

**Aanbevelingen voor video:**
- Duur: 30-60 seconden
- Formaat: 1920x1080px (16:9 aspect ratio)
- Codec: H.264 voor MP4, VP9 voor WebM
- Bestandsgrootte: Maximaal 10MB per bestand
- Onderwerp: Bedrijfsintroductie, werkwijze, resultaten

### Video Poster
Plaats een poster afbeelding in `assets/images/`:
- `video-poster.jpg` - Thumbnail voor video (1920x1080px)

## Functionaliteiten

### Slideshow Features
- ✅ Automatisch afspelen (5 seconden per slide)
- ✅ Handmatige navigatie met pijlen
- ✅ Dot navigatie onderaan
- ✅ Keyboard ondersteuning (pijltjestoetsen)
- ✅ Touch/swipe ondersteuning op mobiel
- ✅ Pauzeert bij hover
- ✅ Responsive design

### Video Features
- ✅ Play/Pause functionaliteit
- ✅ Overlay met play button
- ✅ Click to play op video
- ✅ Keyboard ondersteuning (spatie/enter)
- ✅ Responsive design
- ✅ Fallback voor browsers zonder video ondersteuning

## CSS Classes
De volgende CSS classes zijn toegevoegd:
- `.slideshow-section` - Hoofdcontainer slideshow
- `.slide` - Individuele slide
- `.slide.active` - Actieve slide
- `.video-section` - Hoofdcontainer video
- `.video-wrapper` - Video container
- `.video-overlay` - Overlay met controls

## JavaScript Classes
- `Slideshow` - Beheert slideshow functionaliteit
- `VideoPlayer` - Beheert video functionaliteit

## Browser Ondersteuning
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobiele browsers (iOS Safari, Chrome Mobile)

## Performance Optimalisaties
- Lazy loading voor afbeeldingen
- Preload metadata voor video
- CSS animaties gebruiken hardware acceleratie
- Responsive images
- Minimale JavaScript footprint

## Testen
1. Controleer of alle afbeeldingen laden
2. Test slideshow navigatie (pijlen, dots, keyboard)
3. Test video play/pause functionaliteit
4. Test responsive gedrag op verschillende schermformaten
5. Test touch/swipe op mobiele apparaten

## Troubleshooting
- Als afbeeldingen niet laden: Controleer bestandspaden
- Als video niet speelt: Controleer video formaten en bestandspaden
- Als slideshow niet werkt: Controleer JavaScript console voor errors
- Voor mobiele problemen: Test touch events en viewport instellingen
