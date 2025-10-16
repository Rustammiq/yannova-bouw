# Supabase Integratie Installatiegids voor Yannova Ramen en Deuren

## Overzicht
Deze gids helpt je bij het integreren van Supabase in je Yannovabouw project voor database opslag, real-time functionaliteiten en authenticatie.

## Stap 1: Supabase Project Aanmaken

1. Ga naar [supabase.com](https://supabase.com)
2. Maak een account aan of log in
3. Klik op "New Project"
4. Kies je organisatie
5. Vul project details in:
   - **Name**: `yannova-ramen-deuren`
   - **Database Password**: Genereer een sterk wachtwoord
   - **Region**: Kies de dichtstbijzijnde regio (bijv. Europe West)
6. Klik op "Create new project"

## Stap 2: Database Schema Installeren

1. Ga naar je Supabase project dashboard
2. Klik op "SQL Editor" in de sidebar
3. Kopieer de inhoud van `api/supabase-schema.sql`
4. Plak het in de SQL Editor
5. Klik op "Run" om het schema te installeren

## Stap 3: API Keys Ophalen

1. Ga naar "Settings" > "API" in je Supabase dashboard
2. Kopieer de volgende waarden:
   - **Project URL** (bijv. `https://xyz.supabase.co`)
   - **anon public** key
   - **service_role** key (alleen voor backend)

## Stap 4: Environment Variabelen Configureren

### Backend (.env bestand)
Maak een `.env` bestand in de `api/` directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Frontend (supabase-client.js)
Update `assets/js/supabase-client.js`:

```javascript
this.supabaseUrl = 'https://your-project-id.supabase.co';
this.supabaseKey = 'your-anon-key-here';
```

## Stap 5: Dependencies Installeren

```bash
cd api
npm install
```

## Stap 6: Server Starten

### Voor Development:
```bash
npm run dev
```

### Voor Production:
```bash
npm start
```

## Stap 7: Database Beveiliging Configureren

### Row Level Security (RLS)
Het schema bevat al RLS policies, maar controleer deze in je Supabase dashboard:

1. Ga naar "Authentication" > "Policies"
2. Controleer dat alle tabellen RLS enabled hebben
3. Verificeer dat de policies correct zijn ingesteld

### API Keys Beveiliging
- **anon key**: Veilig voor frontend gebruik
- **service_role key**: Alleen voor backend, nooit in frontend code

## Stap 8: Real-time Functionaliteiten Testen

### Chat Real-time Updates
De chatbot gebruikt polling voor real-time updates. Voor echte real-time updates:

1. Update `assets/js/chatbot.js` om Supabase subscriptions te gebruiken
2. Test de real-time functionaliteit

### Admin Dashboard Real-time
Het admin dashboard kan real-time updates krijgen via:
- WebSocket verbindingen
- Server-Sent Events
- Polling (huidige implementatie)

## Stap 9: Data Migratie (Optioneel)

Als je bestaande data hebt:

1. Exporteer data uit je huidige systeem
2. Importeer via Supabase dashboard of SQL scripts
3. Test de data integriteit

## Stap 10: Monitoring en Analytics

### Supabase Dashboard
- Monitor database performance
- Bekijk real-time logs
- Controleer API usage

### Custom Analytics
Het schema bevat een `daily_analytics` tabel voor:
- Dagelijkse statistieken
- Chat trends
- Populaire vragen

## Veelvoorkomende Problemen

### 1. CORS Errors
```javascript
// In je Supabase project settings
// Ga naar Settings > API > CORS
// Voeg je domain toe: http://localhost:3000, https://yourdomain.com
```

### 2. RLS Policy Errors
```sql
-- Controleer policies in Supabase dashboard
-- Zorg dat service_role alle toegang heeft
CREATE POLICY "Service role full access" ON your_table
FOR ALL USING (auth.role() = 'service_role');
```

### 3. Connection Timeouts
```javascript
// In je Supabase client configuratie
const supabase = createClient(url, key, {
  db: { schema: 'public' },
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 10 } }
});
```

## Performance Optimalisatie

### Database Indexes
Het schema bevat al indexes voor:
- Chat messages op session_id en timestamp
- Admin users op username
- Analytics op date

### Query Optimalisatie
```sql
-- Gebruik LIMIT voor grote datasets
SELECT * FROM chat_messages 
WHERE session_id = 'session_123' 
ORDER BY timestamp DESC 
LIMIT 50;

-- Gebruik paginatie
SELECT * FROM chat_messages 
ORDER BY timestamp DESC 
LIMIT 50 OFFSET 100;
```

## Backup en Recovery

### Automatische Backups
Supabase biedt automatische dagelijkse backups voor:
- Pro plans en hoger
- 7 dagen retentie standaard

### Handmatige Backups
```bash
# Via Supabase CLI
supabase db dump --file backup.sql
```

## Security Best Practices

1. **Environment Variables**: Gebruik altijd environment variables voor secrets
2. **RLS Policies**: Test alle policies grondig
3. **API Rate Limiting**: Implementeer rate limiting in je backend
4. **Input Validation**: Valideer alle user input
5. **HTTPS**: Gebruik altijd HTTPS in productie

## Support en Documentatie

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Contact

Voor vragen over deze integratie, neem contact op met het Yannova development team.

---

**Belangrijk**: Vervang alle placeholder waarden (URLs, keys, etc.) met je eigen Supabase project gegevens voordat je de applicatie start.
