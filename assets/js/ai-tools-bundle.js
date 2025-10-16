/**
 * AI Tools Bundle - Yannova Bouw
 * Integrates all AI functionality including Gemini AI Tools, Chatbot, and Quote Generator
 * Version: 1.0.0
 * Author: Yannova Bouw Development Team
 */

class YannovaAIToolsBundle {
  constructor(config = {}) {
    this.config = {
      apiEndpoint: config.apiEndpoint || "/api/ai-tools",
      geminiApiKey: config.geminiApiKey || null,
      enableChatbot: config.enableChatbot !== false,
      enableQuoteGenerator: config.enableQuoteGenerator !== false,
      enableGeminiTools: config.enableGeminiTools !== false,
      debugMode: config.debugMode || false,
      ...config,
    };

    this.instances = {};
    this.isInitialized = false;
    this.eventListeners = new Map();

    this.init();
  }

  async init() {
    try {
      this.log("Initializing AI Tools Bundle...");

      // Initialize Gemini AI Tools
      if (this.config.enableGeminiTools) {
        this.instances.geminiTools = new GeminiAITools();
        this.log("Gemini AI Tools initialized");
      }

      // Initialize AI Chatbot
      if (this.config.enableChatbot) {
        this.instances.chatbot = new YannovaAIChatbot();
        this.log("AI Chatbot initialized");
      }

      // Initialize Quote Generator
      if (this.config.enableQuoteGenerator) {
        this.instances.quoteGenerator = new YannovaAIQuoteGenerator();
        this.log("AI Quote Generator initialized");
      }

      // Setup global event handlers
      this.setupEventHandlers();

      // Setup error handling
      this.setupErrorHandling();

      this.isInitialized = true;
      this.emit("bundle:initialized", {
        instances: Object.keys(this.instances),
      });
      this.log("AI Tools Bundle initialized successfully");
    } catch (error) {
      this.handleError("Bundle initialization failed", error);
      throw error;
    }
  }

  // Gemini AI Tools Methods
  async generateVideo(options) {
    this.ensureInitialized("geminiTools");
    try {
      this.emit("video:generation:start", options);
      const result = await this.instances.geminiTools.generateVideo(options);
      this.emit("video:generation:complete", result);
      return result;
    } catch (error) {
      this.handleError("Video generation failed", error);
      throw error;
    }
  }

  async generateContent(options) {
    this.ensureInitialized("geminiTools");
    try {
      this.emit("content:generation:start", options);
      const result = await this.instances.geminiTools.generateContent(options);
      this.emit("content:generation:complete", result);
      return result;
    } catch (error) {
      this.handleError("Content generation failed", error);
      throw error;
    }
  }

  async generateQuote(options) {
    this.ensureInitialized("geminiTools");
    try {
      this.emit("quote:generation:start", options);
      const result = await this.instances.geminiTools.generateQuote(options);
      this.emit("quote:generation:complete", result);
      return result;
    } catch (error) {
      this.handleError("Quote generation failed", error);
      throw error;
    }
  }

  async generateProjectPlan(options) {
    this.ensureInitialized("geminiTools");
    try {
      this.emit("project-plan:generation:start", options);
      const result =
        await this.instances.geminiTools.generateProjectPlan(options);
      this.emit("project-plan:generation:complete", result);
      return result;
    } catch (error) {
      this.handleError("Project plan generation failed", error);
      throw error;
    }
  }

  async generateCustomerResponse(options) {
    this.ensureInitialized("geminiTools");
    try {
      this.emit("customer-response:generation:start", options);
      const result =
        await this.instances.geminiTools.generateCustomerResponse(options);
      this.emit("customer-response:generation:complete", result);
      return result;
    } catch (error) {
      this.handleError("Customer response generation failed", error);
      throw error;
    }
  }

  async generateAnalytics(options) {
    this.ensureInitialized("geminiTools");
    try {
      this.emit("analytics:generation:start", options);
      const result =
        await this.instances.geminiTools.generateAnalytics(options);
      this.emit("analytics:generation:complete", result);
      return result;
    } catch (error) {
      this.handleError("Analytics generation failed", error);
      throw error;
    }
  }

  async generateReport(options) {
    this.ensureInitialized("geminiTools");
    try {
      this.emit("report:generation:start", options);
      const result = await this.instances.geminiTools.generateReport(options);
      this.emit("report:generation:complete", result);
      return result;
    } catch (error) {
      this.handleError("Report generation failed", error);
      throw error;
    }
  }

  async generateDesign(options) {
    this.ensureInitialized("geminiTools");
    try {
      this.emit("design:generation:start", options);
      const result = await this.instances.geminiTools.generateDesign(options);
      this.emit("design:generation:complete", result);
      return result;
    } catch (error) {
      this.handleError("Design generation failed", error);
      throw error;
    }
  }

  // AI Chatbot Methods
  async processChatMessage(message, options = {}) {
    this.ensureInitialized("chatbot");
    try {
      this.emit("chat:message:start", { message, options });
      const result = await this.instances.chatbot.processMessage(message);
      this.emit("chat:message:complete", result);
      return result;
    } catch (error) {
      this.handleError("Chat message processing failed", error);
      throw error;
    }
  }

  getChatSuggestions(intent = null) {
    this.ensureInitialized("chatbot");
    return this.instances.chatbot.generateSuggestions({ intent });
  }

  getChatUserProfile() {
    this.ensureInitialized("chatbot");
    return this.instances.chatbot.userProfile;
  }

  // AI Quote Generator Methods
  async generateDetailedQuote(requirements) {
    this.ensureInitialized("quoteGenerator");
    try {
      this.emit("detailed-quote:generation:start", requirements);
      const result =
        await this.instances.quoteGenerator.generateQuote(requirements);
      this.emit("detailed-quote:generation:complete", result);
      return result;
    } catch (error) {
      this.handleError("Detailed quote generation failed", error);
      throw error;
    }
  }

  getQuoteRecommendations(requirements) {
    this.ensureInitialized("quoteGenerator");
    return this.instances.quoteGenerator.generateAIRecommendations(
      requirements,
    );
  }

  // Utility Methods
  async getBundleStatus() {
    return {
      initialized: this.isInitialized,
      instances: Object.keys(this.instances),
      config: this.config,
      uptime: Date.now() - (this.initTime || Date.now()),
      memory: this.getMemoryUsage(),
    };
  }

  async testAllTools() {
    const results = {};

    // Test Gemini Tools
    if (this.instances.geminiTools) {
      try {
        results.geminiTools = await this.testGeminiTools();
      } catch (error) {
        results.geminiTools = { success: false, error: error.message };
      }
    }

    // Test Chatbot
    if (this.instances.chatbot) {
      try {
        results.chatbot = await this.testChatbot();
      } catch (error) {
        results.chatbot = { success: false, error: error.message };
      }
    }

    // Test Quote Generator
    if (this.instances.quoteGenerator) {
      try {
        results.quoteGenerator = await this.testQuoteGenerator();
      } catch (error) {
        results.quoteGenerator = { success: false, error: error.message };
      }
    }

    return results;
  }

  async testGeminiTools() {
    const testResult = await this.instances.geminiTools.generateContent({
      contentType: "test",
      topic: "AI Tools Bundle Test",
      length: "short",
      tone: "professional",
      keywords: ["test", "ai", "bundle"],
    });
    return { success: true, testResult };
  }

  async testChatbot() {
    const testResult =
      await this.instances.chatbot.processMessage("Test bericht");
    return { success: true, testResult };
  }

  async testQuoteGenerator() {
    const testRequirements = {
      klant: { naam: "Test Klant" },
      projectType: "ramen-deuren",
      ramen: [
        {
          materiaal: "kunststof",
          glas: "hr++",
          aantal: 1,
          afmetingen: { breedte: 100, hoogte: 120 },
        },
      ],
    };
    const testResult =
      await this.instances.quoteGenerator.generateQuote(testRequirements);
    return { success: true, testResult };
  }

  // Event System
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          this.handleError(`Event callback error for ${event}`, error);
        }
      });
    }
  }

  // Helper Methods
  ensureInitialized(instanceName) {
    if (!this.isInitialized) {
      throw new Error("AI Tools Bundle is not initialized");
    }
    if (!this.instances[instanceName]) {
      throw new Error(
        `${instanceName} is not available in this bundle configuration`,
      );
    }
  }

  setupEventHandlers() {
    // Global error handler
    window.addEventListener("error", (event) => {
      this.handleError("Global error caught", event.error);
    });

    // Unhandled promise rejection handler
    window.addEventListener("unhandledrejection", (event) => {
      this.handleError("Unhandled promise rejection", event.reason);
    });
  }

  setupErrorHandling() {
    // Setup custom error handlers for each instance
    Object.keys(this.instances).forEach((instanceName) => {
      const instance = this.instances[instanceName];
      if (instance.addEventListener) {
        instance.addEventListener("error", (error) => {
          this.handleError(`${instanceName} error`, error);
        });
      }
    });
  }

  handleError(message, error) {
    const errorData = {
      message,
      error: error?.message || error,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      bundleVersion: "1.0.0",
    };

    this.emit("bundle:error", errorData);

    if (this.config.debugMode) {
      console.error("[AI Tools Bundle Error]", errorData);
    }
  }

  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }
    return null;
  }

  log(message, data = null) {
    if (this.config.debugMode) {
      console.log(`[AI Tools Bundle] ${message}`, data);
    }
  }

  // Static factory method
  static async create(config = {}) {
    const bundle = new YannovaAIToolsBundle(config);
    await bundle.init();
    return bundle;
  }

  // Cleanup method
  destroy() {
    this.eventListeners.clear();
    this.instances = {};
    this.isInitialized = false;
    this.log("AI Tools Bundle destroyed");
  }
}

// AI Dashboard Integration
class AIToolsManager {
  constructor() {
    this.currentTool = null;
    this.isProcessing = false;
    this.activityLog = [];
    this.settings = {
      autoGeneration: false,
      contentQuality: "high",
      apiStatus: "checking",
    };

    this.init();
  }

  async init() {
    await this.loadAIModules();
    this.bindEvents();
    this.checkAPIStatus();
    this.loadRecentActivity();
    this.initializeSettings();
  }

  async loadAIModules() {
    try {
      // Load AI Chatbot
      if (typeof YannovaAIChatbot !== "undefined") {
        window.yannovaAIChatbot = new YannovaAIChatbot();
      }

      // Load AI Quote Generator
      if (typeof YannovaAIQuoteGenerator !== "undefined") {
        window.yannovaAIQuoteGenerator = new YannovaAIQuoteGenerator();
      }

      // Load Quote Processor
      if (typeof YannovaQuoteProcessor !== "undefined") {
        window.yannovaQuoteProcessor = new YannovaQuoteProcessor();
      }

      console.log("AI modules loaded successfully");
    } catch (error) {
      console.error("Failed to load AI modules:", error);
      this.showNotification("AI modules laden mislukt", "error");
    }
  }

  bindEvents() {
    // Modal close events
    document.querySelector(".modal-close")?.addEventListener("click", () => {
      this.closeCurrentTool();
    });

    // Settings changes
    document
      .getElementById("auto-generation")
      ?.addEventListener("change", (e) => {
        this.settings.autoGeneration = e.target.checked;
        this.saveSettings();
      });

    document
      .getElementById("content-quality")
      ?.addEventListener("change", (e) => {
        this.settings.contentQuality = e.target.value;
        this.saveSettings();
      });

    // Refresh activity button
    window.refreshActivity = () => {
      this.loadRecentActivity();
    };
  }

  async checkAPIStatus() {
    const statusElement = document.getElementById("api-status");
    const statusText = document.getElementById("api-status-text");

    try {
      const response = await fetch("/api/ai/status", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.settings.apiStatus = "connected";
        statusElement.className = "status-indicator online";
        statusText.textContent = "Connected";
      } else {
        throw new Error("API not responding");
      }
    } catch (error) {
      this.settings.apiStatus = "offline";
      statusElement.className = "status-indicator offline";
      statusText.textContent = "Offline";
    }
  }

  async loadRecentActivity() {
    const activityList = document.getElementById("activity-list");

    try {
      const response = await fetch("/api/ai/activity", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.activityLog = data.activities || [];
        this.renderActivity();
      } else {
        // Load from localStorage as fallback
        this.activityLog = JSON.parse(
          localStorage.getItem("aiActivityLog") || "[]",
        );
        this.renderActivity();
      }
    } catch (error) {
      console.error("Failed to load activity:", error);
      this.activityLog = JSON.parse(
        localStorage.getItem("aiActivityLog") || "[]",
      );
      this.renderActivity();
    }
  }

  renderActivity() {
    const activityList = document.getElementById("activity-list");

    if (this.activityLog.length === 0) {
      activityList.innerHTML = `
                <div class="no-activity">
                    <i class="fas fa-robot"></i>
                    <p>Geen recente AI activiteit</p>
                </div>
            `;
      return;
    }

    activityList.innerHTML = this.activityLog
      .slice(0, 10)
      .map(
        (activity) => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas ${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                </div>
                <div class="activity-status ${activity.status}">
                    <i class="fas ${activity.status === "success" ? "fa-check" : "fa-exclamation-triangle"}"></i>
                </div>
            </div>
        `,
      )
      .join("");
  }

  getActivityIcon(type) {
    const icons = {
      quote: "fa-file-invoice",
      content: "fa-pen-fancy",
      video: "fa-video",
      planning: "fa-calendar-alt",
      analytics: "fa-chart-line",
      design: "fa-cube",
    };
    return icons[type] || "fa-robot";
  }

  formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return "zojuist";
    if (diff < 3600) return `${Math.floor(diff / 60)} min geleden`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} uur geleden`;
    return `${Math.floor(diff / 86400)} dagen geleden`;
  }

  initializeSettings() {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("aiToolsSettings");
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }

    // Apply settings to UI
    document.getElementById("auto-generation").checked =
      this.settings.autoGeneration;
    document.getElementById("content-quality").value =
      this.settings.contentQuality;
  }

  saveSettings() {
    localStorage.setItem("aiToolsSettings", JSON.stringify(this.settings));
  }

  logActivity(type, title, description, status = "success") {
    const activity = {
      id: Date.now(),
      type,
      title,
      description,
      status,
      timestamp: new Date().toISOString(),
    };

    this.activityLog.unshift(activity);

    // Keep only last 50 activities
    if (this.activityLog.length > 50) {
      this.activityLog = this.activityLog.slice(0, 50);
    }

    // Save to localStorage
    localStorage.setItem("aiActivityLog", JSON.stringify(this.activityLog));

    // Update UI
    this.renderActivity();

    // Send to server if online
    if (this.settings.apiStatus === "connected") {
      this.sendActivityToServer(activity);
    }
  }

  async sendActivityToServer(activity) {
    try {
      await fetch("/api/ai/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(activity),
      });
    } catch (error) {
      console.error("Failed to send activity to server:", error);
    }
  }

  showLoading() {
    document.getElementById("loading-overlay").style.display = "flex";
  }

  hideLoading() {
    document.getElementById("loading-overlay").style.display = "none";
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `ai-notification ai-notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}"></i>
                <span>${message}</span>
            </div>
        `;

    // Style the notification
    Object.assign(notification.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      background:
        type === "success"
          ? "#27ae60"
          : type === "error"
            ? "#e74c3c"
            : "#3498db",
      color: "white",
      padding: "12px 20px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: "10000",
      maxWidth: "300px",
      fontSize: "14px",
      lineHeight: "1.4",
      animation: "slideInRight 0.3s ease",
    });

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }

  closeCurrentTool() {
    const modal = document.getElementById("ai-tool-modal");
    if (modal) {
      modal.classList.remove("show");
    }
    this.currentTool = null;
  }
}

// Global function to open AI tools
window.openAITool = async function (toolType) {
  if (!window.aiToolsManager) {
    window.aiToolsManager = new AIToolsManager();
  }

  const manager = window.aiToolsManager;
  const modal = document.getElementById("ai-tool-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");

  // Set current tool
  manager.currentTool = toolType;

  // Configure modal based on tool type
  switch (toolType) {
    case "quote-generator":
      modalTitle.textContent = "Intelligent Quote Generator";
      modalBody.innerHTML = await manager.getQuoteGeneratorContent();
      break;

    case "content-writer":
      modalTitle.textContent = "Smart Content Writer";
      modalBody.innerHTML = await manager.getContentWriterContent();
      break;

    case "customer-service":
      modalTitle.textContent = "Customer Service AI";
      modalBody.innerHTML = await manager.getCustomerServiceContent();
      break;

    default:
      modalTitle.textContent = "AI Tool";
      modalBody.innerHTML = "<p>Tool wordt geladen...</p>";
  }

  // Show modal
  modal.classList.add("show");
};

// Global function to close AI tools
window.closeAITool = function () {
  if (window.aiToolsManager) {
    window.aiToolsManager.closeCurrentTool();
  }
};

// Tool action functions
window.generateAIQuote = async function () {
  if (!window.aiToolsManager || !window.yannovaAIQuoteGenerator) return;

  const manager = window.aiToolsManager;
  manager.showLoading();

  try {
    const quoteData = {
      projectType: document.getElementById("quote-project-type").value,
      quality: document.getElementById("quote-quality").value,
      dimensions: document.getElementById("quote-dimensions").value,
      materials: document.getElementById("quote-materials").value,
      specialRequirements: document.getElementById("quote-special-requirements")
        .value,
    };

    const quote = await window.yannovaAIQuoteGenerator.generateQuote(quoteData);
    displayQuoteResult(quote);
    manager.logActivity(
      "quote",
      "Offerte Genereerd",
      `${quoteData.projectType} - ${quoteData.materials}`,
      "success",
    );
  } catch (error) {
    console.error("Error generating quote:", error);
    manager.showNotification("Offerte genereren mislukt", "error");
    manager.logActivity(
      "quote",
      "Offerte Genereren Mislukt",
      error.message,
      "error",
    );
  } finally {
    manager.hideLoading();
  }
};

window.sendAIMessage = async function () {
  if (!window.aiToolsManager || !window.yannovaAIChatbot) return;

  const input = document.getElementById("ai-chat-input");
  const message = input.value.trim();

  if (!message) return;

  const chatMessages = document.getElementById("ai-chat-messages");

  // Add user message
  const userMessage = document.createElement("div");
  userMessage.className = "message user-message";
  userMessage.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
  chatMessages.appendChild(userMessage);

  input.value = "";

  try {
    // Get AI response
    const response = await window.yannovaAIChatbot.getResponse(message);

    // Add AI message
    const aiMessage = document.createElement("div");
    aiMessage.className = "message ai-message";
    aiMessage.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>${response}</p>
            </div>
        `;
    chatMessages.appendChild(aiMessage);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (error) {
    console.error("Error getting AI response:", error);

    const errorMessage = document.createElement("div");
    errorMessage.className = "message ai-message";
    errorMessage.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>Sorry, er is een fout opgetreden. Probeer het opnieuw.</p>
            </div>
        `;
    chatMessages.appendChild(errorMessage);
  }
};

// Helper functions
function displayQuoteResult(quote) {
  const resultDiv = document.getElementById("quote-result");
  if (!resultDiv) return;

  resultDiv.innerHTML = `
        <div class="quote-result">
            <h4>Generated Quote</h4>
            <div class="quote-details">
                <p><strong>Project:</strong> ${quote.projectType}</p>
                <p><strong>Materials:</strong> ${quote.materials}</p>
                <p><strong>Total Price:</strong> €${quote.totalPrice}</p>
                <p><strong>Estimated Duration:</strong> ${quote.duration}</p>
            </div>
            <div class="quote-actions">
                <button class="btn btn-primary" onclick="saveQuote('${JSON.stringify(quote).replace(/'/g, "\\'")}')">
                    <i class="fas fa-save"></i> Save Quote
                </button>
                <button class="btn btn-secondary" onclick="exportQuote('${JSON.stringify(quote).replace(/'/g, "\\'")}')">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        </div>
    `;
  resultDiv.style.display = "block";
}

// Add content generation methods to AIToolsManager prototype
AIToolsManager.prototype.getQuoteGeneratorContent = async function () {
  return `
        <div class="ai-tool-content">
            <div class="tool-description">
                <p>Genereer realistische offertes met AI-ondersteunde prijsbepaling en materiaalkeuze.</p>
            </div>
            
            <div class="tool-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="quote-project-type">Project Type</label>
                        <select id="quote-project-type">
                            <option value="ramen">Ramen Vervangen</option>
                            <option value="deuren">Deuren Vervangen</option>
                            <option value="renovatie">Complete Renovatie</option>
                            <option value="nieuwbouw">Nieuwbouw</option>
                            <option value="schuifpui">Schuifpui</option>
                            <option value="dakkapel">Dakkapel</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="quote-quality">Kwaliteit</label>
                        <select id="quote-quality">
                            <option value="basis">Basis</option>
                            <option value="comfort">Comfort</option>
                            <option value="luxury">Luxe</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="quote-dimensions">Afmetingen (breedte x hoogte in meters)</label>
                    <input type="text" id="quote-dimensions" placeholder="bv: 2.0 x 2.4">
                </div>
                
                <div class="form-group">
                    <label for="quote-materials">Materiaal Voorkeur</label>
                    <select id="quote-materials">
                        <option value="hout">Hout</option>
                        <option value="kunststof">Kunststof</option>
                        <option value="aluminium">Aluminium</option>
                        <option value="staal">Staal</option>
                        <option value="hybride">Hybride</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="quote-special-requirements">Speciale Eisen</label>
                    <textarea id="quote-special-requirements" rows="3" placeholder="bv. Geluidsisolatie, veiligheidsglas, etc."></textarea>
                </div>
                
                <div class="tool-actions">
                    <button class="btn btn-primary" onclick="generateAIQuote()">
                        <i class="fas fa-magic"></i> Genereer Offerte
                    </button>
                    <button class="btn btn-secondary" onclick="resetQuoteForm()">
                        <i class="fas fa-redo"></i> Reset
                    </button>
                </div>
            </div>
            
            <div id="quote-result" class="tool-result" style="display: none;">
                <!-- Quote result will be displayed here -->
            </div>
        </div>
    `;
};

AIToolsManager.prototype.getContentWriterContent = async function () {
  return `
        <div class="ai-tool-content">
            <div class="tool-description">
                <p>Genereer SEO-geoptimaliseerde content voor projecten, blog posts en webpagina's.</p>
            </div>
            
            <div class="tool-form">
                <div class="form-group">
                    <label for="content-type">Content Type</label>
                    <select id="content-type">
                        <option value="project-beschrijving">Project Beschrijving</option>
                        <option value="blog-post">Blog Post</option>
                        <option value="product-pagina">Product Pagina</option>
                        <option value="service-omschrijving">Service Omschrijving</option>
                        <option value="case-study">Case Study</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="content-topic">Onderwerp</label>
                    <input type="text" id="content-topic" placeholder="bv: Ramen vervangen in Amsterdam">
                </div>
                
                <div class="form-group">
                    <label for="content-keywords">Keywords (comma separated)</label>
                    <input type="text" id="content-keywords" placeholder="bv: ramen, deuren, renovatie, amsterdam">
                </div>
                
                <div class="form-group">
                    <label for="content-tone">Toon</label>
                    <select id="content-tone">
                        <option value="professioneel">Professioneel</option>
                        <option value="vriendelijk">Vriendelijk</option>
                        <option value="technisch">Technisch</option>
                        <option value="overtuigend">Overtuigend</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="content-length">Lengte</label>
                    <select id="content-length">
                        <option value="kort">Kort (150-300 woorden)</option>
                        <option value="medium">Medium (300-600 woorden)</option>
                        <option value="lang">Lang (600-1000 woorden)</option>
                    </select>
                </div>
                
                <div class="tool-actions">
                    <button class="btn btn-primary" onclick="generateAIContent()">
                        <i class="fas fa-pen"></i> Genereer Content
                    </button>
                    <button class="btn btn-secondary" onclick="resetContentForm()">
                        <i class="fas fa-redo"></i> Reset
                    </button>
                </div>
            </div>
            
            <div id="content-result" class="tool-result" style="display: none;">
                <!-- Content result will be displayed here -->
            </div>
        </div>
    `;
};

AIToolsManager.prototype.getCustomerServiceContent = async function () {
  return `
        <div class="ai-tool-content">
            <div class="tool-description">
                <p>AI-ondersteunde klantenservice met geautomatiseerde antwoorden en support.</p>
            </div>
            
            <div class="chat-interface">
                <div class="chat-messages" id="ai-chat-messages">
                    <div class="message ai-message">
                        <div class="message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <p>Hallo! Ik ben de AI assistent van Yannova Bouw. Hoe kan ik u helpen met vragen over ramen, deuren of renovatieprojecten?</p>
                        </div>
                    </div>
                </div>
                
                <div class="chat-input">
                    <input type="text" id="ai-chat-input" placeholder="Typ uw vraag hier...">
                    <button class="btn btn-primary" onclick="sendAIMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
};

// Auto-initialize if script is loaded directly
if (typeof window !== "undefined" && !window.yannovaAIBundle) {
  window.yannovaAIBundle = new YannovaAIToolsBundle();
}

// Initialize AI Tools Manager for admin dashboard
if (
  typeof window !== "undefined" &&
  window.location.pathname.includes("ai-dashboard")
) {
  document.addEventListener("DOMContentLoaded", () => {
    window.aiToolsManager = new AIToolsManager();
  });
}

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = YannovaAIToolsBundle;
}

if (typeof define === "function" && define.amd) {
  define([], function () {
    return YannovaAIToolsBundle;
  });
}
