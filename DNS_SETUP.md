# DNS Setup voor yannovabouw.ai

## 🌐 Domein Configuratie

### 1. DNS Records Instellen

#### A Records (IPv4)
```
yannovabouw.ai.          A       185.199.108.153
yannovabouw.ai.          A       185.199.109.153
yannovabouw.ai.          A       185.199.110.153
yannovabouw.ai.          A       185.199.111.153
```

#### AAAA Records (IPv6)
```
yannovabouw.ai.          AAAA    2606:50c0:8000::153
yannovabouw.ai.          AAAA    2606:50c0:8001::153
```

#### CNAME Records
```
www.yannovabouw.ai.      CNAME   yannovabouw.ai.
```

#### MX Records (Email)
```
yannovabouw.ai.          MX      10    mail.yannovabouw.ai.
```

#### TXT Records
```
yannovabouw.ai.          TXT     "v=spf1 include:_spf.google.com ~all"
yannovabouw.ai.          TXT     "google-site-verification=YOUR_VERIFICATION_CODE"
```

### 2. GitHub Pages Configuratie

#### Custom Domain Setup
1. Ga naar GitHub Repository Settings
2. Scroll naar "Pages" sectie
3. Voer custom domain in: `yannovabouw.ai`
4. Vink "Enforce HTTPS" aan

#### DNS Provider Instellingen
- **Type**: CNAME
- **Name**: www
- **Value**: rustammiq.github.io
- **TTL**: 3600

### 3. SSL Certificaat

GitHub Pages biedt automatisch SSL certificaten via Let's Encrypt:
- Automatische HTTPS redirect
- HSTS headers
- Modern TLS configuratie

### 4. Email Configuratie

#### Google Workspace Setup
1. Koop Google Workspace voor yannovabouw.ai
2. Configureer MX records
3. Stel email aliases in:
   - info@yannovabouw.ai
   - admin@yannovabouw.ai
   - support@yannovabouw.ai
   - noreply@yannovabouw.ai

#### Email Forwarding
```
info@yannovabouw.ai      →      info@yannovabouw.ai
admin@yannovabouw.ai     →      admin@yannovabouw.ai
support@yannovabouw.ai   →      support@yannovabouw.ai
noreply@yannovabouw.ai   →      noreply@yannovabouw.ai
```

### 5. SEO Optimalisaties

#### Google Search Console
1. Verifieer eigendom van yannovabouw.ai
2. Submit sitemap: https://yannovabouw.ai/sitemap.xml
3. Configureer URL parameters
4. Stel geografische targeting in (Nederland)

#### Google Analytics
1. Maak GA4 property aan voor yannovabouw.ai
2. Voeg tracking code toe aan website
3. Configureer conversion goals
4. Stel e-commerce tracking in

#### Bing Webmaster Tools
1. Verifieer eigendom
2. Submit sitemap
3. Configureer crawl settings

### 6. Performance Optimalisaties

#### CDN Setup
- Cloudflare (aanbevolen)
- AWS CloudFront
- KeyCDN

#### Caching Headers
```
Cache-Control: public, max-age=31536000
ETag: "version-hash"
Last-Modified: Wed, 16 Oct 2024 17:00:00 GMT
```

### 7. Security Headers

#### Security.txt
```
https://yannovabouw.ai/.well-known/security.txt
```

#### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

### 8. Monitoring & Analytics

#### Uptime Monitoring
- UptimeRobot
- Pingdom
- StatusCake

#### Performance Monitoring
- Google PageSpeed Insights
- GTmetrix
- WebPageTest

#### Error Tracking
- Sentry
- LogRocket
- Bugsnag

### 9. Backup & Recovery

#### Website Backup
- GitHub repository (automatisch)
- Local backup scripts
- Cloud storage backup

#### Database Backup
- Supabase automatische backups
- Export scripts
- Cloud storage backup

### 10. Launch Checklist

#### Pre-Launch
- [ ] DNS records geconfigureerd
- [ ] SSL certificaat actief
- [ ] Email accounts ingesteld
- [ ] Analytics geconfigureerd
- [ ] Search Console geverifieerd
- [ ] Performance getest
- [ ] Mobile responsiveness getest
- [ ] Cross-browser compatibility getest

#### Post-Launch
- [ ] Website live op yannovabouw.ai
- [ ] HTTPS redirect werkend
- [ ] Email functionaliteit werkend
- [ ] Analytics data binnenkomend
- [ ] Search engines crawlen
- [ ] Social media links werkend
- [ ] Contact formulieren werkend

### 11. Troubleshooting

#### Veelvoorkomende Problemen
1. **DNS Propagation**: Kan 24-48 uur duren
2. **SSL Certificate**: Kan 1-2 uur duren
3. **Email Delivery**: Check SPF/DKIM records
4. **Performance**: Check CDN configuratie

#### Support Contacten
- **DNS Provider**: [Provider Support]
- **GitHub Support**: [GitHub Support]
- **Email Provider**: [Email Support]

---

**Laatste Update**: 16 oktober 2024
**Status**: Ready for deployment
