# Yannova Ramen en Deuren - Project Documentatie

## Overzicht
Dit project bevat een complete website voor Yannova Ramen en Deuren met geavanceerde functionaliteiten voor SEO, AI chatbot en admin beheer.

## Project Structuur

```
/Users/innovars_lab/Yannovabouw/
├── assets/
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   ├── main.js
│   │   ├── seo.js          # SEO en meta tags management
│   │   └── chatbot.js      # AI chatbot functionaliteit
│   ├── fonts/
│   └── images/
├── admin/
│   ├── login.html          # Admin login pagina
│   ├── dashboard.html      # Admin dashboard
│   ├── admin.css          # Admin styling
│   ├── dashboard.css      # Dashboard styling
│   ├── admin-login.js     # Login functionaliteit
│   └── dashboard.js       # Dashboard functionaliteit
├── api/
│   ├── server.js          # Backend API server
│   └── package.json       # Node.js dependencies
├── components/
├── pages/
│   ├── contact/
│   ├── diensten/
│   ├── over/
│   └── projecten/
├── index.html             # Hoofdpagina
├── sitemap.xml           # SEO sitemap
└── robots.txt            # SEO robots file
```

## Functionaliteiten

### 1. SEO en Meta Tags (`assets/js/seo.js`)
- **Dynamische meta tags** op basis van pagina
- **Open Graph** en **Twitter Card** ondersteuning
- **Structured Data** (JSON-LD) voor lokale bedrijfsinformatie
- **Google Analytics** integratie
- **Performance monitoring**
- **Sitemap** generatie

### 2. AI Chatbot (`assets/js/chatbot.js`) - **Supabase Geïntegreerd**
- **Interactieve chatbot** interface met real-time updates
- **Snelle acties** voor veelgestelde vragen
- **Chat geschiedenis** opslag in Supabase database
- **Typing indicator** voor realistische ervaring
- **Responsive design** voor mobiel en desktop
- **Session management** met persistentie
- **Real-time polling** voor live updates
- **Admin integratie** voor geschiedenis analyse

### 3. AI Offerte Generator (`assets/js/quote-generator.js`)
- **Multi-step offerte formulier** met 4 stappen
- **Dynamische product selectie** (ramen en deuren)
- **Intelligente prijsberekening** op basis van project type
- **Template systeem** voor verschillende offerte stijlen
- **Real-time validatie** en gebruiksvriendelijke interface
- **Offerte opslag** en beheer via admin dashboard
- **Export functionaliteit** voor offerte data

### 4. Admin Login (`admin/login.html`) - **Supabase Authenticatie**
- **Beveiligde login** met JWT tokens en Supabase
- **Remember me** functionaliteit
- **Auto-logout** na inactiviteit
- **Security features** (rechtsklik blokkering, F12 blokkering)
- **Responsive design**
- **Animated background**

### 5. Admin Dashboard (`admin/dashboard.html`) - **Supabase Analytics**
- **Real-time statistieken** uit Supabase database
- **Chat geschiedenis** weergave met filtering
- **Sentiment analyse** van gesprekken
- **Response tijd** analyse
- **Populaire vragen** tracking
- **Offerte beheer** met volledige CRUD functionaliteit
- **Data export** functionaliteit
- **Interactive charts** (Chart.js)
- **Mobile responsive**

### 6. Backend API (`api/server-supabase.js`) - **Volledig Supabase Geïntegreerd**
- **Express.js** server met Supabase client
- **JWT authenticatie** met Supabase users
- **Chatbot API** endpoints met database opslag
- **Admin API** endpoints met real-time data
- **Offerte API** endpoints met volledige CRUD
- **Data export** functionaliteit
- **Analytics** generatie uit Supabase
- **CORS** ondersteuning
- **Rate limiting**
- **Real-time subscriptions** support

## Installatie en Setup

### Frontend
1. Open `index.html` in een webbrowser
2. De chatbot wordt automatisch geladen
3. Admin toegang via `/admin/login.html`

### Backend met Supabase
```bash
cd api
npm install
# Configureer .env bestand met Supabase credentials
npm start
```

### Supabase Setup
Zie `SUPABASE_SETUP.md` voor volledige installatie instructies:
1. Maak Supabase project aan
2. Installeer database schema
3. Configureer environment variabelen
4. Start de applicatie

### Admin Toegang
- **Gebruikersnaam**: admin
- **Wachtwoord**: yannova2023

## SEO Features

### Meta Tags
- Dynamische titels en beschrijvingen per pagina
- Open Graph tags voor sociale media
- Twitter Card ondersteuning
- Canonical URLs

### Structured Data
- Lokale bedrijfsinformatie
- Openingstijden
- Contactgegevens
- Service gebied
- Reviews en ratings

### Technical SEO
- Sitemap.xml voor zoekmachines
- Robots.txt voor crawler instructies
- Performance monitoring
- Mobile-first design

## Chatbot Features

### Intelligent Responses
- Context-aware antwoorden
- Veelgestelde vragen database
- Fallback naar contact informatie
- Nederlandse taal ondersteuning

### User Experience
- Smooth animaties
- Typing indicators
- Quick action buttons
- Chat geschiedenis
- Mobile optimized

### Admin Integration
- Real-time chat monitoring
- Sentiment analysis
- Response time tracking
- Data export capabilities

## Admin Features

### Dashboard
- Real-time statistieken
- Chat activity charts
- Popular questions analysis
- User engagement metrics

### Chat Analysis
- Complete chat history
- Sentiment analysis
- Response time analysis
- Data filtering and export

### Security
- JWT token authentication
- Session management
- Auto-logout functionality
- Secure password handling

## Browser Ondersteuning
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance
- Lazy loading van componenten
- Optimized images
- Minified CSS/JS
- CDN voor externe resources

## Veiligheid
- HTTPS ready
- JWT token security
- Input validation
- XSS protection
- CSRF protection

## Supabase Integratie Features

### Database Opslag
- **Chat geschiedenis** persistentie in PostgreSQL
- **Admin gebruikers** beheer met authenticatie
- **Contact formulier** submissions
- **Offerte aanvragen** met project details
- **Website analytics** en visitor tracking

### Real-time Functionaliteiten
- **Live chat updates** via polling
- **Real-time dashboard** statistieken
- **Instant notifications** voor nieuwe berichten
- **Live visitor tracking**

### Geavanceerde Analytics
- **Sentiment analyse** van chat berichten
- **Response tijd** tracking
- **Populaire vragen** identificatie
- **User engagement** metrics
- **Daily/weekly/monthly** rapporten

## Toekomstige Uitbreidingen
- [x] Supabase database integratie
- [x] Real-time chat functionaliteiten
- [x] Advanced analytics met Supabase
- [ ] WebSocket real-time updates
- [ ] Advanced AI responses met Supabase Edge Functions
- [ ] Multi-language support
- [ ] Email notifications via Supabase
- [ ] Mobile app met Supabase
- [ ] Advanced user management
- [ ] API rate limiting met Supabase

## Contact
Voor vragen over dit project, neem contact op met het Yannova team.

---
© 2023 Yannova Ramen en Deuren. Alle rechten voorbehouden.