# AI Tools Bundle - Yannova Bouw

## Overview

The AI Tools Bundle is a comprehensive integration of all AI functionality for Yannova Bouw, including:

- **Gemini AI Tools** - Content generation, video creation, project planning, analytics
- **AI Chatbot** - Intelligent customer service with knowledge base
- **AI Quote Generator** - Advanced quote generation with pricing engine

## Installation

### Basic Usage

```html
<!-- Include the bundle -->
<script src="/assets/js/ai-tools-bundle.js"></script>

<!-- The bundle auto-initializes as window.yannovaAIBundle -->
<script>
  // Use the bundle
  const bundle = window.yannovaAIBundle;
</script>
```

### Advanced Configuration

```javascript
// Create with custom configuration
const bundle = await YannovaAIToolsBundle.create({
  apiEndpoint: "/api/ai-tools",
  geminiApiKey: "your-api-key",
  enableChatbot: true,
  enableQuoteGenerator: true,
  enableGeminiTools: true,
  debugMode: false,
});
```

## API Reference

### Gemini AI Tools

#### Video Generation

```javascript
const video = await bundle.generateVideo({
  projectType: "renovatiewerken",
  duration: 30,
  style: "timelapse",
  description: "Complete renovation process",
});
```

#### Content Generation

```javascript
const content = await bundle.generateContent({
  contentType: "blog-post",
  topic: "Isolatie tips",
  length: "medium",
  tone: "professional",
  keywords: ["isolatie", "energiebesparing"],
});
```

#### Quote Generation

```javascript
const quote = await bundle.generateQuote({
  projectType: "ramen-deuren",
  size: 50,
  complexity: "medium",
  location: "Amsterdam",
  urgency: "normal",
});
```

#### Project Planning

```javascript
const plan = await bundle.generateProjectPlan({
  projectName: "Klant Renovatie",
  projectType: "renovatiewerken",
  startDate: "2024-02-01",
  duration: 4,
  teamSize: 3,
});
```

#### Customer Service Response

```javascript
const response = await bundle.generateCustomerResponse({
  queryType: "offerte_aanvragen",
  customerQuery: "Ik wil een offerte voor nieuwe ramen",
  responseTone: "professional",
});
```

#### Analytics Generation

```javascript
const analytics = await bundle.generateAnalytics({
  dataType: "projects",
  period: "monthly",
  metrics: ["completion", "satisfaction"],
});
```

#### Report Generation

```javascript
const report = await bundle.generateReport({
  reportType: "project-summary",
  period: "Q1-2024",
  format: "detailed",
});
```

#### Design Generation

```javascript
const design = await bundle.generateDesign({
  projectType: "ramen-deuren",
  description: "Modern strakke uitstraling",
  style: "modern",
  quality: "high",
});
```

### AI Chatbot

#### Process Message

```javascript
const response = await bundle.processChatMessage("Wat kosten nieuwe ramen?", {
  sessionId: "optional-session-id",
});
```

#### Get Suggestions

```javascript
const suggestions = bundle.getChatSuggestions("offerte_aanvragen");
// Returns: ['Direct offerte aanvragen', 'Inmeten afspraak maken', ...]
```

#### Get User Profile

```javascript
const profile = bundle.getChatUserProfile();
// Returns user preferences and conversation history
```

### AI Quote Generator

#### Generate Detailed Quote

```javascript
const detailedQuote = await bundle.generateDetailedQuote({
  klant: {
    naam: "Jan Jansen",
    email: "jan@example.com",
    telefoon: "+32 477 28 10 28",
  },
  projectType: "vervanging",
  ramen: [
    {
      materiaal: "kunststof",
      glas: "hr++",
      aantal: 3,
      afmetingen: { breedte: 120, hoogte: 140 },
    },
  ],
  deuren: [
    {
      materiaal: "aluminium",
      type: "buitendeur",
      aantal: 1,
      afmetingen: { breedte: 90, hoogte: 210 },
    },
  ],
  locatieType: "woning",
  bouwjaar: 1995,
  bereikbaarheid: "normaal",
});
```

#### Get Recommendations

```javascript
const recommendations = bundle.getQuoteRecommendations(requirements);
// Returns AI-powered recommendations for materials, energy savings, etc.
```

## Events

The bundle emits events for monitoring and integration:

```javascript
// Listen to events
bundle.on("video:generation:start", (data) => {
  console.log("Video generation started:", data);
});

bundle.on("video:generation:complete", (result) => {
  console.log("Video generation completed:", result);
});

bundle.on("bundle:error", (error) => {
  console.error("Bundle error:", error);
});

// Available events:
// - bundle:initialized
// - video:generation:start/complete
// - content:generation:start/complete
// - quote:generation:start/complete
// - project-plan:generation:start/complete
// - customer-response:generation:start/complete
// - analytics:generation:start/complete
// - report:generation:start/complete
// - design:generation:start/complete
// - chat:message:start/complete
// - detailed-quote:generation:start/complete
// - bundle:error
```

## Utility Methods

### Get Bundle Status

```javascript
const status = await bundle.getBundleStatus();
// Returns: { initialized, instances, config, uptime, memory }
```

### Test All Tools

```javascript
const testResults = await bundle.testAllTools();
// Tests all initialized tools and returns results
```

### Memory Usage

```javascript
const memory = bundle.getMemoryUsage();
// Returns: { used, total, limit } in MB
```

## Configuration Options

```javascript
const config = {
  // API endpoint for AI tools
  apiEndpoint: "/api/ai-tools",

  // Gemini API key (optional, can be set server-side)
  geminiApiKey: null,

  // Enable/disable specific tools
  enableChatbot: true,
  enableQuoteGenerator: true,
  enableGeminiTools: true,

  // Enable debug logging
  debugMode: false,

  // Custom configuration for individual tools
  chatbotConfig: {
    maxConversationLength: 10,
    enableUserProfile: true,
  },

  quoteGeneratorConfig: {
    defaultVatRate: 0.21,
    enableDiscounts: true,
  },
};
```

## Error Handling

The bundle includes comprehensive error handling:

```javascript
// Global error handling
bundle.on("bundle:error", (error) => {
  console.error("AI Bundle Error:", error);
  // Send to error tracking service
});

// Try-catch for individual operations
try {
  const result = await bundle.generateContent(options);
} catch (error) {
  console.error("Content generation failed:", error);
  // Handle error gracefully
}
```

## Performance Optimization

### Lazy Loading

```javascript
// Only initialize specific tools when needed
const bundle = new YannovaAIToolsBundle({
  enableChatbot: false, // Disabled initially
  enableQuoteGenerator: false,
});

// Enable later if needed
bundle.instances.chatbot = new YannovaAIChatbot();
```

### Memory Management

```javascript
// Monitor memory usage
setInterval(() => {
  const memory = bundle.getMemoryUsage();
  if (memory && memory.used > 100) {
    // 100MB threshold
    console.warn("High memory usage detected:", memory);
  }
}, 30000);

// Cleanup when done
bundle.destroy();
```

## Integration Examples

### React Component

```jsx
import { useEffect, useState } from "react";

function AIChatbot() {
  const [bundle, setBundle] = useState(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    const initBundle = async () => {
      const aiBundle = await YannovaAIToolsBundle.create({
        enableChatbot: true,
        debugMode: process.env.NODE_ENV === "development",
      });
      setBundle(aiBundle);
    };

    initBundle();
  }, []);

  const handleMessage = async (message) => {
    if (bundle) {
      const result = await bundle.processChatMessage(message);
      setResponse(result.response);
    }
  };

  return (
    <div>
      <input
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleMessage(e.target.value);
          }
        }}
      />
      <div>{response}</div>
    </div>
  );
}
```

### Vue.js Component

```vue
<template>
  <div>
    <button @click="generateQuote">Generate Quote</button>
    <div v-if="quote">{{ quote.totalCost }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      bundle: null,
      quote: null,
    };
  },
  async mounted() {
    this.bundle = await YannovaAIToolsBundle.create();
  },
  methods: {
    async generateQuote() {
      this.quote = await this.bundle.generateQuote({
        projectType: "ramen-deuren",
        size: 25,
        complexity: "simple",
      });
    },
  },
};
</script>
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

The bundle requires these external dependencies to be loaded:

- Google Generative AI SDK (for Gemini integration)
- Modern JavaScript features (ES2018+)

## Security Considerations

- API keys should be handled server-side
- Rate limiting is implemented automatically
- Input validation and sanitization
- Error information is sanitized in production mode

## Version History

### v1.0.0

- Initial release
- Integration of Gemini AI Tools, Chatbot, and Quote Generator
- Event system and error handling
- Comprehensive API documentation

## Support

For issues and questions:

- Check the browser console for error messages
- Enable debug mode for detailed logging
- Contact the development team

## License

© 2024 Yannova Bouw. All rights reserved.
