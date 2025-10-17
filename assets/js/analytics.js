// Analytics en Performance Monitoring voor Yannova
class YannovaAnalytics {
  constructor() {
    this.apiBaseUrl = 'http://localhost:3003/api';
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.pageViews = 0;
    this.events = [];
    this.init();
  }

  init() {
    this.trackPageView();
    this.setupEventListeners();
    this.startPerformanceMonitoring();
    this.trackUserBehavior();
  }

  generateSessionId() {
    return 'analytics_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  trackPageView() {
    this.pageViews++;
    const pageData = {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    this.sendEvent('page_view', pageData);
  }

  setupEventListeners() {
    // Track clicks on important elements
    document.addEventListener('click', (e) => {
      const target = e.target;
      const elementData = {
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        text: target.textContent?.substring(0, 100),
        href: target.href,
        timestamp: new Date().toISOString()
      };

      // Track specific interactions
      if (target.matches('.btn-primary, .btn-submit, .quick-action-btn')) {
        this.sendEvent('button_click', elementData);
      } else if (target.matches('a[href^="#"]')) {
        this.sendEvent('internal_link_click', elementData);
      } else if (target.matches('a[href^="http"]')) {
        this.sendEvent('external_link_click', elementData);
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      const formData = {
        formId: e.target.id,
        formClass: e.target.className,
        action: e.target.action,
        method: e.target.method,
        timestamp: new Date().toISOString()
      };
      this.sendEvent('form_submit', formData);
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        this.sendEvent('scroll_depth', { depth: maxScrollDepth });
      }
    });

    // Track time on page
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - this.startTime;
      this.sendEvent('time_on_page', { duration: timeOnPage });
    });
  }

  startPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.sendEvent('lcp', { value: lastEntry.startTime });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.sendEvent('fid', { value: entry.processingStart - entry.startTime });
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.sendEvent('cls', { value: clsValue });
      }).observe({ entryTypes: ['layout-shift'] });
    }

    // Monitor page load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
        this.sendEvent('page_load_time', { value: loadTime });
      }, 0);
    });
  }

  trackUserBehavior() {
    // Track mouse movement patterns (anonymized)
    let mouseMovements = 0;
    document.addEventListener('mousemove', () => {
      mouseMovements++;
    });

    // Track keyboard usage
    let keystrokes = 0;
    document.addEventListener('keydown', () => {
      keystrokes++;
    });

    // Send behavior data every 30 seconds
    setInterval(() => {
      this.sendEvent('user_behavior', {
        mouseMovements: mouseMovements,
        keystrokes: keystrokes,
        sessionDuration: Date.now() - this.startTime
      });
      mouseMovements = 0;
      keystrokes = 0;
    }, 30000);
  }

  trackChatbotInteraction(action, data = {}) {
    this.sendEvent('chatbot_interaction', {
      action: action,
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  trackQuoteGeneration(data) {
    this.sendEvent('quote_generation', {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  async sendEvent(eventType, eventData) {
    // Validate event parameters
    if (!eventType || eventType === 'undefined') {

      return;
    }

    const event = {
      type: eventType,
      data: eventData || {},
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.events.push(event);

    // Send to API (with error handling)
    try {
      await fetch(`${this.apiBaseUrl}/analytics/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } catch (error) {

      // Store locally for retry
      this.storeEventLocally(event);
    }
  }

  storeEventLocally(event) {
    try {
      const storedEvents = JSON.parse(localStorage.getItem('yannova_analytics_events') || '[]');
      storedEvents.push(event);
      localStorage.setItem('yannova_analytics_events', JSON.stringify(storedEvents));
    } catch (error) {

    }
  }

  async retryStoredEvents() {
    try {
      const storedEvents = JSON.parse(localStorage.getItem('yannova_analytics_events') || '[]');
      if (storedEvents.length > 0) {
        for (const event of storedEvents) {
          await fetch(`${this.apiBaseUrl}/analytics/event`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
          });
        }
        localStorage.removeItem('yannova_analytics_events');
      }
    } catch (error) {

    }
  }

  // Public methods for external use
  trackCustomEvent(eventName, eventData) {
    // Validate parameters before sending
    if (!eventName || eventName === 'undefined' || typeof eventName !== 'string') {
      console.warn('Invalid analytics event name:', eventName);
      return;
    }

    if (!eventData || typeof eventData !== 'object') {
      console.warn('Invalid analytics event data, using empty object');
      eventData = {};
    }

    this.sendEvent(eventName, eventData);
  }

  getSessionStats() {
    return {
      sessionId: this.sessionId,
      pageViews: this.pageViews,
      sessionDuration: Date.now() - this.startTime,
      eventsCount: this.events.length
    };
  }
}

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.yannovaAnalytics = new YannovaAnalytics();

  // Retry stored events on page load
  window.yannovaAnalytics.retryStoredEvents();

  // Process any pending events from quote generator
  if (window.pendingAnalyticsEvents) {
    window.pendingAnalyticsEvents.forEach(({ eventName, data }) => {
      // Validate pending events before processing
      if (eventName && eventName !== 'undefined') {
        window.yannovaAnalytics.trackCustomEvent(eventName, data);
      } else {
        console.warn('Skipping invalid pending analytics event:', eventName);
      }
    });
    window.pendingAnalyticsEvents = [];
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = YannovaAnalytics;
}
