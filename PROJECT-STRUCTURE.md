# 📁 Yannova Project - Georganiseerde Structuur

## 🎯 **Overzicht**
Deze README beschrijft de georganiseerde bestands- en mapstructuur van het Yannova project.

## 📂 **Hoofdstructuur**

### 🌐 **Web Assets**
```
assets/
├── css/           # Stylesheets (main.css, modern-ui-enhancements.css, etc.)
├── js/            # JavaScript bestanden (analytics.js, modern-ui-interactions.js, etc.)
├── images/        # Afbeeldingen (hero-bg.jpg, about-team.jpg, etc.)
└── videos/        # Video bestanden
```

### 🔧 **Admin Panel**
```
admin/
├── dashboard.html         # Hoofddashboard
├── login.html            # Login pagina
├── content-management.*   # Content management systeem
├── quotes-management.*    # Offerte management
└── two-factor-auth.*      # 2FA authenticatie
```

### 🚀 **API & Backend**
```
api/
├── server.js              # Hoofdserver
├── routes/                # API routes
├── middleware/            # Middleware functies
├── config/                # Configuratie bestanden
└── data/                  # Data bestanden
```

### 📄 **Pagina's**
```
pages/
├── portfolio.html         # Portfolio pagina
├── over/                  # Over ons sectie
└── projecten/             # Projecten sectie
```

### 🛠️ **Tools & Scripts**
```
tools/
├── build.js               # Build script
├── optimize-ui.js         # UI optimalisatie
├── performance-optimizer.js # Performance optimalisatie
├── seo-optimizer.js       # SEO optimalisatie
└── gemini-cli.js          # Gemini AI CLI
```

### 📊 **Configuratie**
```
config/
├── package.json           # Project configuratie
├── manifest.json          # PWA manifest
├── vercel.json            # Vercel deployment config
└── *.json                 # Andere configuratie bestanden
```

### 📚 **Documentatie**
```
docs/
└── UI-ENHANCEMENTS-README.md # UI/UX verbeteringen documentatie
```

### 🧩 **Componenten**
```
components/
├── header.html            # Header component
├── footer.html            # Footer component
└── dashboard/             # Dashboard componenten
```

## 🚀 **Server Setup**

### **Website Server** (Poort 3002)
```bash
npm start
# Of: python3 -m http.server 3002
```
**URL**: http://localhost:3002

### **API Server** (Poort 3003)
```bash
npm run api
# Of: node api-server.js
```
**URL**: http://localhost:3003

### **Beide Servers Starten**
```bash
npm run start:full
```

## 🔧 **Opgeloste Problemen**

### ✅ **404 Errors Opgelost**
- ✅ `about-team.webp` - Gemaakt van `about-team.jpg`
- ✅ `icon-512.png` - Gemaakt van `icon-192.png`
- ✅ `bundle.min.css` - Gemaakt van `bundle.css`

### ✅ **501 Errors Opgelost**
- ✅ API server toegevoegd voor analytics endpoints
- ✅ CORS headers geconfigureerd
- ✅ POST requests naar `/api/analytics/event` werken nu

### ✅ **Structuur Georganiseerd**
- ✅ Bestanden verplaatst naar logische mappen
- ✅ Tools gescheiden van hoofdproject
- ✅ Configuratie bestanden gegroepeerd
- ✅ Documentatie georganiseerd

## 📋 **NPM Scripts**

```bash
# Development
npm start              # Start website server (poort 3002)
npm run dev            # Development server
npm run api            # Start API server (poort 3003)
npm run start:full     # Start beide servers

# Build & Optimization
npm run build          # Build project
npm run optimize:ui    # UI optimalisatie
npm run optimize       # Performance optimalisatie

# Testing & Analysis
npm run test           # Run tests
npm run analyze        # Project analyse
npm run performance    # Performance analyse

# Deployment
npm run deploy         # Build voor deployment
npm run deploy:vercel  # Deploy naar Vercel
npm run deploy:netlify # Deploy naar Netlify
```

## 🌟 **Features**

### 🎨 **Moderne UI/UX**
- Responsive design
- Moderne animaties
- Micro-interactions
- Accessibility (WCAG 2.1 AA)
- Performance optimalisaties

### 📊 **Analytics & Monitoring**
- Real-time analytics
- Performance monitoring
- User behavior tracking
- Core Web Vitals

### 🤖 **AI Integration**
- Gemini AI chatbot
- AI-powered quote generator
- Image generation
- Content optimization

### 🔒 **Security**
- Two-factor authentication
- Secure login system
- API security middleware
- GDPR compliance

## 📞 **Support**

Voor vragen of problemen:
- 📧 Email: info@yannovabouw.ai
- 🌐 Website: https://yannovabouw.ai
- 📱 Tel: +31 (0) 20 123 4567

---

**Laatste update**: 17 oktober 2025  
**Versie**: 2.0.0  
**Status**: ✅ Productie klaar
