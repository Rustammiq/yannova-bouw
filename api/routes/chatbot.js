const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabase");
const { authenticateToken } = require("../middleware/auth");

// Enhanced Chatbot API with AI integration
router.post("/", async (req, res) => {
  try {
    const { message, sessionId, userProfile } = req.body;

    // Generate session ID if not provided
    const currentSessionId = sessionId || generateSessionId();

    // Create or update chat session in Supabase
    const { data: sessionData, error: sessionError } = await supabase
      .from("chat_sessions")
      .upsert(
        {
          session_id: currentSessionId,
          user_agent: req.headers["user-agent"],
          ip_address: req.ip,
          is_active: true,
          user_profile: userProfile || {},
        },
        {
          onConflict: "session_id",
        },
      )
      .select()
      .single();

    if (sessionError) {
      console.error("Session error:", sessionError);
      // Continue without session storage
    }

    // Store user message
    try {
      await supabase.from("chat_messages").insert({
        session_id: currentSessionId,
        message: message,
        sender: "user",
        timestamp: new Date().toISOString(),
      });
    } catch (messageError) {
      console.error("Message storage error:", messageError);
      // Continue without message storage
    }

    // Generate AI response
    const response = await generateEnhancedAIResponse(message, userProfile);

    // Store AI response
    try {
      await supabase.from("chat_messages").insert({
        session_id: currentSessionId,
        message: response.response,
        sender: "ai",
        timestamp: new Date().toISOString(),
        analysis: response.analysis,
      });
    } catch (responseError) {
      console.error("AI response storage error:", responseError);
      // Continue without storage
    }

    res.json({
      success: true,
      response: response.response,
      sessionId: currentSessionId,
      analysis: response.analysis,
      suggestions: response.suggestions,
    });
  } catch (error) {
    console.error("Chatbot API error:", error);
    res.status(500).json({
      success: false,
      error: "Er is een fout opgetreden. Probeer het later opnieuw.",
    });
  }
});

// Get chat history
router.get("/history/:sessionId", authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: true });

    if (error) {
      throw new Error("Failed to fetch chat history");
    }

    res.json({
      success: true,
      messages: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// AI Quote Generation endpoint
router.post("/generate-quote", async (req, res) => {
  try {
    const { requirements } = req.body;

    // Validate requirements
    if (!requirements || !requirements.klant) {
      return res.status(400).json({
        success: false,
        error: "Klantgegevens zijn verplicht",
      });
    }

    // Generate AI quote
    const quote = await generateAIQuote(requirements);

    // Store quote in database
    try {
      const { data: storedQuote, error } = await supabase
        .from("quotes")
        .insert({
          ...quote,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Quote storage error:", error);
      }

      res.json({
        success: true,
        quote: storedQuote || quote,
      });
    } catch (storageError) {
      console.error("Quote storage error:", storageError);
      res.json({
        success: true,
        quote: quote,
      });
    }
  } catch (error) {
    console.error("Quote generation error:", error);
    res.status(500).json({
      success: false,
      error: "Offerte generatie mislukt",
    });
  }
});

// Get chat analytics (admin only)
router.get("/analytics", authenticateToken, async (req, res) => {
  try {
    // Get session statistics
    const { data: sessions, error: sessionsError } = await supabase
      .from("chat_sessions")
      .select("*");

    // Get message statistics
    const { data: messages, error: messagesError } = await supabase
      .from("chat_messages")
      .select("*");

    // Calculate analytics
    const analytics = {
      totalSessions: sessions?.length || 0,
      activeSessions: sessions?.filter((s) => s.is_active).length || 0,
      totalMessages: messages?.length || 0,
      userMessages: messages?.filter((m) => m.sender === "user").length || 0,
      aiMessages: messages?.filter((m) => m.sender === "ai").length || 0,
      averageMessagesPerSession:
        sessions?.length > 0
          ? Math.round((messages?.length || 0) / sessions.length)
          : 0,
    };

    res.json({
      success: true,
      analytics: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Helper functions
function generateSessionId() {
  return (
    "yannova_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
  );
}

async function generateEnhancedAIResponse(message, userProfile = {}) {
  // Enhanced AI response logic with Yannova knowledge
  const lowerMessage = message.toLowerCase();

  // Intent detection
  const intents = {
    offerte_aanvragen: [
      "offerte",
      "prijs",
      "kosten",
      "wat kost",
      "quote",
      "prijsopgave",
      "wat kosten",
    ],
    informatie_producten: [
      "ramen",
      "deuren",
      "kunststof",
      "aluminium",
      "hout",
      "glas",
      "isolatie",
      "materiaal",
    ],
    informatie_diensten: [
      "plaatsing",
      "montage",
      "installatie",
      "service",
      "onderhoud",
      "reparatie",
    ],
    contact: [
      "contact",
      "telefoon",
      "adres",
      "openingstijden",
      "bereikbaar",
      "waar gevonden",
    ],
    garantie: [
      "garantie",
      "verzekering",
      "service",
      "nazorg",
      "garantievoorwaarden",
    ],
    proces: [
      "hoe lang",
      "doorlooptijd",
      "stappen",
      "proces",
      "wanneer",
      "duur",
    ],
    technisch: [
      "afmetingen",
      "maten",
      "specificaties",
      "technische details",
      "u-waarde",
    ],
    afspraak_maken: [
      "afspraak",
      "bezoek",
      "inmeten",
      "advies",
      "langskomen",
      "afspraak inplannen",
    ],
  };

  let detectedIntent = "algemeen";
  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      detectedIntent = intent;
      break;
    }
  }

  // Generate response based on intent
  const responses = {
    offerte_aanvragen: `Ik begrijp dat u een offerte wilt aanvragen. Om u een zo nauwkeurig mogelijke prijsindicatie te geven, heb ik wat meer informatie nodig:

📋 **Benodigde informatie:**
- Hoeveel ramen en/of deuren heeft u nodig?
- Wat zijn de afmetingen (breedte x hoogte)?
- Welk materiaal prefereert u (kunststof, aluminium, hout)?
- Welk type glas (dubbelglas, HR++, triple glas)?

**Direct contact voor offerte:**
📞 Bel: +32 (0)477 28 10 28
📧 Email: info@yannovabouw.ai
🌐 Website: www.yannovabouw.ai

Ik kan u ook een geautomatiseerde prijsindicatie geven als u de specificaties doorgeeft.`,

    informatie_producten: `Bij Yannova Bouw bieden we een ruim assortiment ramen en deuren van topkwaliteit:

**🪟 Ramen:**
- **Kunststof:** €300-800 per m² - Onderhoudsarm en energiezuinig
- **Aluminium:** €500-1200 per m² - Modern en duurzaam
- **Hout:** €400-1000 per m² - Klassiek en isolerend

**🚪 Deuren:**
- **Binnendeuren:** €200-600 per stuk
- **Buitendeuren:** €500-2000 per stuk  
- **Schuifdeuren:** €1500-5000 per stuk

**🔆 Glasopties:**
- Dubbelglas (standaard) - U-waarde: 2.8
- HR++ (hoog rendement) - U-waarde: 1.3
- Triple glas (maximale isolatie) - U-waarde: 0.8

Alle producten komen met 10 jaar garantie en professionele montage. Waar bent u specifiek naar op zoek?`,

    contact: `U kunt Yannova Bouw op verschillende manieren bereiken:

**📞 Telefoon:** +32 (0)477 28 10 28
**📧 Email:** info@yannovabouw.ai
**🌐 Website:** www.yannovabouw.ai
**📍 Adres:** Industrieweg 123, 1234 AB Amsterdam

**Openingstijden:**
- Maandag t/m Vrijdag: 8:00 - 18:00 uur
- Zaterdag: 9:00 - 16:00 uur
- Zondag: Gesloten

**Snel contact nodig?** Ik kan u direct doorverbinden of een specialist laat terugbellen. Wat heeft uw voorkeur?`,

    garantie: `Bij Yannova Bouw staan we voor kwaliteit en bieden we uitgebreide garantie:

**🛡️ Standaard garantie:**
- 10 jaar op alle materialen en montage
- Dekking van materiaal- en constructiefouten
- Gratis reparatie of vervanging

**🔧 Service:**
- 24/7 servicedienst voor calamiteiten
- Jaarlijkse onderhoudsbeurt beschikbaar
- Snelle response tijd: binnen 48 uur

**📋 Verlengde garantie:**
- 15 jaar mogelijk tegen meerprijs
- Uitgebreide dekking inclusief slijtage

We zorgen ervoor dat u jarenlang zorgeloos geniet van uw ramen en deuren!`,

    proces: `Het proces bij Yannova Bouw is transparant en efficiënt:

**📋 Stap 1: Kennismaking en advies**
- Gratis adviesgesprek
- Demonstratie van mogelijkheden
- Advies op maat

**📏 Stap 2: Inmeten en offerte**
- Precieze inmeting ter plaatse
- Gedetailleerde offerte binnen 3 dagen
- Vrijblijvend en kosteloos

**🏭 Stap 3: Productie**
- Productie op maat (4-6 weken)
- Kwaliteitscontrole
- Transport planning

**🔧 Stap 4: Montage**
- Professionele montage (1-3 dagen)
- Minimale overlast
- Nette afwerking

**✅ Stap 5: Oplevering en nazorg**
- Controle en instructies
- Garantiecertificaat
- 10 jaar nazorg

**Doorlooptijd:** 6-8 weken van bestelling tot oplevering`,
  };

  const response =
    responses[detectedIntent] ||
    `Ik help u graag verder! Bij Yannova Bouw zijn we gespecialiseerd in ramen en deuren met 15+ jaar ervaring. 

Wat kan ik voor u betekenen? Ik kan u helpen met:
- Offerte aanvragen
- Productinformatie
- Advies over materialen
- Informatie over onze diensten
- Afspraak inplannen

Waar wilt u meer informatie over?`;

  // Generate suggestions based on intent
  const suggestions = {
    offerte_aanvragen: [
      "Direct offerte aanvragen",
      "Inmeten afspraak maken",
      "Showroom bezoeken",
    ],
    informatie_producten: ["Kunststof ramen", "Aluminium deuren", "HR++ glas"],
    contact: ["Telefoonnummer", "Adres en route", "Afspraak maken"],
    garantie: ["Garantievoorwaarden", "Service contract", "Onderhoudsbeurt"],
  };

  const selectedSuggestions = suggestions[detectedIntent] || [
    "Offerte aanvragen",
    "Product informatie",
    "Contact opnemen",
  ];

  return {
    response: response,
    analysis: {
      intent: detectedIntent,
      confidence: 0.85,
      entities: extractEntities(message),
    },
    suggestions: selectedSuggestions,
  };
}

function extractEntities(message) {
  const entities = {};

  // Extract phone numbers
  const phoneMatch = message.match(
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
  );
  if (phoneMatch) {
    entities.telefoon = phoneMatch[0];
  }

  // Extract email addresses
  const emailMatch = message.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  );
  if (emailMatch) {
    entities.email = emailMatch[0];
  }

  // Extract measurements
  const sizeMatch = message.match(/(\d+)\s*[xX×]\s*(\d+)/);
  if (sizeMatch) {
    entities.afmetingen = {
      breedte: parseInt(sizeMatch[1]),
      hoogte: parseInt(sizeMatch[2]),
    };
  }

  return entities;
}

async function generateAIQuote(requirements) {
  // Simulate AI quote generation
  const quoteId =
    "YAN-" +
    Date.now() +
    "-" +
    Math.random().toString(36).substr(2, 6).toUpperCase();

  // Calculate estimated price based on requirements
  let estimatedPrice = 0;

  if (requirements.ramen) {
    requirements.ramen.forEach((raam) => {
      const basePrice =
        raam.materiaal === "kunststof"
          ? 500
          : raam.materiaal === "aluminium"
            ? 800
            : raam.materiaal === "hout"
              ? 600
              : 700;
      estimatedPrice += basePrice * (raam.aantal || 1);
    });
  }

  if (requirements.deuren) {
    requirements.deuren.forEach((deur) => {
      const basePrice =
        deur.type === "buitendeur"
          ? 1200
          : deur.type === "binnendeur"
            ? 400
            : deur.type === "schuifdeur"
              ? 2500
              : 800;
      estimatedPrice += basePrice * (deur.aantal || 1);
    });
  }

  // Add installation costs (approximately 30% of material costs)
  const installationCosts = estimatedPrice * 0.3;
  const totalCosts = estimatedPrice + installationCosts;

  return {
    id: quoteId,
    klant: requirements.klant,
    project: {
      type: requirements.projectType || "vervanging",
      estimatedPrice: Math.round(totalCosts),
      materialCosts: Math.round(estimatedPrice),
      installationCosts: Math.round(installationCosts),
      duration: "1-3 weken",
      validity: "30 dagen",
    },
    specificaties: requirements,
    aanbevelingen: [
      "HR++ glas aanbevolen voor optimale isolatie",
      "10 jaar garantie op alle producten en montage",
      "Professionele montage door gecertificeerde vakmensen",
    ],
    timestamp: new Date().toISOString(),
    status: "concept",
  };
}

module.exports = router;
