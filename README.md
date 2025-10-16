# 🏗️ Yannova Bouw - Modern Construction Website

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/Rustammiq/yannova-bouw)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-orange?style=for-the-badge&logo=supabase)](https://supabase.com/)

Een complete, moderne website voor een bouwbedrijf met geavanceerde AI-tools, admin dashboard en offerte management systeem.

## ✨ Features

### 🎨 Frontend
- **Responsive Design** - Volledig responsive voor alle apparaten
- **Modern UI/UX** - Clean, professioneel design
- **PWA Ready** - Progressive Web App functionaliteiten
- **SEO Optimized** - Volledig geoptimaliseerd voor zoekmachines
- **Performance** - Geoptimaliseerd voor snelheid en prestaties

### 🤖 AI & Automation
- **AI Chatbot** - Intelligente chatbot met Supabase integratie
- **Quote Generator** - Automatische offerte generatie
- **Image Generator** - AI-powered afbeelding generatie met Gemini
- **Content Management** - Dynamisch content beheer

### 🔐 Admin Dashboard
- **Secure Login** - JWT authenticatie met Supabase
- **Real-time Analytics** - Live statistieken en monitoring
- **Quote Management** - Volledig CRUD systeem voor offertes
- **Chat History** - Complete chat geschiedenis en analyse
- **User Management** - Beheer van gebruikers en rechten

### 🗄️ Backend & Database
- **Node.js API** - Express.js server met RESTful endpoints
- **Supabase Integration** - PostgreSQL database met real-time features
- **JWT Authentication** - Veilige authenticatie en autorisatie
- **File Upload** - Afbeelding en document upload functionaliteit

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm of yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Rustammiq/yannova-bouw.git
cd yannova-bouw
```

2. **Install dependencies**
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd api
npm install
```

3. **Configure environment**
```bash
# Copy environment template
cp api/env.example api/.env

# Edit with your Supabase credentials
nano api/.env
```

4. **Setup Supabase**
```bash
# Run database schema
cd api
node install-schema.js
```

5. **Start the application**
```bash
# Start backend server
cd api
npm start

# Open frontend in browser
open index.html
```

## 📁 Project Structure

```
yannova-bouw/
├── 📁 admin/                 # Admin dashboard
│   ├── 🎨 *.css             # Admin styling
│   ├── 📄 *.html            # Admin pages
│   └── ⚡ *.js              # Admin functionality
├── 📁 api/                   # Backend API
│   ├── 🔧 server.js         # Express server
│   ├── 🗄️ *.sql            # Database schemas
│   └── 📦 package.json      # Dependencies
├── 📁 assets/                # Static assets
│   ├── 🎨 css/              # Stylesheets
│   ├── ⚡ js/               # JavaScript files
│   ├── 🖼️ images/          # Images and media
│   └── 🎬 videos/           # Video content
├── 📁 components/            # Reusable components
├── 📁 pages/                 # Website pages
├── 📄 index.html            # Main homepage
└── 📄 README.md             # This file
```

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox/Grid
- **JavaScript (ES6+)** - Modern JavaScript features
- **Chart.js** - Data visualization
- **PWA** - Progressive Web App features

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database
- **JWT** - Authentication

### AI & Tools
- **Google Gemini** - AI image generation
- **Supabase AI** - Database AI features
- **Custom Chatbot** - Intelligent responses

## 🔧 Configuration

### Environment Variables
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Server Configuration
PORT=3000
NODE_ENV=production

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### Database Setup
1. Create Supabase project
2. Run the SQL schemas in `api/*.sql`
3. Configure environment variables
4. Test connection with `node test-supabase.js`

## 📊 Features Overview

### 🏠 Homepage
- Hero section with video background
- Service showcase
- Portfolio gallery
- Contact information
- AI chatbot integration

### 💬 AI Chatbot
- Real-time conversations
- Quick action buttons
- Chat history storage
- Sentiment analysis
- Mobile optimized

### 📋 Quote Generator
- Multi-step form
- Dynamic pricing
- Template system
- Export functionality
- Admin management

### 🔐 Admin Dashboard
- Secure authentication
- Real-time analytics
- Quote management
- Chat monitoring
- User management

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Build project
npm run build

# Deploy to Netlify
# Upload dist/ folder to Netlify
```

### Traditional Hosting
```bash
# Build for production
npm run build

# Upload files to your server
# Configure web server (Apache/Nginx)
```

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized
- **Image Optimization**: WebP format with fallbacks
- **Code Splitting**: Lazy loading implemented
- **Caching**: Browser and CDN caching

## 🔒 Security

- **HTTPS**: SSL/TLS encryption
- **JWT Tokens**: Secure authentication
- **Input Validation**: XSS and injection protection
- **CORS**: Cross-origin request security
- **Rate Limiting**: API protection

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development**: Rustammiq
- **Design**: Custom UI/UX
- **AI Integration**: Google Gemini + Supabase

## 📞 Support

For support and questions:
- 📧 Email: [Contact Form](https://yannova-bouw.vercel.app/contact)
- 🐛 Issues: [GitHub Issues](https://github.com/Rustammiq/yannova-bouw/issues)
- 📖 Documentation: [Wiki](https://github.com/Rustammiq/yannova-bouw/wiki)

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for backend services
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Chart.js](https://www.chartjs.org/) for data visualization
- [Express.js](https://expressjs.com/) for the web framework

---

<div align="center">
  <strong>Built with ❤️ for modern construction businesses</strong>
</div>