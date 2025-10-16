# Yannova Ramen en Deuren - Installatiegids

## Overzicht
Deze installatiegids helpt u bij het opzetten van de complete Yannova Ramen en Deuren website met alle geavanceerde functionaliteiten.

## Systeemvereisten

### Frontend
- Moderne webbrowser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- JavaScript ingeschakeld
- Internetverbinding voor externe resources

### Backend (Optioneel)
- Node.js 16.0.0 of hoger
- npm 7.0.0 of hoger
- 512MB RAM minimum
- 1GB vrije schijfruimte

## Installatie Stappen

### 1. Frontend Setup

#### Stap 1: Bestanden uploaden
```bash
# Upload alle bestanden naar uw webserver
# Zorg dat de mappenstructuur intact blijft
```

#### Stap 2: Webserver configuratie
Zorg ervoor dat uw webserver de volgende bestanden correct serveert:
- `index.html` - Hoofdpagina
- `assets/` - CSS, JavaScript en afbeeldingen
- `pages/` - Aparte pagina's
- `admin/` - Admin dashboard (beveiligd)

#### Stap 3: HTTPS configuratie (Aanbevolen)
```nginx
# Nginx configuratie voorbeeld
server {
    listen 443 ssl;
    server_name yannova.nl www.yannova.nl;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /var/www/yannova;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Admin beveiliging
    location /admin/ {
        auth_basic "Admin Area";
        auth_basic_user_file /etc/nginx/.htpasswd;
    }
}
```

### 2. Backend Setup (Optioneel)

#### Stap 1: Node.js installeren
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# CentOS/RHEL
sudo yum install nodejs npm

# macOS (met Homebrew)
brew install node

# Windows
# Download van https://nodejs.org/
```

#### Stap 2: Dependencies installeren
```bash
cd api
npm install
```

#### Stap 3: Environment variabelen
```bash
# Maak .env bestand
cat > .env << EOF
PORT=3000
JWT_SECRET=uw-veilige-jwt-secret-sleutel
NODE_ENV=production
EOF
```

#### Stap 4: Server starten
```bash
# Development
npm run dev

# Production
npm start
```

#### Stap 5: Process Manager (PM2)
```bash
# PM2 installeren
npm install -g pm2

# Applicatie starten
pm2 start server.js --name "yannova-api"

# Auto-start configureren
pm2 startup
pm2 save
```

### 3. Database Setup (Toekomstige uitbreiding)

#### MongoDB (Aanbevolen)
```bash
# MongoDB installeren
sudo apt install mongodb

# Service starten
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Database aanmaken
mongo
> use yannova
> db.createUser({user: "yannova", pwd: "veilig-wachtwoord", roles: ["readWrite"]})
```

#### PostgreSQL (Alternatief)
```bash
# PostgreSQL installeren
sudo apt install postgresql postgresql-contrib

# Database aanmaken
sudo -u postgres createdb yannova
sudo -u postgres createuser yannova
```

## Configuratie

### 1. Contactgegevens aanpassen
Bewerk `index.html` en andere pagina's:
```html
<!-- Vervang deze gegevens -->
<p><i class="fas fa-map-marker-alt"></i> Uw adres</p>
<p><i class="fas fa-phone"></i> Uw telefoonnummer</p>
<p><i class="fas fa-envelope"></i> Uw email</p>
```

### 2. Google Analytics
Bewerk `assets/js/seo.js`:
```javascript
const GA_TRACKING_ID = 'G-XXXXXXXXXX'; // Vervang met uw tracking ID
```

### 3. Admin Credentials
Bewerk `api/server.js`:
```javascript
const validCredentials = {
    'admin': 'uw-admin-wachtwoord',
    'manager': 'uw-manager-wachtwoord'
};
```

### 4. Chatbot Instellingen
Bewerk `assets/js/chatbot.js`:
```javascript
// Pas welkomstbericht aan
const welcomeMessage = "Uw aangepaste welkomstbericht";
```

## Beveiliging

### 1. Admin Beveiliging
- Wijzig standaard wachtwoorden
- Gebruik sterke wachtwoorden
- Beperk admin toegang tot specifieke IP's
- Houd software up-to-date

### 2. Server Beveiliging
```bash
# Firewall configureren
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw deny 3000   # API (alleen lokaal)
```

### 3. SSL Certificaat
```bash
# Let's Encrypt certificaat
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yannova.nl -d www.yannova.nl
```

## Monitoring

### 1. Log Monitoring
```bash
# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PM2 logs
pm2 logs yannova-api
```

### 2. Performance Monitoring
```bash
# Server resources
htop
df -h
free -h

# PM2 monitoring
pm2 monit
```

## Backup

### 1. Website Backup
```bash
# Volledige backup
tar -czf yannova-backup-$(date +%Y%m%d).tar.gz /var/www/yannova/

# Database backup (indien van toepassing)
mongodump --db yannova --out /backup/mongodb/
```

### 2. Automatische Backups
```bash
# Cron job voor dagelijkse backup
0 2 * * * tar -czf /backup/yannova-$(date +\%Y\%m\%d).tar.gz /var/www/yannova/
```

## Troubleshooting

### Veelvoorkomende Problemen

#### 1. Chatbot werkt niet
- Controleer JavaScript console voor fouten
- Zorg dat alle bestanden correct zijn geladen
- Controleer internetverbinding

#### 2. Admin login werkt niet
- Controleer wachtwoorden in `api/server.js`
- Controleer JWT secret
- Controleer browser console voor fouten

#### 3. API endpoints niet bereikbaar
- Controleer of backend server draait
- Controleer firewall instellingen
- Controleer CORS configuratie

#### 4. SEO niet werkend
- Controleer meta tags in browser
- Test met Google Search Console
- Controleer sitemap.xml toegankelijkheid

### Log Bestanden
```bash
# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PM2 logs
pm2 logs yannova-api --lines 100

# System logs
sudo journalctl -u nginx -f
```

## Onderhoud

### 1. Regelmatige Updates
```bash
# System updates
sudo apt update && sudo apt upgrade

# Node.js dependencies
cd api && npm update

# PM2 restart
pm2 restart yannova-api
```

### 2. Performance Optimalisatie
- Comprimeer afbeeldingen
- Minify CSS/JS bestanden
- Gebruik CDN voor statische bestanden
- Implementeer caching

### 3. Security Updates
- Houd alle software up-to-date
- Monitor security advisories
- Voer regelmatig security scans uit

## Support

Voor technische ondersteuning:
- Email: support@yannova.nl
- Telefoon: +32 (0)477 28 10 28
- Documentatie: [GitHub Repository]

## Changelog

### v1.0.0 (2023-12-15)
- Eerste release
- Complete website met chatbot
- Admin dashboard
- Backend API
- SEO optimalisatie

---

**Belangrijk**: Test altijd eerst in een ontwikkelomgeving voordat u wijzigingen in productie doorvoert.